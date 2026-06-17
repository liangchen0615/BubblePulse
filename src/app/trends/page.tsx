"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Flame, TrendingUp, AlertTriangle, Link2, Users, Zap, SlidersHorizontal, X, Radio, Loader2 } from "lucide-react";
import { trends as mockTrends, countryLabel, languageLabel, emotionLabel } from "@/lib/mock-data";
import { useBrandPreset } from "@/lib/brand-context";
import { cn } from "@/lib/utils";
import { FilterSelect } from "@/components/ui/filter-select";
import type { Platform, LifecycleStage, ContentFormat, Country, Language, Emotion, Market, ContentItem } from "@/types";

function OverlapBadge({ score }: { score: number }) {
  const color =
    score >= 90 ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" :
    score >= 80 ? "border-amber-500/50 text-amber-400 bg-amber-500/10" :
    "border-blue-400/50 text-blue-400 bg-blue-400/10";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium shrink-0", color)}>
      {score}% 重合
    </span>
  );
}

function LifecycleBadge({ stage, estimatedWindow, crossPlatform }: {
  stage: LifecycleStage; estimatedWindow: string; crossPlatform: boolean;
}) {
  const config = {
    rising: "border-emerald-500/50 text-emerald-400 bg-emerald-500/10",
    peak: "border-amber-500/50 text-amber-400 bg-amber-500/10",
    declining: "border-red-500/50 text-red-400 bg-red-500/10",
  };
  const label = stage === "rising" ? "Rising" : stage === "peak" ? "Peak" : "Declining";
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className={cn("rounded-full border px-2 py-0.5 font-medium", config[stage])}>{label}</span>
      <span className="text-slate-500">窗口 {estimatedWindow}</span>
      {crossPlatform && (
        <span className="inline-flex items-center gap-0.5 text-blue-400">
          <Link2 className="h-3 w-3" /> 跨平台
        </span>
      )}
    </div>
  );
}

const platformLabel: Record<string, string> = {
  tiktok: "TikTok", instagram: "Instagram", youtube_shorts: "YT Shorts", youtube: "YouTube",
};
const formatLabel: Record<ContentFormat, string> = {
  hashtag: "Hashtag", audio: "Audio", challenge: "Challenge", short_video: "短视频", long_video: "长视频",
};
const marketLabel: Record<Market, string> = { US: "北美", UK: "欧洲", AU: "澳洲", SEA: "东南亚" };

const regionCountries: Record<Market, Country[]> = {
  US: ["US", "CA"],
  UK: ["UK", "FR", "DE"],
  AU: ["AU"],
  SEA: ["SG", "MY", "TH", "ID", "PH", "VN", "JP", "KR", "CN"],
};

