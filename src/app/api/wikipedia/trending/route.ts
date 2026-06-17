import { NextResponse } from "next/server";
import type { IP } from "@/types";

const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

const excludedPages = new Set([
  "Main_Page", "Special:Search", "Wikipedia:",
  "File:", "Template:", "Category:", "Help:", "Portal:",
]);

function categoryFromTitle(title: string): string {
  const t = title.toLowerCase();
  if (/anime|manga|character|game|pok[eé]mon|naruto|dragon.ball/i.test(t)) return "anime";
  if (/film|movie|actor|cinema/i.test(t)) return "movie";
  if (/game|gaming|playstation|xbox|nintendo|steam/i.test(t)) return "game";
  if (/music|album|song|band|singer|rapper/i.test(t)) return "character";
  return "meme";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const max = Math.min(parseInt(searchParams.get("max") || "8", 10), 20);

  const cacheKey = `wiki:${max}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return NextResponse.json({ ...cached.data, cached: true });
  }

  try {
    // Get yesterday's date in YYYY/MM/DD format
    const yesterday = new Date(Date.now() - 86400000);
    const y = yesterday.getFullYear();
    const m = String(yesterday.getMonth() + 1).padStart(2, "0");
    const d = String(yesterday.getDate()).padStart(2, "0");

    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${y}/${m}/${d}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "BubblePulse/1.0 (demo; contact@bubblepulse.dev)" },
    });

    if (!res.ok) throw new Error(`Wikipedia API returned ${res.status}`);
    const data = await res.json();

    const articles = (data.items?.[0]?.articles || [])
      .filter((a: any) => {
        const title = a.article || "";
        return ![...excludedPages].some((prefix) => title.startsWith(prefix));
      })
      .slice(0, max);

    const items: IP[] = articles.map((a: any, i: number) => ({
      id: `wiki-${i}-${y}${m}${d}`,
      name: a.article.replace(/_/g, " ") || "Unknown",
      category: categoryFromTitle(a.article || "") as any,
      heatScore: Math.min(100, Math.floor((a.views || 100000) / 100000)),
      trendDirection: (i < max / 2 ? "up" : "stable") as "up" | "stable",
      audienceOverlap: Math.floor(Math.random() * 25) + 55,
      audienceProfile: "全年龄段，英语用户为主",
      collabPrecedents: [],
      feasibility: (Math.random() > 0.5 ? "high" : "medium") as "high" | "medium",
      competitorOccupied: Math.random() > 0.7,
      imageUrl: `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(a.article)}&prop=pageimages&format=json&pithumbsize=200`,
    }));

    const result = { items, total: items.length, source: "wikipedia_pageviews", fetchedAt: new Date().toISOString() };
    cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Wikipedia API error" }, { status: 500 });
  }
}
