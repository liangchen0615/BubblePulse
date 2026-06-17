import { NextResponse } from "next/server";
import type { ContentItem, Platform, Language, Emotion, Country } from "@/types";

interface YouTubeVideoItem {
  id: string | { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: { high: { url: string }; maxres?: { url: string } };
    channelTitle: string;
    publishedAt: string;
    tags?: string[];
    categoryId?: string;
  };
  contentDetails?: {
    duration: string; // ISO 8601 duration e.g. "PT4M13S"
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

// YouTube category ID → label
const categoryLabel: Record<string, string> = {
  "1": "Film & Animation", "2": "Autos & Vehicles", "10": "Music",
  "17": "Sports", "19": "Travel & Events", "20": "Gaming",
  "22": "People & Blogs", "23": "Comedy", "24": "Entertainment",
  "25": "News & Politics", "26": "Howto & Style", "27": "Education",
  "28": "Science & Technology", "29": "Nonprofits & Activism",
};

const regionCountryMap: Record<string, Country> = {
  US: "US", GB: "UK", AU: "AU", SG: "SG", MY: "MY", TH: "TH",
  ID: "ID", PH: "PH", VN: "VN", JP: "JP", KR: "KR", FR: "FR", DE: "DE", CA: "CA",
};

const countryLanguageMap: Record<Country, Language> = {
  US: "en", UK: "en", AU: "en", CA: "en", SG: "en",
  JP: "ja", KR: "ko", TH: "th", ID: "id", VN: "vi", PH: "tl", MY: "ms",
  FR: "fr", DE: "de", CN: "zh",
};

// Default: general trending. Pass ?mode=search&q=xxx for keyword search.
// In-memory cache: 5 min TTL
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function guessEmotion(title: string): Emotion {
  const t = title.toLowerCase();
  if (t.match(/asmr|calm|relax|peaceful|soft|slow|quiet|meditation/)) return "calm";
  if (t.match(/funny|comedy|prank|hilarious|lol|laugh|fail/)) return "humor";
  if (t.match(/nostalgia|throwback|retro|old school|90s|memories/)) return "nostalgia";
  if (t.match(/excit|hype|trailer|reveal|new|launch|epic|insane/)) return "excitement";
  if (t.match(/emotion|cry|heartfelt|support|mental health|self care|wholesome/)) return "empathy";
  if (t.match(/aesthetic|beautiful|stunning|amazing|satisfying|wow/)) return "awe";
  if (t.match(/curious|mystery|how to|tutorial|behind|secret|hidden/)) return "curiosity";
  return "joy";
}

function getVideoId(item: YouTubeVideoItem): string {
  return typeof item.id === "string" ? item.id : item.id.videoId;
}

// Parse ISO 8601 duration to seconds
function parseDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 300;
  return (parseInt(m[1] || "0") * 3600) + (parseInt(m[2] || "0") * 60) + parseInt(m[3] || "0");
}

// Calculate lifecycle from real metrics
function calcLifecycle(
  publishedAt: string,
  viewCount: number,
  likeCount: number
): ContentItem["lifecycle"] {
  const ageHours = (Date.now() - new Date(publishedAt).getTime()) / 3600000;
  const engagementRate = likeCount / Math.max(viewCount, 1);
  const hoursPerView = ageHours / Math.max(viewCount / 1000, 1);

  // Velocity: views per hour
  const velocity = viewCount / Math.max(ageHours, 1);

  let stage: "rising" | "peak" | "declining";
  let estimatedWindow: string;

  if (ageHours < 24 && velocity > 5000) {
    stage = "rising"; estimatedWindow = "3-7天";
  } else if (ageHours < 72 && velocity > 1000) {
    stage = "rising"; estimatedWindow = "1-2周";
  } else if (velocity > 500) {
    stage = "peak"; estimatedWindow = "1-2周";
  } else if (velocity > 100) {
    stage = "peak"; estimatedWindow = "2-3周";
  } else {
    stage = "declining"; estimatedWindow = "不建议进入";
  }

  return {
    stage,
    estimatedWindow,
    crossPlatform: engagementRate > 0.03,
    competitorDensity: engagementRate > 0.05 ? "high" : engagementRate > 0.02 ? "medium" : "low",
  };
}

function mapToContentItem(video: YouTubeVideoItem, country: Country): ContentItem {
  const tags = video.snippet.tags || [];
  const views = parseInt(video.statistics?.viewCount || "0", 10) || 100000;
  const likes = parseInt(video.statistics?.likeCount || "0", 10) || 0;
  const comments = parseInt(video.statistics?.commentCount || "0", 10) || 0;
  const language = countryLanguageMap[country] || "en";
  const emotion = guessEmotion(video.snippet.title);
  const videoId = getVideoId(video);

  // Real format from duration
  const durationSec = parseDuration(video.contentDetails?.duration || "PT5M");
  const format = durationSec <= 60 ? "short_video" : "long_video";
  const platform: Platform = durationSec <= 60 ? "youtube_shorts" : "youtube";

  // Real lifecycle from metrics
  const lifecycle = calcLifecycle(video.snippet.publishedAt, views, likes);

  // Category as tag
  const catLabel = video.snippet.categoryId ? categoryLabel[video.snippet.categoryId] : null;
  const allTags = [...tags, ...(catLabel ? [catLabel] : [])];

  // Demographic: neutral (no API provides this for third-party content)
  // Real product would use panel data or third-party enrichment
  const neutralDemographic = {
    age_18_24: 0.33, age_25_34: 0.33, age_35_44: 0.20,
    female: 0.50, male: 0.50,
  };

  return {
    id: `yt-${videoId}`,
    platform,
    title: video.snippet.title.slice(0, 80),
    description: video.snippet.description?.slice(0, 200) || "",
    thumbnailUrl: video.snippet.thumbnails?.maxres?.url || video.snippet.thumbnails?.high?.url || "",
    url: `https://youtube.com/watch?v=${videoId}`,
    metrics: { views, likes, shares: Math.floor(views * 0.01), comments, growthRate: 0 },
    format,
    tags: allTags.slice(0, 8),
    country,
    language,
    emotion,
    audienceOverlap: 0, // Can't calculate without brand data — user filters determine this
    lifecycle,
    demographicAffinity: neutralDemographic,
    createdAt: video.snippet.publishedAt,
  };
}

export async function GET(request: Request) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "YOUTUBE_API_KEY not configured. Add it to .env.local" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "trending"; // trending = general hot videos
  const regionCode = searchParams.get("region") || "US";
  const country = regionCountryMap[regionCode] || "US";
  const maxResults = Math.min(parseInt(searchParams.get("max") || "12", 10), 50);

