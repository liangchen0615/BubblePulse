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

    // Fetch recent videos for real engagement rates (batch per channel)
    const nicheMultipliers: Record<string, number> = { ASMR: 0.012, aesthetic: 0.015, lifestyle: 0.012, educational: 0.01, comedic: 0.01, food_review: 0.012 };

    const items: KOL[] = await Promise.all((chData.items || []).map(async (ch: any) => {
      const stats = ch.statistics || {};
      const snippet = ch.snippet || {};
      const subs = parseInt(stats.subscriberCount || "0", 10);
      const views = parseInt(stats.viewCount || "0", 10);
      const videos = parseInt(stats.videoCount || "0", 10);
      const handle = snippet.customUrl ? `@${snippet.customUrl}` : `@${snippet.title?.replace(/\s+/g, "").toLowerCase().slice(0, 15) || "channel"}`;
      const styles = styleFromTags([snippet.description || "", snippet.title || ""]);

      // Real engagement: fetch recent videos, compute avg (likes+comments)/views
      let realEngagement = 0;
      try {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${ch.id}&order=date&maxResults=5&type=video&key=${apiKey}`;
        const searchRes = await fetch(searchUrl);
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const videoIds = (searchData.items || []).map((v: any) => v.id?.videoId).filter(Boolean);
          if (videoIds.length > 0) {
            const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds.join(",")}&key=${apiKey}`;
            const statsRes = await fetch(statsUrl);
            if (statsRes.ok) {
              const statsData = await statsRes.json();
              const engagements = (statsData.items || []).map((v: any) => {
                const s = v.statistics || {};
                const likes = parseInt(s.likeCount || "0", 10);
                const comments = parseInt(s.commentCount || "0", 10);
                const vws = parseInt(s.viewCount || "1", 10);
                return ((likes + comments) / vws) * 100;
              });
              realEngagement = engagements.length > 0
                ? parseFloat((engagements.reduce((a:number,b:number) => a + b, 0) / engagements.length).toFixed(1))
                : parseFloat(((views / Math.max(videos, 1) / Math.max(subs, 1)) * 100).toFixed(1));
            }
          }
        }
      } catch {}
      if (realEngagement === 0) realEngagement = parseFloat(((views / Math.max(videos, 1) / Math.max(subs, 1)) * 100).toFixed(1));

      // Cost: industry CPM-based formula — subs × viewRate × CPM range
      const nicheCPM = styles.length > 0 ? (nicheMultipliers[styles[0]!] || 0.01) : 0.01;
      const engagementFactor = Math.max(0.5, Math.min(2, realEngagement / 3));
      const baseCPM = nicheCPM * engagementFactor; // $ per 1000 views
      const estViews = Math.round(subs * 0.15); // ~15% of subs watch a typical video
      const estCost = Math.round(estViews / 1000 * baseCPM * 1000);
      const costMin = Math.round(estCost * 0.5) || 100;
      const costMax = Math.round(estCost * 1.5) || 500;

      // Merged match score: audience overlap (60%) + content fit (40%)
      const overlapScore = Math.floor(Math.random() * 30) + 55; // still synthetic for now
      const contentFit = Math.min(100, styles.length * 15 + (realEngagement > 3 ? 20 : realEngagement > 1.5 ? 10 : 0));
      const matchScore = Math.round(overlapScore * 0.6 + contentFit * 0.4);

      return {
        id: `yt-ch-${ch.id}`,
        handle, platform: "youtube",
        displayName: snippet.title || "YouTube Creator",
        avatarUrl: snippet.thumbnails?.high?.url || "",
        followers: subs || 10000,
        avgEngagementRate: realEngagement,
        contentStyleTags: styles,
        audienceProfile: { age: "18-35", gender: "55% Female", interests: styles.slice(0, 3), region: "US" },
        recentViralPosts: [],
        brandCollabHistory: [],
        estimatedCostRange: { min: costMin || 200, max: costMax || 2000 },
        brandFitScore: parseFloat(matchScore.toFixed(1)),
        audienceOverlap: overlapScore,
      };
    }));

    const result = { items, total: items.length, source: "youtube_channels", fetchedAt: new Date().toISOString() };
    cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "YouTube Channels API error" }, { status: 500 });
  }
}
