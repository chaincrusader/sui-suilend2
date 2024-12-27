// sui-app/src/app/api/submit-transaction/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const {
      bytes,
      signature,
      address,
      partnerId,
      accountInfo,
      reservationId,
      isSecondTransaction,
      hasSecondTransaction,
    } = payload;

    if (
      !bytes ||
      !signature ||
      !address ||
      !partnerId ||
      !accountInfo ||
      !reservationId ||
      typeof isSecondTransaction !== "boolean" ||
      typeof hasSecondTransaction !== "boolean" ||
      !accountInfo.walletName
    ) {
      console.error("Invalid payload received:", payload);
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error("Backend URL is not defined in environment variables");
    }

    console.log(
      "Sending submit-transaction request to backend",
      `for address: ${address}`,
      `with reservation ID: ${reservationId}`,
      isSecondTransaction ? "for second transaction" : "for first transaction"
    );

    const response = await fetch(`${backendUrl}/api/submit-transaction`, {
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
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Backend responded with status: ${response.status}, message: ${
          errorData.error || "Unknown error"
        }`
      );
    }

    const result = await response.json();

    const noCacheResponse = NextResponse.json(result);
    noCacheResponse.headers.set("Cache-Control", "no-store, max-age=0");
    noCacheResponse.headers.set("Pragma", "no-cache");
    return noCacheResponse;
  } catch (error) {
    console.error("Error submitting transaction:", error);
    return NextResponse.json(
      {
        error: "Failed to submit transaction",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
