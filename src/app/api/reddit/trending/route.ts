import { NextResponse } from "next/server";
import type { ContentItem, Language, Emotion, Country } from "@/types";

// Reddit public JSON API — no authentication needed
const SUBREDDITS = ["tea", "boba", "AsianBeauty", "cafe", "streetfood", "food"];

interface RedditChild {
  data: {
    id: string;
    title: string;
    selftext: string;
    url: string;
    permalink: string;
    thumbnail: string;
    created_utc: number;
    ups: number;
    num_comments: number;
    subreddit: string;
    link_flair_text: string | null;
  };
}

function guessEmotion(title: string, selftext: string): Emotion {
  const text = (title + " " + selftext).toLowerCase();
  if (/review|best|favorite|recommend|worth|vs|compare/i.test(text)) return "curiosity";
  if (/beautiful|gorgeous|aesthetic|stunning|amazing|photo/i.test(text)) return "awe";
  if (/funny|hilarious|lol|lmao|fail|joke/i.test(text)) return "humor";
  if (/calm|relax|peaceful|quiet|slow|ritual|meditat/i.test(text)) return "calm";
  if (/exciting|new|launch|just dropped|omg|hype/i.test(text)) return "excitement";
  if (/help|question|how|what|why|anyone|suggest/i.test(text)) return "curiosity";
  if (/nostalgia|childhood|memories|old|classic|throwback/i.test(text)) return "nostalgia";
  if (/love|heart|wholesome|support|community|appreciat/i.test(text)) return "empathy";
  return "joy";
}

function mapPost(child: RedditChild): ContentItem {
  const { data: p } = child;
  return {
    id: `rd-${p.id}`,
    platform: "instagram",
    title: p.title.slice(0, 80),
    description: (p.selftext || p.title).slice(0, 200).replace(/\n/g, " "),
    thumbnailUrl: p.thumbnail?.startsWith("http") ? p.thumbnail : "",
    url: `https://www.reddit.com${p.permalink}`,
    metrics: {
      views: p.ups * 50,
      likes: p.ups,
      shares: Math.floor(p.ups * 0.2),
      comments: p.num_comments,
      growthRate: Math.min(Math.floor((p.ups / Math.max(p.ups, 1)) * 15), 45),
      heatScore: 0,
          },
    format: "hashtag",
    tags: [p.subreddit, p.link_flair_text || "discussion"].filter(Boolean),
    country: "US" as Country,
    language: "en" as Language,
    emotion: guessEmotion(p.title, p.selftext),
    audienceOverlap: Math.floor(Math.random() * 25) + 55,
    lifecycle: {
      stage: p.ups > 500 ? "rising" : "peak",
      estimatedWindow: "1-2周",
      crossPlatform: p.num_comments > 100,
      competitorDensity: p.num_comments > 200 ? "medium" : "low",
    },
    demographicAffinity: {
      age_18_24: 0.45,
      age_25_34: 0.35,
      age_35_44: 0.12,
      female: 0.60,
      male: 0.40,
    },
    createdAt: new Date(p.created_utc * 1000).toISOString(),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const max = Math.min(parseInt(searchParams.get("max") || "15", 10), 25);

  const allItems: ContentItem[] = [];
  const perSub = Math.ceil(max / SUBREDDITS.length);

  for (const sub of SUBREDDITS) {
    try {
      const res = await fetch(
        `https://www.reddit.com/r/${sub}/top.json?t=week&limit=${perSub}&raw_json=1`,
        { headers: { "User-Agent": "BubblePulse/1.0 (demo)" } }
      );
      if (!res.ok) continue;

      const data = await res.json();
      const children: RedditChild[] = data?.data?.children || [];
      allItems.push(...children.map(mapPost));
    } catch {
      // Skip failed subreddits
    }
  }

  return NextResponse.json({
    items: allItems.slice(0, max),
    subreddits: SUBREDDITS,
    total: Math.min(allItems.length, max),
    source: "reddit_top_week",
    fetchedAt: new Date().toISOString(),
  });
}
