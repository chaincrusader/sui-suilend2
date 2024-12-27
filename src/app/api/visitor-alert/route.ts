// apps/suilend/src/app/api/visitor-alert/route.ts

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { ip, domain, template, partnerId } = payload;

    console.log("Received visitor alert request:", {
      ip,
      domain,
      template,
      partnerId,
    });

    if (!ip || !domain || !template || !partnerId) {
      console.log("Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error("Backend URL is not defined in environment variables");
      throw new Error("Backend URL is not defined in environment variables");
    }

    console.log(
      "Sending request to backend:",
      `${backendUrl}/api/visitorAlert`
    );

    const response = await fetch(`${backendUrl}/api/visitorAlert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, domain, template, partnerId }),
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error response:", errorText);
      throw new Error(
        `Backend responded with status: ${response.status}. Error: ${errorText}`
      );
    }

    const result = await response.json();
    console.log("Backend response:", result);

    const noCacheResponse = NextResponse.json(result);
    noCacheResponse.headers.set("Cache-Control", "no-store, max-age=0");
    noCacheResponse.headers.set("Pragma", "no-cache");
    return noCacheResponse;
  } catch (error) {
    console.error("Error processing visitor alert:", error);
    return NextResponse.json(
      { error: "Failed to process visitor alert" },
      { status: 500 }
    );
  }
}
