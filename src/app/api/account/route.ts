// sui-app/src/app/api/account/route.ts

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { address } = payload;

    if (!address) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error("Backend URL is not defined in environment variables");
    }

    // Get the template from the environment variable
    const template = process.env.NEXT_PUBLIC_TEMPLATE || "DEEP";

    // Add the template to the payload
    const updatedPayload = {
      ...payload,
      template,
    };

    const response = await fetch(`${backendUrl}/api/account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPayload),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const accountInfo = await response.json();

    const noCacheResponse = NextResponse.json(accountInfo);
    noCacheResponse.headers.set("Cache-Control", "no-store, max-age=0");
    noCacheResponse.headers.set("Pragma", "no-cache");
    return noCacheResponse;
  } catch (error) {
    console.error("Error processing account info request:", error);
    return NextResponse.json(
      { error: "Failed to process account info request" },
      { status: 500 }
    );
  }
}
