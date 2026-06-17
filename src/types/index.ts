export type Platform = "tiktok" | "instagram" | "youtube_shorts" | "youtube";
export type ContentFormat = "hashtag" | "audio" | "challenge" | "short_video" | "long_video";
export type LifecycleStage = "rising" | "peak" | "declining";
export type Feasibility = "high" | "medium" | "low";
export type IpCategory = "anime" | "game" | "movie" | "character" | "meme";
export type ContentStyle = "ASMR" | "aesthetic" | "comedic" | "educational" | "lifestyle" | "food_review";
export type Market = "US" | "UK" | "AU" | "SEA";
export type Country = "US" | "UK" | "AU" | "SG" | "MY" | "TH" | "ID" | "PH" | "VN" | "JP" | "KR" | "FR" | "DE" | "CA" | "CN";
export type Language = "en" | "zh" | "ja" | "ko" | "th" | "id" | "vi" | "tl" | "ms" | "fr" | "de" | "es";
export type Emotion = "joy" | "calm" | "humor" | "nostalgia" | "excitement" | "empathy" | "awe" | "curiosity";
export type RiskType = "cultural_sensitivity" | "religious" | "brand_safety";

export interface RiskFlag {
  type: RiskType;
  level: "low" | "medium" | "high";
  note: string;
}

export interface Lifecycle {
  stage: LifecycleStage;
  estimatedWindow: string;
  crossPlatform: boolean;
  competitorDensity: "low" | "medium" | "high";
}

export interface ContentMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  growthRate: number;
  heatScore: number;
}

export interface DemographicAffinity {
  age_18_24: number;
  age_25_34: number;
  age_35_44: number;
  female: number;
  male: number;
}

export interface ContentItem {
  id: string;
  platform: Platform;
  title: string;
  description: string;
  thumbnailUrl: string;
  url: string;
  metrics: ContentMetrics;
  format: ContentFormat;
  tags: string[];
  country: Country;
  language: Language;
  emotion: Emotion;
  demographicAffinity: DemographicAffinity;
  audienceOverlap: number;
  lifecycle: Lifecycle;
  riskFlags?: RiskFlag[];
  createdAt: string;
}

export interface BrandCollaboration {
  brand: string;
  date: string;
  type: string;
}

export interface KOLViralPost {
  postTitle: string;
  views: number;
  engagement: number;
  platform: Platform;
}

export interface KOL {
  id: string;
  handle: string;
  platform: Platform;
  displayName: string;
  avatarUrl: string;
  followers: number;
  avgEngagementRate: number;
  contentStyleTags: ContentStyle[];
  audienceProfile: {
    age: string;
    gender: string;
    interests: string[];
    region: string;
  };
  recentViralPosts: KOLViralPost[];
  brandCollabHistory: BrandCollaboration[];
  estimatedCostRange: { min: number; max: number };
  brandFitScore: number;
  audienceOverlap: number;
}

export interface IP {
  id: string;
  name: string;
  category: IpCategory;
  heatScore: number;
  trendDirection: "up" | "stable" | "down";
  audienceOverlap: number;
  audienceProfile: string;
  collabPrecedents: {
    brand: string;
    year: number;
    description: string;
    socialImpression: string;
  }[];
  feasibility: Feasibility;
  competitorOccupied: boolean;
  imageUrl: string;
}

export interface Brand {
  id: string;
  name: string;
  category: string;
  priceTier: string;
  visualStyle: string[];
  markets: Market[];
  targetAudiences: {
    id: string;
    name: string;
    ageRange: [number, number];
    gender: "male" | "female" | "all";
    interests: string[];
  }[];
}

export interface BrandStrategy {
  id: string;
  name: string;
  markets: Market[];
  countries: Country[];
  languages: Language[];
  emotions: Emotion[];
  ageMin: number;
  ageMax: number;
  gender: "female" | "male" | "all";
}

export interface CalendarEvent {
  id: string;
  date: string;
  region: Market;
  country: Country;
  name: string;
  type: "cultural" | "sports" | "holiday" | "festival";
  suggestion: string;
}

export interface WeeklyBrief {
  weekStart: string;
  brandName: string;
  topOpportunities: {
    rank: number;
    title: string;
    audienceOverlap: number;
    window: string;
    action: string;
    expectedBoost: string;
  }[];
  kolRecommendations: {
    handle: string;
    reason: string;
    fitScore: number;
    costRange: string;
  }[];
  ipWatchlist: {
    name: string;
    reason: string;
    urgency: string;
  }[];
  contentCalendar: {
    day: string;
    content: string;
  }[];
}