export default function TrendsPage() {
  const { brandPreset, brandFilters } = useBrandPreset();

  const [platform, setPlatform] = useState<string>("all");
  const [region, setRegion] = useState<string>("all");
  const [country, setCountry] = useState<string>("all");
  const [language, setLanguage] = useState<string>("all");
  const [emotion, setEmotion] = useState<string>("all");
  const [gender, setGender] = useState<string>("all");
  const [lifecycleStage, setLifecycleStage] = useState<string>("all");
  const [format, setFormat] = useState<string>("all");
  const [overlapThreshold, setOverlapThreshold] = useState(0);
  const [showFilters, setShowFilters] = useState(true);
  const [dataSource, setDataSource] = useState<"mock" | "merged" | "youtube" | "google">("mock");
  const [apiData, setApiData] = useState<ContentItem[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [apiSources, setApiSources] = useState<string[]>([]);

  // Track which filters are brand-preset (for amber glow) vs user overridden
  const [presetGlow, setPresetGlow] = useState<Set<string>>(new Set());
  const prevPresetRef = useRef(brandPreset);

  // Sync filters with brand preset
  useEffect(() => {
    if (brandPreset && !prevPresetRef.current) {
      // Turning ON: pre-fill from brand
      setRegion("all");
      setCountry("all"); // show all brand-countries via filter logic
      setLanguage("all");
      setEmotion("all");
      setGender(brandFilters.gender);
      setLifecycleStage("all");
      setFormat("all");
      setOverlapThreshold(0);
      setPresetGlow(new Set(["country", "language", "emotion", "gender"]));
    } else if (!brandPreset && prevPresetRef.current) {
      // Turning OFF: reset all
      setRegion("all"); setCountry("all"); setLanguage("all"); setEmotion("all");
      setGender("all"); setLifecycleStage("all"); setFormat("all"); setOverlapThreshold(0);
      setPresetGlow(new Set());
    }
    prevPresetRef.current = brandPreset;
  }, [brandPreset, brandFilters]);

  const fetchApiData = useCallback(async () => {
    setApiLoading(true);
    setApiError(false);
    try {
      const res = await fetch(`/api/trends/all?source=${dataSource}&max=20`);
      if (res.ok) {
        const json = await res.json();
        setApiData(json.items);
        setApiSources(json.sources);
      } else {
        setApiError(true);
      }
    } catch {
      setApiError(true);
    } finally {
      setApiLoading(false);
    }
  }, [dataSource]);

  useEffect(() => {
    if (dataSource !== "mock") {
      fetchApiData();
    }
  }, [dataSource, fetchApiData]);

  const allTrends = dataSource === "mock" ? mockTrends : apiData;

  const filtered = allTrends
    .filter((t) => platform === "all" || t.platform === platform)
    .filter((t) => {
      if (brandPreset) return brandFilters.countries.includes(t.country);
      return country === "all" || t.country === country;
    })
    .filter((t) => {
      if (brandPreset) return brandFilters.languages.includes(t.language);
      return language === "all" || t.language === language;
    })
    .filter((t) => {
      if (brandPreset) return brandFilters.emotions.includes(t.emotion);
      return emotion === "all" || t.emotion === emotion;
    })
    .filter((t) => lifecycleStage === "all" || t.lifecycle.stage === lifecycleStage)
    .filter((t) => format === "all" || t.format === format)
    .filter((t) => t.audienceOverlap >= overlapThreshold)
    .filter((t) => {
      const g = brandPreset ? brandFilters.gender : gender;
      if (g === "all") return true;
      return g === "female" ? t.demographicAffinity.female >= 0.6 : t.demographicAffinity.male >= 0.6;
    })
    .sort((a, b) => b.audienceOverlap - a.audienceOverlap);

  const effectiveCountry = country;
  const effectiveLanguage = language;
  const effectiveEmotion = emotion;
  const effectiveGender = brandPreset ? brandFilters.gender : gender;
  const countriesForRegion = region !== "all" ? regionCountries[region as Market] : null;

  // Wrappers that remove preset glow on manual user edit
  const onPlatformChange = (v: string) => { setPresetGlow((p) => { const n = new Set(p); n.delete("platform"); return n; }); setPlatform(v); };
  const onRegionChange = (v: string) => { setPresetGlow((p) => { const n = new Set(p); n.delete("region"); return n; }); setRegion(v); setCountry("all"); };
  const onCountryChange = (v: string) => { setPresetGlow((p) => { const n = new Set(p); n.delete("country"); return n; }); setCountry(v); };
  const onLanguageChange = (v: string) => { setPresetGlow((p) => { const n = new Set(p); n.delete("language"); return n; }); setLanguage(v); };
  const onEmotionChange = (v: string) => { setPresetGlow((p) => { const n = new Set(p); n.delete("emotion"); return n; }); setEmotion(v); };
  const onGenderChange = (v: string) => { setPresetGlow((p) => { const n = new Set(p); n.delete("gender"); return n; }); setGender(v); };
  const onLifecycleChange = (v: string) => { setPresetGlow((p) => { const n = new Set(p); n.delete("lifecycle"); return n; }); setLifecycleStage(v); };
  const onFormatChange = (v: string) => { setPresetGlow((p) => { const n = new Set(p); n.delete("format"); return n; }); setFormat(v); };

  const activeFilterCount = (
    brandPreset
      ? [platform, lifecycleStage, format]
      : [platform, region, country, language, emotion, lifecycleStage, format, gender]
  ).filter((v) => v !== "all").length + (overlapThreshold > 0 ? 1 : 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">实时热点</h1>
        <p className="mt-1 text-sm text-slate-400">
          按受众重合度排序。自由筛选：地理位置 · 语言 · 情绪 · 人群。
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors",
              showFilters
                ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                : "border-slate-700 text-slate-400 hover:border-slate-600"
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            筛选 {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setPlatform("all"); setRegion("all"); setCountry("all"); setLanguage("all");
                setEmotion("all"); setLifecycleStage("all"); setFormat("all"); setGender("all");
                setOverlapThreshold(0);
              }}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
            >
              <X className="h-3 w-3" /> 清除全部
            </button>
          )}
          <span className="ml-auto flex items-center gap-2">
            {/* Data source toggle */}
            <span className="flex items-center gap-0.5 rounded-lg border border-slate-700 bg-slate-800/80 p-0.5">
              {(["mock", "merged", "youtube", "google"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setDataSource(s);
                    if (s === "mock") setApiData([]);
                  }}
                  className={cn(
                    "px-2 py-0.5 text-xs rounded-md transition-colors",
                    dataSource === s
                      ? "bg-amber-500/20 text-amber-400"
                      : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {s === "mock" ? "离线" : s === "merged" ? "混合" : s === "youtube" ? "YT" : s === "google" ? "Google" : "TT"}
                </button>
              ))}
            </span>
            {apiLoading && <Loader2 className="h-3 w-3 animate-spin text-amber-500" />}
            {apiError && (
              <button onClick={fetchApiData} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> API 失败，点击重试
              </button>
            )}
            {!apiLoading && !apiError && apiSources.length > 0 && (
              <span className="text-xs text-slate-500">{apiSources.map(s => s === "mock" ? "离线" : s === "youtube" ? "YouTube实时" : s).join(" + ")}</span>
            )}
            <span className="text-xs text-slate-500">{filtered.length} 个结果</span>
          </span>
        </div>

        {showFilters && (
          <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-3 space-y-3">
            {brandPreset && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-amber-400 font-medium">◆ 品牌预设 · CHAGEE</span>
                <span className="text-xs text-slate-600">—</span>
                {brandFilters.markets.map((m) => (
                  <Badge key={m} variant="outline" className="text-xs border-amber-500/30 text-amber-400/80 bg-amber-500/5">
                    {marketLabel[m]}
                  </Badge>
                ))}
                <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400/80 bg-amber-500/5">
                  {brandFilters.ageMin}-{brandFilters.ageMax}岁
                </Badge>
                <span className="text-xs text-slate-600">—</span>
                <span className="text-xs text-slate-500">筛选已预填品牌值（发光项），可手动修改</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <FilterSelect
                label="平台"
                value={platform}
                onValueChange={onPlatformChange}
                options={[
                  { value: "all", label: "全部平台" },
                  { value: "tiktok", label: "TikTok" },
                  { value: "instagram", label: "Instagram" },
                  { value: "youtube_shorts", label: "YT Shorts" },
                  { value: "youtube", label: "YouTube" },
                ]}
              />
              <FilterSelect
                label="区域"
                value={region}
                onValueChange={onRegionChange}
                options={[
                  { value: "all", label: "全部区域" },
                  { value: "US", label: "北美" },
                  { value: "UK", label: "欧洲" },
                  { value: "AU", label: "澳洲" },
                  { value: "SEA", label: "东南亚" },
                ]}
              />
              <FilterSelect
                label="国家"
                value={country}
                onValueChange={onCountryChange}
                glow={presetGlow.has("country")}
                options={[
                  { value: "all", label: "全部国家" },
                  ...(countriesForRegion || Object.keys(countryLabel) as Country[]).map((c) => ({
                    value: c,
                    label: countryLabel[c],
                  })),
                ]}
              />
              <FilterSelect
                label="语言"
                value={language}
                onValueChange={onLanguageChange}
                glow={presetGlow.has("language")}
                options={[
                  { value: "all", label: "全部语言" },
                  ...(Object.keys(languageLabel) as Language[]).map((l) => ({
                    value: l,
                    label: languageLabel[l],
                  })),
                ]}
              />
              <FilterSelect
                label="情绪"
                value={emotion}
                onValueChange={onEmotionChange}
                glow={presetGlow.has("emotion")}
                width="w-32"
                options={[
                  { value: "all", label: "全部情绪" },
                  ...(Object.keys(emotionLabel) as Emotion[]).map((e) => ({
                    value: e,
                    label: emotionLabel[e],
                  })),
                ]}
              />
              <FilterSelect
                label="性别"
                value={gender}
                onValueChange={onGenderChange}
                glow={presetGlow.has("gender")}
                options={[
                  { value: "all", label: "全部性别" },
                  { value: "female", label: "女性为主" },
                  { value: "male", label: "男性为主" },
                ]}
              />
              <FilterSelect
                label="阶段"
                value={lifecycleStage}
                onValueChange={onLifecycleChange}
                options={[
                  { value: "all", label: "全部阶段" },
                  { value: "rising", label: "Rising" },
                  { value: "peak", label: "Peak" },
                  { value: "declining", label: "Declining" },
                ]}
              />
              <FilterSelect
                label="格式"
                value={format}
                onValueChange={onFormatChange}
                options={[
                  { value: "all", label: "全部格式" },
                  { value: "hashtag", label: "Hashtag" },
                  { value: "audio", label: "Audio" },
                  { value: "challenge", label: "Challenge" },
                  { value: "short_video", label: "短视频" },
                  { value: "long_video", label: "长视频" },
                ]}
              />
            </div>

            {/* Overlap threshold */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 shrink-0">受众重合度 ≥ {overlapThreshold}%</span>
              <Slider
                value={[overlapThreshold]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  if (val !== undefined) setOverlapThreshold(val);
                }}
                min={0}
                max={100}
                step={5}
                className="w-40"
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {filtered.map((trend) => (
          <Card key={trend.id} className="border-slate-700 bg-slate-800/50 hover:border-amber-500/20 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <OverlapBadge score={trend.audienceOverlap} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-slate-100">{trend.title}</h3>
                    {trend.id.startsWith("yt-") && (
                      <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">● YT</Badge>
                    )}
                    {trend.id.startsWith("goog-") && (
                      <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">● Google</Badge>
                    )}
                    {trend.id.startsWith("tt-") && (
                      <Badge className="text-xs bg-pink-500/20 text-pink-400 border-pink-500/30">● TT</Badge>
                    )}
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">{platformLabel[trend.platform]}</Badge>
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">{countryLabel[trend.country]}</Badge>
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">{languageLabel[trend.language]}</Badge>
                    <Badge variant="outline" className="text-xs border-slate-600 text-amber-400/80">{emotionLabel[trend.emotion]}</Badge>
                  </div>

                  <div className="flex items-start gap-3 mt-1">
                    {trend.thumbnailUrl && (
                      <img
                        src={trend.thumbnailUrl}
                        alt=""
                        className="h-16 w-28 rounded-md object-cover border border-slate-700 shrink-0"
                        loading="lazy"
                      />
                    )}
                    <p className="text-sm text-slate-400 line-clamp-3">{trend.description}</p>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <LifecycleBadge
                      stage={trend.lifecycle.stage}
                      estimatedWindow={trend.lifecycle.estimatedWindow}
                      crossPlatform={trend.lifecycle.crossPlatform}
                    />
                    <span className="text-xs text-slate-500">
                      竞品密度: {trend.lifecycle.competitorDensity === "low" ? "低" : trend.lifecycle.competitorDensity === "medium" ? "中" : "高"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3 text-amber-500" />
                      热度 {(trend.metrics.views / 1000000).toFixed(0)}M
                    </span>
                    <span className={cn("flex items-center gap-1", trend.metrics.growthRate > 0 ? "text-emerald-400" : "text-red-400")}>
                      <TrendingUp className="h-3 w-3" />
                      {trend.metrics.growthRate > 0 ? "+" : ""}{trend.metrics.growthRate}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {(trend.demographicAffinity.female * 100).toFixed(0)}% 女 · {(trend.demographicAffinity.age_18_24 * 100).toFixed(0)}% 18-24
                    </span>
                    {trend.audienceOverlap >= 80 && trend.lifecycle.stage === "rising" && (
                      <span className="inline-flex items-center gap-0.5 text-amber-400">
                        <Zap className="h-3 w-3" /> 优先关注
                      </span>
                    )}
                  </div>

                  {trend.riskFlags && trend.riskFlags.length > 0 && (
                    <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5">
                      {trend.riskFlags.map((rf, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                          <span className="text-xs text-amber-300">
                            {rf.type === "cultural_sensitivity" ? "文化敏感" : rf.type === "religious" ? "宗教" : "品牌安全"}
                            {rf.level === "low" ? "（低）" : rf.level === "medium" ? "（中）" : "（高）"}: {rf.note}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>本周暂无高重合度热点</p>
            <p className="text-sm mt-1">以下是全平台热门内容</p>
          </div>
        )}
      </div>
    </div>
  );
}