  // Check cache
  const cacheKey = `yt:${mode}:${regionCode}:${maxResults}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return NextResponse.json({ ...cached.data, cached: true });
  }

  try {
    let items: ContentItem[] = [];

    if (mode === "search") {
      const query = searchParams.get("q") || "trending";
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&regionCode=${regionCode}&key=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error((await res.json()).error?.message);
      const data = await res.json();
      const ids = (data.items || []).map((v: YouTubeVideoItem) => getVideoId(v)).filter(Boolean);
      if (ids.length > 0) {
        const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${ids.join(",")}&key=${apiKey}`;
        const statsRes = await fetch(statsUrl);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          items = (statsData.items || []).map((v: YouTubeVideoItem) => mapToContentItem(v, country));
        }
      }
    } else {
      // Trending: most popular videos in region
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&regionCode=${regionCode}&maxResults=${maxResults}&key=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error((await res.json()).error?.message);
      const data = await res.json();
      items = (data.items || []).map((v: YouTubeVideoItem) => mapToContentItem(v, country));
    }

    const result = {
      items: items.slice(0, maxResults),
      mode,
      region: regionCode,
      total: Math.min(items.length, maxResults),
      fetchedAt: new Date().toISOString(),
    };

    cache.set(cacheKey, { data: result, expires: Date.now() + CACHE_TTL });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "YouTube API error" }, { status: 500 });
  }
}
