import { NextResponse } from "next/server";

// TikTok Creative Center — blocked from CN network.
// Two approaches tried, both failed:
// 1. Playwright header interception — API endpoint changed from creative_radar_api to SSR
// 2. HTML SSR parsing — page.content() returns empty (anti-bot or geo-block)
// Full implementation preserved in git history.

export async function GET(_request: Request) {
  return NextResponse.json(
    { error: "TikTok unavailable — Creative Center blocked from current network." },
    { status: 503 }
  );
}
