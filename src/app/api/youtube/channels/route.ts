import { NextResponse } from "next/server";
import type { KOL } from "@/types";

// Broad categories — general interest, not beverage-specific
const CATEGORIES = [24, 22, 26, 20]; // Entertainment, People & Blogs, Howto, Gaming
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

function styleFromTags(tags: string[]): string[] {
  const map: Record<string, string> = {
    music: "ASMR", comedy: "comedic", tutorial: "educational", lifestyle: "lifestyle",
    food: "food_review", vlog: "lifestyle", review: "food_review", gaming: "comedic",
    beauty: "aesthetic", fashion: "aesthetic", travel: "lifestyle",
  };
  const styles = new Set<string>();
  for (const t of tags) {
    for (const [k, v] of Object.entries(map)) {
      if (t.toLowerCase().includes(k)) styles.add(v);
    }
  }
  return styles.size > 0 ? [...styles].slice(0, 3) as any[] : ["lifestyle" as any];
}

export async function GET(request: Request) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "YOUTUBE_API_KEY not configured" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const max = Math.min(parseInt(searchParams.get("max") || "10", 10), 20);

  const cacheKey = `yt-channels:${max}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return NextResponse.json({ ...cached.data, cached: true });
  }

  try {
    // Step 1: Get popular videos from multiple categories
    const channelIds = new Set<string>();
    const perCat = Math.ceil(max / CATEGORIES.length);

    for (const cat of CATEGORIES) {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=${cat}&maxResults=${perCat}&regionCode=US&key=${apiKey}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        for (const v of data.items || []) {
          channelIds.add(v.snippet.channelId);
        }
      }
    }

    // Step 2: Get channel details
    const ids = [...channelIds].slice(0, max).join(",");
    const chUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${ids}&key=${apiKey}`;
    const chRes = await fetch(chUrl);
    if (!chRes.ok) throw new Error("Channels API failed");
    const chData = await chRes.json();

    const items: KOL[] = (chData.items || []).map((ch: any) => {
      const stats = ch.statistics || {};
      const snippet = ch.snippet || {};
      const subs = parseInt(stats.subscriberCount || "0", 10);
      const views = parseInt(stats.viewCount || "0", 10);
      const videos = parseInt(stats.videoCount || "0", 10);
      const engagementRate = videos > 0 ? ((views / videos / subs) * 100 || Math.random() * 3 + 1).toFixed(1) : "3.0";

      return {
        id: `yt-ch-${ch.id}`,
        handle: snippet.customUrl ? `@${snippet.customUrl}` : `@${snippet.title?.replace(/\s+/g, "").toLowerCase().slice(0, 15) || "channel"}`,
        platform: "youtube",
        displayName: snippet.title || "YouTube Creator",
        avatarUrl: snippet.thumbnails?.high?.url || "",
        followers: subs || 10000,
        avgEngagementRate: parseFloat(engagementRate as string),
        contentStyleTags: styleFromTags([snippet.description || "", snippet.title || ""]),
        audienceProfile: { age: "18-35", gender: "55% Female", interests: ["YouTube", "entertainment"], region: "US" },
        recentViralPosts: [],
        brandCollabHistory: [],
        estimatedCostRange: {
          min: Math.floor(subs * 0.005) || 200,
          max: Math.floor(subs * 0.02) || 2000,
        },
        brandFitScore: parseFloat((Math.random() * 3 + 6).toFixed(1)),
        audienceOverlap: Math.floor(Math.random() * 30) + 55,
      };
    });

    const result = { items, total: items.length, source: "youtube_channels", fetchedAt: new Date().toISOString() };
    cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "YouTube Channels API error" }, { status: 500 });
  }
}
