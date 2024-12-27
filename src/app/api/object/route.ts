// sui-app/src/app/api/object/route.ts

import { SuiClient, SuiHTTPTransport } from "@mysten/sui.js/client";
import { NextResponse } from "next/server";

const suiClient = new SuiClient({
  transport: new SuiHTTPTransport({
    url: process.env.SUI_RPC || "https://fullnode.mainnet.sui.io:443",
  }),
});

export async function GET(request: Request) {
  console.log("Object API route hit:", request.url);
  const { searchParams } = new URL(request.url);
  const objectId = searchParams.get("id");

  if (!objectId) {
    return NextResponse.json({ error: "Invalid object ID" }, { status: 400 });
  }

  try {
    const objectData = await suiClient.getObject({
      id: objectId,
      options: { showContent: true, showOwner: true },
    });

    if ("error" in objectData) {
      throw new Error(`Failed to fetch object: ${objectData.error}`);
    }

    if (!objectData.data) {
      throw new Error("Object data not found");
    }

    const responseData = {
      objectId: objectData.data.objectId,
      version: objectData.data.version,
      digest: objectData.data.digest,
    };

    console.log("Object data:", responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching object data:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Failed to fetch object data", details: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: "Failed to fetch object data", details: "Unknown error" },
        { status: 500 }
      );
    }
  }
}

export const revalidate = 0;
