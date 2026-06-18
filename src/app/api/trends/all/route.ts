import { NextResponse } from "next/server";
import { trends as mockTrends } from "@/lib/mock-data";
import { calcHeatScore, calcGrowthRate } from "@/lib/heat-score";
import type { ContentItem, Country } from "@/types";

const regionCountryMap: Record<string, Country> = {
  US: "US", GB: "UK", AU: "AU", SG: "SG", MY: "MY", TH: "TH",
  ID: "ID", PH: "PH", VN: "VN", JP: "JP", KR: "KR", FR: "FR", DE: "DE", CA: "CA",
};

const countryLanguageMap: Record<string, string> = {
  US: "en", UK: "en", AU: "en", CA: "en", SG: "en",
  JP: "ja", KR: "ko", TH: "th", ID: "id", VN: "vi", PH: "tl", MY: "ms",
  FR: "fr", DE: "de",
};

const emotionKeywords: [string, string][] = [
  ["asmr|calm|relax|peaceful|soft|slow|quiet|meditation", "calm"],
  ["funny|comedy|prank|hilarious|lol|laugh|fail", "humor"],
  ["nostalgia|throwback|retro|old school|90s|memories", "nostalgia"],
  ["excit|hype|trailer|reveal|new|launch|epic|insane", "excitement"],
  ["emotion|cry|heartfelt|support|mental health|self care|wholesome", "empathy"],
  ["aesthetic|beautiful|stunning|amazing|satisfying|wow", "awe"],
  ["curious|mystery|how to|tutorial|behind|secret|hidden", "curiosity"],
];

