// sui-app/src/app/api/get-domain/route.ts

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("Get domain API route hit:", request.url);

  try {
    const body = await request.json();

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error("Backend URL is not defined in environment variables");
    }

    const response = await fetch(`${backendUrl}/api/getDomain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }
    //test
    const data = await response.json();

    console.log("Domain data:", data);
    const noCacheResponse = NextResponse.json(data);
    noCacheResponse.headers.set("Cache-Control", "no-store, max-age=0");
    noCacheResponse.headers.set("Pragma", "no-cache");
    return noCacheResponse;
  } catch (error) {
    console.error("Error getting domain:", error);
    return NextResponse.json(
      { error: "Failed to get domain" },
      { status: 500 }
    );
  }
}
