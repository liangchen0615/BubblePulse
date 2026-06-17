import { NextResponse } from "next/server";
import type { ContentItem, Country, Language, Emotion } from "@/types";
import { calcHeatScore, calcGrowthRate } from "@/lib/heat-score";

// Google Trends RSS feed — no API key needed
// General trending topics (no category filter)

const regionGeoMap: Record<string, string> = {
  US: "US", UK: "GB", AU: "AU", SG: "SG", JP: "JP", KR: "KR",
  FR: "FR", DE: "DE", CA: "CA", TH: "TH", ID: "ID", MY: "MY", PH: "PH", VN: "VN",
};

const geoCountryMap: Record<string, Country> = {
  US: "US", GB: "UK", AU: "AU", SG: "SG", JP: "JP", KR: "KR",
  FR: "FR", DE: "DE", CA: "CA", TH: "TH", ID: "ID", MY: "MY", PH: "PH", VN: "VN",
};

function guessEmotion(title: string, desc: string): Emotion {
  const text = (title + " " + desc).toLowerCase();
  if (/food|drink|recipe|cook|tea|coffee|matcha|boba|bubble/i.test(text)) return "curiosity";
  if (/trending|viral|popular|hot|breaking/i.test(text)) return "excitement";
  if (/beauty|style|fashion|aesthetic/i.test(text)) return "awe";
  if (/sport|game|match|championship/i.test(text)) return "excitement";
  return "joy";
}

function parseRSSItem(el: string): Record<string, string> {
  const getTag = (tag: string) => {
    const m = el.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`));
    return m ? m[1].trim() : "";
  };
  const getNSTag = (tag: string) => {
    const m = el.match(new RegExp(`<ht:${tag}[^>]*>([^<]*)<\\/ht:${tag}>`));
    return m ? m[1].trim() : "";
  };
  return {
    title: getTag("title"),
    link: getTag("link"),
    pubDate: getTag("pubDate"),
    description: getTag("description"),
    traffic: getNSTag("approx_traffic"),
    imageUrl: getNSTag("picture"),
    imageSource: getNSTag("picture_source"),
  };
}

// In-memory cache: 24h TTL
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") || "US";
  const geo = regionGeoMap[region] || "US";
  const country = geoCountryMap[geo] || "US";

  // Check cache
  const cacheKey = `goog:${geo}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return NextResponse.json({ ...cached.data, cached: true });
  }

  try {
    const url = `https://trends.google.com/trending/rss?geo=${geo}&hl=en-US&hours=24&sort=relevance`;
    const res = await fetch(url, { headers: { "User-Agent": "BubblePulse/1.0" } });
    if (!res.ok) {
      return NextResponse.json({ error: `Google Trends returned ${res.status}` }, { status: res.status });
    }

    const xml = await res.text();
    const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
    const items: ContentItem[] = itemMatches.map((el, i) => {
      const raw = parseRSSItem(el);
      const traffic = parseInt(raw.traffic.replace(/,/g, ""), 10) || 100000;
      return {
        id: `goog-${i}-${Date.now()}`,
        platform: "instagram",
        title: raw.title.slice(0, 80),
        description: raw.description.replace(/<[^>]*>/g, "").slice(0, 200) || raw.title,
        thumbnailUrl: raw.imageUrl || "",
        url: raw.link || "",
        metrics: {
          views: traffic * 10,
          likes: Math.floor(traffic * 0.3),
          shares: Math.floor(traffic * 0.05),
          comments: Math.floor(traffic * 0.02),
          growthRate: 0, heatScore: 0,
        },
        format: "hashtag",
        tags: ["GoogleTrends", "trending", "food_drink"],
        country: country as Country,
        language: "en" as Language,
        emotion: guessEmotion(raw.title, raw.description),
        audienceOverlap: Math.floor(Math.random() * 20) + 60,
        lifecycle: {
          stage: "rising",
          estimatedWindow: "1-2周",
          crossPlatform: true,
          competitorDensity: "medium",
        },
        demographicAffinity: {
          age_18_24: 0.40,
          age_25_34: 0.35,
          age_35_44: 0.15,
          female: 0.55,
          male: 0.45,
        },
        createdAt: raw.pubDate || new Date().toISOString(),
      };
    });

    for (const item of items) {
      item.metrics.growthRate = calcGrowthRate(item);
      item.metrics.heatScore = calcHeatScore(item);
    }
    const result = {
      items,
      region: geo,
      category: "All",
      total: items.length,
      fetchedAt: new Date().toISOString(),
    };
    cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Google Trends error" }, { status: 500 });
  }
}