function guessEmotion(title: string): string {
  const t = title.toLowerCase();
  for (const [pattern, emotion] of emotionKeywords) {
    if (new RegExp(pattern).test(t)) return emotion;
  }
  return "joy";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source") || "mock";
  const period = searchParams.get("period") || "day"; // day | week | month
  const regionCode = searchParams.get("region") || "US";
  const max = Math.min(parseInt(searchParams.get("max") || "50", 10), 50);

  let items: ContentItem[] = [];
  const sources: string[] = [];

  // Mock data
  if (source === "mock" || source === "merged") {
    items = [...mockTrends];
    sources.push("mock");
  }

  // YouTube API data — fetch from multiple regions for broader coverage
  if (source === "youtube" || source === "merged") {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey) {
      const regions = ["US", "JP"]; // US + JP = ~30 items
      for (const rc of regions) {
        try {
          const ytUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${rc}&maxResults=15&key=${apiKey}`;
          const ytRes = await fetch(ytUrl);
          if (ytRes.ok) {
            const data = await ytRes.json();
            const country = regionCountryMap[rc] || "US";
            const language = countryLanguageMap[country] || "en";
            for (const v of (data.items || [])) {
              items.push({
                id: `yt-${v.id}`,
                platform: "youtube" as const,
                title: v.snippet.title.slice(0, 80),
                description: v.snippet.description?.slice(0, 200) || "",
                thumbnailUrl: v.snippet.thumbnails?.high?.url || "",
                url: `https://youtube.com/watch?v=${v.id}`,
                metrics: { views: parseInt(v.statistics?.viewCount,10)||100000, likes: parseInt(v.statistics?.likeCount,10)||5000, shares: Math.floor(parseInt(v.statistics?.viewCount,10)*0.01), comments: parseInt(v.statistics?.commentCount,10)||1000, growthRate: 0, heatScore: 0 },
                format: "long_video",
                tags: v.snippet.tags?.slice(0,6)||[],
                country, language,
                emotion: guessEmotion(v.snippet.title),
                demographicAffinity: { age_18_24:0.4, age_25_34:0.35, age_35_44:0.15, female:0.5, male:0.5 },
                audienceOverlap: Math.floor(Math.random()*25)+55,
                lifecycle: { stage: "rising", estimatedWindow: "1-2周", crossPlatform: false, competitorDensity: "low" },
                createdAt: v.snippet.publishedAt||new Date().toISOString(),
              } as ContentItem);
            }
          }
        } catch {}
      }
      sources.push("youtube");
    }
  }

  // Google Trends data (RSS feed, no API key) — fetch with cache bust if needed
  if (source === "google" || source === "merged") {
    const googRegions = ["US", "JP"]; // US + JP for broader coverage
    for (const gr of googRegions) {
      try {
        const googRes = await fetch(`http://localhost:3000/api/google/trending?region=${gr}`);
        if (googRes.ok) {
          const googData = await googRes.json();
          if (googData.items?.length > 0) {
            items = [...items, ...googData.items];
            sources.push("google");
          }
        }
      } catch {}
    }
  }

  // Deduplicate by id
  const seen = new Set<string>();
  items = items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  // Period expansion: scale ALL metrics by the same factor per snapshot,
  // then recompute heatScore. This preserves the view:like:comment:share ratio.
  const dayItems = items.slice(0, max);
  if (period === "week") {
    const expanded: ContentItem[] = [];
    for (let d = 0; d < 7; d++) {
      const offset = d * 86400000;
      for (const item of dayItems.slice(0, Math.ceil(max / 3))) {
        const scale = 0.7 + Math.random() * 0.6; // 0.7x ~ 1.3x
        const newItem = {
          ...item, id: `${item.id}-w${d}`,
          createdAt: new Date(Date.now() - offset).toISOString(),
          metrics: {
            views: Math.round(item.metrics.views * scale),
            likes: Math.round(item.metrics.likes * scale),
            comments: Math.round(item.metrics.comments * scale),
            shares: Math.round(item.metrics.shares * scale),
            growthRate: item.metrics.growthRate + Math.round(Math.random() * 8 - 4),
            heatScore: 0,
          },
        } as ContentItem;
        newItem.metrics.heatScore = calcHeatScore(newItem);
        expanded.push(newItem);
      }
    }
    items = expanded.slice(0, max);
  } else if (period === "month") {
    const expanded: ContentItem[] = [];
    for (let d = 0; d < 30; d++) {
      const offset = d * 86400000;
      for (const item of dayItems.slice(0, Math.ceil(max / 5))) {
        const scale = 0.5 + Math.random() * 1.0; // 0.5x ~ 1.5x
        const newItem = {
          ...item, id: `${item.id}-m${d}`,
          createdAt: new Date(Date.now() - offset).toISOString(),
          metrics: {
            views: Math.round(item.metrics.views * scale),
            likes: Math.round(item.metrics.likes * scale),
            comments: Math.round(item.metrics.comments * scale),
            shares: Math.round(item.metrics.shares * scale),
            growthRate: item.metrics.growthRate + Math.round(Math.random() * 16 - 8),
            heatScore: 0,
          },
        } as ContentItem;
        newItem.metrics.heatScore = calcHeatScore(newItem);
        expanded.push(newItem);
      }
    }
    items = expanded.slice(0, max);
  } else {
    items = dayItems;
  }

  // Compute heatScore and growthRate for ALL items
  for (const item of items) {
    if (item.metrics.heatScore === 0) {
      item.metrics.heatScore = calcHeatScore(item);
    }
    if (item.metrics.growthRate === 0 && item.createdAt) {
      item.metrics.growthRate = calcGrowthRate(item);
    }
  }

  // Scale mock items' heatScore to blend with real API data range
  const realItems = items.filter((i) => i.id.startsWith("yt-") || i.id.startsWith("goog-"));
  const mockItems = items.filter((i) => !i.id.startsWith("yt-") && !i.id.startsWith("goog-"));
  if (realItems.length > 0 && mockItems.length > 0) {
    const realMax = Math.max(...realItems.map((i) => i.metrics.heatScore));
    const realMin = Math.min(...realItems.map((i) => i.metrics.heatScore));
    const mockMax = Math.max(...mockItems.map((i) => i.metrics.heatScore));
    const mockMin = Math.min(...mockItems.map((i) => i.metrics.heatScore));
    // Remap mock range → [realMin, realMax+3]
    for (const item of mockItems) {
      if (mockMax > mockMin) {
        const t = (item.metrics.heatScore - mockMin) / (mockMax - mockMin);
        item.metrics.heatScore = Math.round(realMin + t * (realMax - realMin + 3));
      }
    }
  }

  // Title-based dedup: keep only the highest-heatScore entry per title
  const titleMap = new Map<string, ContentItem>();
  for (const item of items) {
    const key = item.title.slice(0, 40).toLowerCase();
    const existing = titleMap.get(key);
    if (!existing || item.metrics.heatScore > existing.metrics.heatScore) {
      titleMap.set(key, item);
    }
  }
  items = [...titleMap.values()].sort((a, b) => b.metrics.heatScore - a.metrics.heatScore);

  return NextResponse.json({
    items,
    sources,
    period,
    total: items.length,
    region: regionCode,
    fetchedAt: new Date().toISOString(),
  });
}
