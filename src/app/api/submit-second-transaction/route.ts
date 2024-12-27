// sui-app/src/app/api/submit-second-transaction/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { bytes, signature, address, reservationId } = payload;

    if (!bytes || !signature || !address || !reservationId) {
      console.error("Invalid payload received:", payload);
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error("Backend URL is not defined in environment variables");
    }

    console.log(
      "Sending submit-second-transaction request to backend",
      `for address: ${address}`,
      `with reservation ID: ${reservationId}`
    );

    const response = await fetch(
      `${backendUrl}/api/submit-second-transaction`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bytes,
          signature,
          address,
          reservationId,
        }),
      }
    );

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
    console.error("Error submitting second transaction:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit second transaction",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
