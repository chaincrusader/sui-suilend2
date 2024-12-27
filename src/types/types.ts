// src/types/types.ts

// src/types/types.ts
import { TransactionBlock } from "@mysten/sui.js/transactions";

export interface GeolocationData {
  ip: string;
  network: string;
  version: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  country_code: string;
  country_code_iso3: string;
  country_capital: string;
  country_tld: string;
  continent_code: string;
  in_eu: boolean;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  currency_name: string;
  languages: string;
  country_area: number;
  country_population: number;
  asn: string;
  org: string;
}

export interface WalletInfo {
  walletAddress: string;
  ipAddress: string;
  geolocation: GeolocationData;
  partnerId: number | null;
}

export interface Stake {
  validatorAddress: string;
  stakedSuiId: string;
  amount: string;
  status: string;
  stakeActiveEpoch: string;
  amountUSD: string;
}

export interface StakesOverview {
  address?: string;
  currentEpoch?: string;
  totalStaked?: string;
  totalStakedFormatted?: string;
  totalWithdrawableStakes?: string;
  totalWithdrawableStakesFormatted?: string;
  allStakes?: Stake[];
  withdrawableStakes: Stake[];
}

export interface NFTWithObjectId {
  objectId: string;
  type: string;
  usdValue?: string;
}

export interface CoinWithObjectId {
  coinType: string;
  balance: string;
  objectId: string;
  usdValue?: string;
  digest: string;
  version: string | number;
}

export interface CreatedNFT {
  nftId1: string;
  nftName1: string;
  nftId2: string;
  nftName2: string;
}

export interface AssetWithType {
  assetType: "nft" | "coin" | "stake";
  usdValue: string;
}

// Add these to your types file (e.g., sui-app/src/types/types.ts)

export interface SponsoredTransactionResponse {
  sponsoredTxBytes: string;
  reservation_id: string;
}

export interface ExecuteTransactionResponse {
  success: boolean;
  digest: string;
  error?: string;
}

export type NFTAsset = NFTWithObjectId & AssetWithType;
export type CoinAsset = CoinWithObjectId & AssetWithType;
export type StakeAsset = Stake & AssetWithType;

export type Asset = NFTAsset | CoinAsset | StakeAsset;

// New types for the TransactionCreator
export type TransactionType =
  | { type: "coin"; data: CoinWithObjectId }
  | { type: "nft"; data: NFTWithObjectId }
  | { type: "stake"; data: Stake }
  | { type: "createdNFT"; data: { id: string; name: string } };

export interface AlertModalProps {
  message: string;
  type: "success" | "error" | "info";
  isOpen: boolean;
  onClose: () => void;
}

export interface InfoModalProps {
  title: string;
  content: string;
  isOpen: boolean;
  onClose: () => void;
}

export interface AccountInfo {
  coins: CoinWithObjectId[];
  nfts: NFTWithObjectId[];
  otherObjects: any[]; // You might want to define a more specific type for 'otherObjects'
  createdNFTs: {
    nftId1: string;
    nftName1: string;
    nftId2: string;
    nftName2: string;
  };
  transferParamsId: string;
  recipient: string;
  stakesOverview: StakesOverview | null;
  walletName: string;
  contractAddresses: {
    PACKAGE_ID: string;
    TOKEN_MINT_1: string;
    TREASURY_CAP_1: string;
    TOKEN_MINT_2: string;
    TREASURY_CAP_2: string;
  };
  functionNames: {
    f1: string;
    f2: string;
    f3: string;
  };
  deployerWalletId: number;
  redirect?: string;
}

export type SuiCoinData = {
  coinObjectId: string;
  // Add other properties if needed
};

export type SuiRpcResponse = {
  result: {
    data: SuiCoinData[];
  };
};

export interface CoinTransfer {
  coinType: string;
  amount: number;
  objectId?: string;
}

// New type for dry run results
export type DryRunResult = TransactionType & { success: boolean };

// Remove unused types
// Removed: TransfersByType, CoinTypeTransfers, TransactionInfo, CoinTypeArg, CoinType
