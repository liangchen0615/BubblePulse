import type { ContentItem } from "@/types";

// Platform baselines: [logMin, logMax] for each metric
// YouTube: views 100~1B (2~9), likes 0~100M (0~8), comments 0~10M (0~7)
const BASELINES: Record<string, Record<string, [number, number]>> = {
  youtube: { views: [2, 9], likes: [0, 8], comments: [0, 7], shares: [0, 7] },
  youtube_shorts: { views: [2, 9], likes: [0, 8], comments: [0, 7], shares: [0, 7] },
  google: { views: [2, 7] }, // search volume proxy: 100~10M
  tiktok: { views: [2, 9], likes: [0, 8], shares: [0, 7], comments: [0, 7] },
  instagram: { views: [2, 8], likes: [0, 7], comments: [0, 6], shares: [0, 6] },
  reddit: { views: [2, 7], likes: [0, 6], comments: [0, 6], shares: [0, 5] },
};

// Platform weights for composite heat score
const WEIGHTS: Record<string, Record<string, number>> = {
  youtube: { views: 0.3, likes: 0.3, comments: 0.3, shares: 0.1 },
  youtube_shorts: { views: 0.3, likes: 0.3, comments: 0.3, shares: 0.1 },
  google: { views: 1.0 },
  tiktok: { views: 0.2, likes: 0.3, shares: 0.35, comments: 0.15 },
  instagram: { views: 0.2, likes: 0.4, comments: 0.2, shares: 0.2 },
  reddit: { views: 0.3, likes: 0.4, comments: 0.3, shares: 0.0 },
};

/** log10 normalize a single metric to 0-100 */
export function logNormalize(value: number, logMin: number, logMax: number): number {
  if (value <= 0) return 0;
  const logVal = Math.log10(value);
  const clamped = Math.max(logMin, Math.min(logMax, logVal));
  return Math.round(((clamped - logMin) / (logMax - logMin)) * 100);
}

/** Composite heat score: weighted log-normalized metrics, 0-100 */
export function calcHeatScore(item: ContentItem): number {
  const platform = item.platform;
  const bl = BASELINES[platform] || BASELINES["youtube"];
  const w = WEIGHTS[platform] || WEIGHTS["youtube"];
  const m = item.metrics;

  let score = 0;
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(w)) {
    const range = bl[key];
    if (!range) continue;
    const val = (m as any)[key] || 0;
    score += logNormalize(val, range[0], range[1]) * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round(score / totalWeight) : 0;
}

/** Real velocity: views per hour since publish */
export function calcVelocity(item: ContentItem): number {
  const publishedAt = item.createdAt;
  if (!publishedAt) return 0;
  const ageHours = (Date.now() - new Date(publishedAt).getTime()) / 3600000;
  if (ageHours <= 0) return 0;
  return Math.round(item.metrics.views / Math.max(ageHours, 1));
}

/** Growth rate as percentage: velocity relative to total views */
export function calcGrowthRate(item: ContentItem): number {
  const velocity = calcVelocity(item);
  if (item.metrics.views <= 0) return 0;
  return Math.round((velocity / item.metrics.views) * 10000) / 100; // percentage
}
