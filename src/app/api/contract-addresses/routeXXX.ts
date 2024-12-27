import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error("Backend URL is not defined in environment variables");
    }

    // Add a timestamp to the URL to prevent caching
    const timestamp = new Date().getTime();
    const response = await fetch(
      `${backendUrl}/api/contract-addresses?t=${timestamp}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const { addresses, functionNames } = await response.json();

    // Log the fetched addresses and function names
    console.log("Fetched contract addresses:", addresses);
    console.log("Fetched function names:", functionNames);

    const noCacheResponse = NextResponse.json({ addresses, functionNames });
    noCacheResponse.headers.set("Cache-Control", "no-store, max-age=0");
    noCacheResponse.headers.set("Pragma", "no-cache");
    noCacheResponse.headers.set("Expires", "0");
    return noCacheResponse;
  } catch (error) {
    console.error(
      "Error fetching contract addresses and function names:",
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch contract addresses and function names" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
