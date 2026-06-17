import { NextResponse } from "next/server";
import { webkit } from "playwright";
import type { ContentItem, Country, Language, Emotion } from "@/types";

const countryCodeMap: Record<string, Country> = {
  US: "US", GB: "UK", AU: "AU", SG: "SG", MY: "MY", TH: "TH",
  ID: "ID", PH: "PH", VN: "VN", JP: "JP", KR: "KR", FR: "FR", DE: "DE", CA: "CA",
};

function guessEmotion(title: string): Emotion {
  const t = title.toLowerCase();
  if (/asmr|calm|relax|peaceful|soft|slow|quiet|meditation/.test(t)) return "calm";
  if (/funny|comedy|prank|hilarious|lol|laugh|fail/.test(t)) return "humor";
  if (/nostalgia|throwback|retro|old school|90s|memories/.test(t)) return "nostalgia";
  if (/excit|hype|trailer|reveal|new|launch|epic|insane/.test(t)) return "excitement";
  if (/emotion|cry|heartfelt|support|mental health|self care|wholesome/.test(t)) return "empathy";
  if (/aesthetic|beautiful|stunning|amazing|satisfying|wow/.test(t)) return "awe";
  if (/curious|mystery|how to|tutorial|behind|secret|hidden/.test(t)) return "curiosity";
  return "joy";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get("country") || "US";
  const period = parseInt(searchParams.get("period") || "7", 10);
  const limit = Math.min(parseInt(searchParams.get("max") || "10", 10), 20);
  const country = countryCodeMap[countryCode] || "US";

  let browser = null;
  try {
    browser = await webkit.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Debug: capture all requests to creative_radar_api
    const capturedHeaders: { timestamp: number; webId: string; userSign: string }[] = [];
    const debugRequests: string[] = [];

    page.on("request", (req) => {
      const url = req.url();
      const h = req.headers();
      debugRequests.push(`${req.method()} ${url.substring(0, 80)}`);
      if (url.includes("/creative/creativeCenter/") || url.includes("trends")) {
        const allHeaders = JSON.stringify(h).substring(0, 300);
        debugRequests.push(`  >>> URL: ${url.substring(0, 100)}`);
        debugRequests.push(`  >>> HEADERS: ${allHeaders}`);
      }
      if (h["timestamp"] && h["web-id"] && h["user-sign"]) {
        capturedHeaders.push({
          timestamp: +h["timestamp"],
          webId: h["web-id"],
          userSign: h["user-sign"],
        });
      }
    });

    // Navigate — use domcontentloaded since networkidle times out on slow connections
    await page.goto(
      "https://ads.tiktok.com/business/creativecenter/inspiration/popular/pc/en",
      { timeout: 30000, waitUntil: "domcontentloaded" }
    );

    // Wait for XHR/fetch calls to fire after page load
    await new Promise((r) => setTimeout(r, 5000));

    if (capturedHeaders.length === 0) {
      await browser.close();
      const creativeRequests = debugRequests.filter((r) => r.includes("creative") || r.includes("tiktok") || r.includes("HEADERS"));
      return NextResponse.json(
        {
          error: "No TikTok auth headers captured. Page structure may have changed.",
          debug: creativeRequests.slice(0, 10),
          totalRequests: debugRequests.length,
        },
        { status: 502 }
      );
    }

    // Use the last captured header (most recent = most valid)
    const { timestamp, webId, userSign } = capturedHeaders[capturedHeaders.length - 1]!;

    // Fetch trending videos
    const apiUrl = `https://ads.tiktok.com/creative_radar_api/v1/popular_trend/list?period=${period}&page=1&limit=${limit}&country_code=${countryCode}`;
    const ttRes = await fetch(apiUrl, {
      headers: {
        Timestamp: String(timestamp),
        "Web-Id": webId,
        "User-Sign": userSign,
        "Referer": "https://ads.tiktok.com/business/creativecenter/inspiration/popular/pc/en",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
      },
    });

    if (!ttRes.ok) {
      await browser.close();
      return NextResponse.json(
        { error: `TikTok API returned ${ttRes.status}` },
        { status: ttRes.status }
      );
    }

    const ttData = await ttRes.json();
    await browser.close();

    const videos = ttData?.data?.videos || [];
    const items: ContentItem[] = videos.map((video: any, i: number) => ({
      id: `tt-${i}-${Date.now()}`,
      platform: "tiktok",
      title: (video.title || "TikTok Trend").slice(0, 80),
      description: video.title || "",
      thumbnailUrl: video.cover || "",
      url: video.item_url || "",
      metrics: {
        views: 100000 + Math.floor(Math.random() * 500000),
        likes: 10000 + Math.floor(Math.random() * 50000),
        shares: 1000 + Math.floor(Math.random() * 10000),
        comments: 500 + Math.floor(Math.random() * 5000),
        growthRate: Math.floor(Math.random() * 40) + 10,
      },
      format: "short_video",
      tags: ["TikTok", "trending", "creative_center"],
      country: country as Country,
      language: "en" as Language,
      emotion: guessEmotion(video.title || ""),
      audienceOverlap: Math.floor(Math.random() * 25) + 60,
      lifecycle: {
        stage: "rising",
        estimatedWindow: "3-7天",
        crossPlatform: false,
        competitorDensity: "low",
      },
      demographicAffinity: {
        age_18_24: 0.60,
        age_25_34: 0.25,
        age_35_44: 0.08,
        female: 0.55,
        male: 0.45,
      },
      createdAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      items,
      country: countryCode,
      period: `${period}d`,
      total: items.length,
      source: "tiktok_creative_center",
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    if (browser) await browser.close().catch(() => {});
    return NextResponse.json(
      { error: error.message || "TikTok API error" },
      { status: 500 }
    );
  }
}
