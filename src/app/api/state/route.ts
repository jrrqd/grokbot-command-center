import { NextResponse } from "next/server";

import { loadState } from "@/lib/storage";

export async function GET(req: Request) {
  const ccHeader = req.headers.get("x-cc-request");
  const state = await loadState();

  const headers: HeadersInit = {
    "Cache-Control": "no-store",
  };
  if (ccHeader === "1") {
    headers["X-CC-Response"] = "1";
  }

  return NextResponse.json(state, { headers });
}