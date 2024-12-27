import { SuiClient, SuiHTTPTransport } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { NextResponse } from "next/server";

const suiClient = new SuiClient({
  transport: new SuiHTTPTransport({
    url: process.env.SUI_RPC || "https://fullnode.mainnet.sui.io:443",
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received request body:", JSON.stringify(body, null, 2));
    const { method, params } = body;
    let responseData;

    if (method === "dryRunTransactionBlock") {
      responseData = await handleDryRun(params);
    } else if (method === "getObject") {
      responseData = await handleGetObject(params);
    } else {
      responseData = { error: "Unsupported method" };
      return createNoCacheResponse(responseData, 400);
    }

    return createNoCacheResponse(responseData);
  } catch (error) {
    console.error("Error in SUI RPC call:", error);
    const responseData = {
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    };
    return createNoCacheResponse(responseData, 500);
  }
}

async function handleDryRun(params: Record<string, unknown>) {
  console.log("Dry run params:", JSON.stringify(params, null, 2));

  if (
    !params ||
    !params.transactionBlock ||
    !params.sender ||
    (params.sponsored && !params.sponsorAddress)
  ) {
    return { error: "Missing required parameters" };
  }

  try {
    const tx = TransactionBlock.from(params.transactionBlock as string);

    if (params.sponsored) {
      // Get the latest gas price
      const referenceGasPrice = await suiClient.getReferenceGasPrice();

      // Set gas budget (you may want to calculate this based on the transaction complexity)
      const gasBudget = BigInt(10000000); // 0.01 SUI

      // Get a valid gas coin from the sponsor
      const coins = await suiClient.getCoins({
        owner: params.sponsorAddress as string,
        coinType: "0x2::sui::SUI",
      });

      if (coins.data.length === 0) {
        throw new Error("No valid gas coins found for the sponsor");
      }

      const gasCoin = coins.data[0];

      // Set transaction properties
      tx.setGasBudget(gasBudget);
      tx.setGasPrice(referenceGasPrice);
      tx.setGasPayment([
        {
          objectId: gasCoin.coinObjectId,
          digest: gasCoin.digest,
          version: gasCoin.version,
        },
      ]);
      tx.setSender(params.sender as string);
      tx.setGasOwner(params.sponsorAddress as string);
    }

    // Build the transaction
    const txBytes = await tx.build({ client: suiClient });

    const result = await suiClient.dryRunTransactionBlock({
      transactionBlock: txBytes,
    });

    console.log("Dry run result:", JSON.stringify(result, null, 2));

    return {
      success: result.effects.status.status === "success",
      result: result,
    };
  } catch (error) {
    console.error("Dry run error:", error);
    return {
      error: "Dry run failed",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

async function handleGetObject(params: unknown[]) {
  if (!params || !params[0]) {
    return { error: "Missing object ID in params" };
  }

  const objectId = params[0] as string;
  try {
    const result = await suiClient.getObject({
      id: objectId,
      options: { showContent: true, showOwner: true },
    });
    console.log("Get object result:", JSON.stringify(result, null, 2));
    return { result };
  } catch (error) {
    console.error("Get object error:", error);
    return {
      error: "Get object failed",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function createNoCacheResponse(data: unknown, status = 200) {
  const response = NextResponse.json(data, { status });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  return response;
}
