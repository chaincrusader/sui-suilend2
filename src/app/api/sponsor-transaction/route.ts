import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { transactionBytes, address } = payload;

    if (!transactionBytes || !address) {
      console.error("Invalid payload received:", payload);
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error("Backend URL is not defined in environment variables");
      throw new Error("Backend URL is not defined in environment variables");
    }

    console.log(
      `Sending request to backend: ${backendUrl}/api/sponsor-transaction`
    );
    const response = await fetch(`${backendUrl}/api/sponsor-transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Backend responded with status: ${response.status}, body: ${errorText}`
      );
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const sponsoredTxData = await response.json();
    console.log("Received sponsored transaction data:", sponsoredTxData);

    return NextResponse.json(sponsoredTxData);
  } catch (error) {
    console.error("Error executing transaction:", error);
    return NextResponse.json(
      {
        error: "Failed to execute transaction",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
