"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingUp, AlertTriangle, Link2, Users, Zap, Loader2 } from "lucide-react";
import { trends as mockTrends, countryLabel, languageLabel, emotionLabel } from "@/lib/mock-data";
import { useBrandPreset } from "@/lib/brand-context";
import { FilterPanel, FilterChips, type FilterGroup } from "@/components/layout/filter-panel";
import { cn } from "@/lib/utils";
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
const marketLabel: Record<Market, string> = { US: "北美", UK: "欧洲", AU: "澳洲", SEA: "东南亚" };

const allPlatforms: Platform[] = ["tiktok", "instagram", "youtube_shorts", "youtube"];
const allLifecycle: LifecycleStage[] = ["rising", "peak", "declining"];
const allFormats: ContentFormat[] = ["hashtag", "audio", "challenge", "short_video", "long_video"];
const allCountries = Object.keys(countryLabel) as Country[];
const allLanguages = Object.keys(languageLabel) as Language[];
const allEmotions = Object.keys(emotionLabel) as Emotion[];

export default function TrendsPage() {
  const { brandPreset, brandFilters } = useBrandPreset();

  // Multi-select filter state
  const [selPlatforms, setSelPlatforms] = useState<string[]>([]);
  const [selCountries, setSelCountries] = useState<string[]>([]);
  const [selLanguages, setSelLanguages] = useState<string[]>([]);
  const [selEmotions, setSelEmotions] = useState<string[]>([]);
  const [selGenders, setSelGenders] = useState<string[]>([]);
  const [selLifecycle, setSelLifecycle] = useState<string[]>([]);
  const [selFormats, setSelFormats] = useState<string[]>([]);
  const [overlapThreshold, setOverlapThreshold] = useState(0);

  // Committed filters (applied on submit)
  const [committed, setCommitted] = useState<{
    platforms: string[]; countries: string[]; languages: string[]; emotions: string[];
    genders: string[]; lifecycle: string[]; formats: string[]; overlap: number;
  }>({ platforms: [], countries: [], languages: [], emotions: [], genders: [], lifecycle: [], formats: [], overlap: 0 });

  // Data source
  const [dataSource, setDataSource] = useState<"mock" | "merged" | "youtube" | "google">("mock");
  const [apiData, setApiData] = useState<ContentItem[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [apiSources, setApiSources] = useState<string[]>([]);

  // Brand preset glow tracking
  const [presetGlow, setPresetGlow] = useState<Set<string>>(new Set());
  const prevPresetRef = useRef(brandPreset);

  // Sync brand preset
  useEffect(() => {
    if (brandPreset && !prevPresetRef.current) {
      setSelCountries([]); setSelLanguages([]); setSelEmotions([]);
      setSelGenders(brandFilters.gender === "all" ? [] : [brandFilters.gender]);
      setOverlapThreshold(0);
      setPresetGlow(new Set(["country", "language", "emotion", "gender"]));
    } else if (!brandPreset && prevPresetRef.current) {
      setSelPlatforms([]); setSelCountries([]); setSelLanguages([]); setSelEmotions([]);
      setSelGenders([]); setSelLifecycle([]); setSelFormats([]); setOverlapThreshold(0);
      setPresetGlow(new Set());
    }
    prevPresetRef.current = brandPreset;
  }, [brandPreset, brandFilters]);

  // API fetch
  const fetchApiData = useCallback(async () => {
    setApiLoading(true); setApiError(false);
    try {
      const res = await fetch(`/api/trends/all?source=${dataSource}&max=20`);
      if (res.ok) { const json = await res.json(); setApiData(json.items); setApiSources(json.sources); }
      else setApiError(true);
    } catch { setApiError(true); }
    finally { setApiLoading(false); }
  }, [dataSource]);

  useEffect(() => { if (dataSource !== "mock") fetchApiData(); }, [dataSource, fetchApiData]);

  const allTrends = dataSource === "mock" ? mockTrends : apiData;

  // Apply committed filters
  const filtered = allTrends
    .filter((t) => committed.platforms.length === 0 || committed.platforms.includes(t.platform))
    .filter((t) => {
      if (brandPreset && committed.countries.length === 0) return brandFilters.countries.includes(t.country);
      return committed.countries.length === 0 || committed.countries.includes(t.country);
    })
    .filter((t) => {
      if (brandPreset && committed.languages.length === 0) return brandFilters.languages.includes(t.language);
      return committed.languages.length === 0 || committed.languages.includes(t.language);
    })
    .filter((t) => {
      if (brandPreset && committed.emotions.length === 0) return brandFilters.emotions.includes(t.emotion);
      return committed.emotions.length === 0 || committed.emotions.includes(t.emotion);
    })
    .filter((t) => committed.genders.length === 0 || (
      committed.genders.includes("female") ? t.demographicAffinity.female >= 0.6 :
      committed.genders.includes("male") ? t.demographicAffinity.male >= 0.6 : true
    ))
    .filter((t) => committed.lifecycle.length === 0 || committed.lifecycle.includes(t.lifecycle.stage))
    .filter((t) => committed.formats.length === 0 || committed.formats.includes(t.format))
    .filter((t) => t.audienceOverlap >= committed.overlap)
    .sort((a, b) => b.audienceOverlap - a.audienceOverlap);

  // Active filter count
  const activeCount = committed.platforms.length + committed.countries.length + committed.languages.length +
    committed.emotions.length + committed.genders.length + committed.lifecycle.length +
    committed.formats.length + (committed.overlap > 0 ? 1 : 0);

  // Apply filters
  const applyFilters = () => {
    setCommitted({
      platforms: selPlatforms, countries: selCountries, languages: selLanguages,
      emotions: selEmotions, genders: selGenders, lifecycle: selLifecycle,
      formats: selFormats, overlap: overlapThreshold,
    });
  };

  // Reset
  const resetFilters = () => {
    setSelPlatforms([]); setSelCountries([]); setSelLanguages([]); setSelEmotions([]);
    setSelGenders([]); setSelLifecycle([]); setSelFormats([]); setOverlapThreshold(0);
    setCommitted({ platforms: [], countries: [], languages: [], emotions: [], genders: [], lifecycle: [], formats: [], overlap: 0 });
  };

  // Remove single chip
  const removeChip = (gk: string, v: string) => {
    const map: Record<string, [string[], (a: string[]) => void]> = {
      platform: [selPlatforms, setSelPlatforms], country: [selCountries, setSelCountries],
      language: [selLanguages, setSelLanguages], emotion: [selEmotions, setSelEmotions],
      gender: [selGenders, setSelGenders], lifecycle: [selLifecycle, setSelLifecycle],
      format: [selFormats, setSelFormats],
    };
    const [arr, setter] = map[gk] || [[], () => {}];
    setter(arr.filter((x) => x !== v));
  };

  // Build filter groups for panel
  const buildOptions = (key: string) => ({ value: key, label: key === "all" ? "全部" : key });
  const filterGroups: FilterGroup[] = [
    { key: "platform", label: "平台", glow: false, selected: selPlatforms.length ? selPlatforms : [],
      options: allPlatforms.map((p) => ({ value: p, label: platformLabel[p] || p })),
      onChange: (v) => { setPresetGlow((pg) => { pg.delete("platform"); return new Set(pg); }); setSelPlatforms(v.filter((x) => x !== "all")) } },
    { key: "country", label: "国家", glow: presetGlow.has("country"),
      selected: selCountries.length ? selCountries : [],
      options: allCountries.map((c) => ({ value: c, label: countryLabel[c] })),
      onChange: (v) => { setPresetGlow((pg) => { pg.delete("country"); return new Set(pg); }); setSelCountries(v.filter((x) => x !== "all")) } },
    { key: "language", label: "语言", glow: presetGlow.has("language"),
      selected: selLanguages.length ? selLanguages : [],
      options: allLanguages.map((l) => ({ value: l, label: languageLabel[l] })),
      onChange: (v) => { setPresetGlow((pg) => { pg.delete("language"); return new Set(pg); }); setSelLanguages(v.filter((x) => x !== "all")) } },
    { key: "emotion", label: "情绪", glow: presetGlow.has("emotion"),
      selected: selEmotions.length ? selEmotions : [],
      options: allEmotions.map((e) => ({ value: e, label: emotionLabel[e] })),
      onChange: (v) => { setPresetGlow((pg) => { pg.delete("emotion"); return new Set(pg); }); setSelEmotions(v.filter((x) => x !== "all")) } },
    { key: "gender", label: "人群·性别", glow: presetGlow.has("gender"),
      selected: selGenders.length ? selGenders : [],
      options: [{ value: "female", label: "女性为主" }, { value: "male", label: "男性为主" }],
      onChange: (v) => { setPresetGlow((pg) => { pg.delete("gender"); return new Set(pg); }); setSelGenders(v.filter((x) => x !== "all")) } },
    { key: "lifecycle", label: "生命周期", glow: false,
      selected: selLifecycle.length ? selLifecycle : [],
      options: allLifecycle.map((s) => ({ value: s, label: s === "rising" ? "Rising" : s === "peak" ? "Peak" : "Declining" })),
      onChange: (v) => setSelLifecycle(v.filter((x) => x !== "all")) },
    { key: "format", label: "内容格式", glow: false,
      selected: selFormats.length ? selFormats : [],
      options: allFormats.map((f) => ({ value: f, label: f === "hashtag" ? "Hashtag" : f === "audio" ? "Audio" : f === "challenge" ? "Challenge" : f === "short_video" ? "短视频" : "长视频" })),
      onChange: (v) => setSelFormats(v.filter((x) => x !== "all")) },
  ];

  // Active chips — include brand preset values when active
  const brandChipGroups = brandPreset ? [
    ...(committed.countries.length === 0 ? [{ key: "brand-country", label: "品牌·国家", activeValues: brandFilters.countries.slice(0, 3).map((c) => ({ value: c, label: countryLabel[c] })) }] : []),
    ...(committed.languages.length === 0 ? [{ key: "brand-language", label: "品牌·语言", activeValues: brandFilters.languages.slice(0, 3).map((l) => ({ value: l, label: languageLabel[l] })) }] : []),
    ...(committed.emotions.length === 0 ? [{ key: "brand-emotion", label: "品牌·情绪", activeValues: brandFilters.emotions.slice(0, 3).map((e) => ({ value: e, label: emotionLabel[e] })) }] : []),
    ...(committed.genders.length === 0 && brandFilters.gender !== "all" ? [{ key: "brand-gender", label: "品牌·性别", activeValues: [{ value: brandFilters.gender, label: brandFilters.gender === "female" ? "女性为主" : "男性为主" }] }] : []),
  ] : [];
  const chipGroups = [
    ...brandChipGroups,
    { key: "platform", label: "平台", activeValues: committed.platforms.map((v) => ({ value: v, label: platformLabel[v] || v })) },
    { key: "country", label: "国家", activeValues: committed.countries.map((v) => ({ value: v, label: countryLabel[v as Country] || v })) },
    { key: "language", label: "语言", activeValues: committed.languages.map((v) => ({ value: v, label: languageLabel[v as Language] || v })) },
    { key: "emotion", label: "情绪", activeValues: committed.emotions.map((v) => ({ value: v, label: emotionLabel[v as Emotion] || v })) },
    { key: "gender", label: "性别", activeValues: committed.genders.map((v) => ({ value: v, label: v === "female" ? "女性为主" : "男性为主" })) },
    { key: "lifecycle", label: "阶段", activeValues: committed.lifecycle.map((v) => ({ value: v, label: v === "rising" ? "Rising" : v === "peak" ? "Peak" : "Declining" })) },
    { key: "format", label: "格式", activeValues: committed.formats.map((v) => ({ value: v, label: v === "hashtag" ? "Hashtag" : v === "audio" ? "Audio" : v === "challenge" ? "Challenge" : v === "short_video" ? "短视频" : "长视频" })) },
    ...(committed.overlap > 0 ? [{ key: "overlap", label: "重合度", activeValues: [{ value: String(committed.overlap), label: `≥${committed.overlap}%` }] }] : []),
  ];

  return (
    <FilterPanel
      groups={filterGroups}
      overlapValue={overlapThreshold}
      onOverlapChange={setOverlapThreshold}
      onApply={applyFilters}
      onReset={resetFilters}
      activeCount={activeCount}
    >
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-50">实时热点</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            按受众重合度排序。右侧面板筛选 · 品牌预设自动匹配。
          </p>
        </div>

        {/* Toolbar: data source + brand preset status */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Data source toggle */}
          <span className="flex items-center gap-0.5 rounded-lg border border-slate-700 bg-slate-800/80 p-0.5">
            {(["mock", "merged", "youtube", "google"] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setDataSource(s); if (s === "mock") setApiData([]); }}
                className={cn("px-2 py-0.5 text-xs rounded-md transition-colors", dataSource === s ? "bg-amber-500/20 text-amber-400" : "text-slate-500 hover:text-slate-300")}
              >
                {s === "mock" ? "离线" : s === "merged" ? "混合" : s === "youtube" ? "YT" : "Google"}
              </button>
            ))}
          </span>
          {apiLoading && <Loader2 className="h-3 w-3 animate-spin text-amber-500" />}
          {apiError && (
            <button onClick={fetchApiData} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> API 失败，重试
            </button>
          )}
          {!apiLoading && !apiError && apiSources.length > 0 && (
            <span className="text-xs text-slate-500">{apiSources.map(s => s === "mock" ? "离线" : s === "youtube" ? "YouTube实时" : s).join(" + ")}</span>
          )}

          {brandPreset && (
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-xs text-amber-400 font-medium">◆ 品牌预设 · CHAGEE</span>
              {brandFilters.markets.map((m) => (
                <Badge key={m} variant="outline" className="text-xs border-amber-500/30 text-amber-400/80 bg-amber-500/5">{marketLabel[m]}</Badge>
              ))}
              <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400/80 bg-amber-500/5">
                {brandFilters.ageMin}-{brandFilters.ageMax}岁
              </Badge>
            </div>
          )}

          <span className="ml-auto text-xs text-slate-500">{filtered.length} 个结果</span>
        </div>

        {/* Active filter chips */}
        <FilterChips groups={chipGroups} onRemove={removeChip} onClearAll={resetFilters} />

        {/* Trend cards */}
        <div className="space-y-3">
          {filtered.map((trend) => (
            <Card key={trend.id} className="border-slate-700 bg-slate-800/50 hover:border-amber-500/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <OverlapBadge score={trend.audienceOverlap} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-slate-100">{trend.title}</h3>
                      {trend.id.startsWith("yt-") && <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">● YT</Badge>}
                      {trend.id.startsWith("goog-") && <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">● Google</Badge>}
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">{platformLabel[trend.platform]}</Badge>
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">{countryLabel[trend.country]}</Badge>
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">{languageLabel[trend.language]}</Badge>
                      <Badge variant="outline" className="text-xs border-slate-600 text-amber-400/80">{emotionLabel[trend.emotion]}</Badge>
                    </div>

                    <div className="flex items-start gap-3 mt-1">
                      {trend.thumbnailUrl && (
                        <img src={trend.thumbnailUrl} alt="" className="h-16 w-28 rounded-md object-cover border border-slate-700 shrink-0" loading="lazy" />
                      )}
                      <p className="text-sm text-slate-400 line-clamp-3">{trend.description}</p>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <LifecycleBadge stage={trend.lifecycle.stage} estimatedWindow={trend.lifecycle.estimatedWindow} crossPlatform={trend.lifecycle.crossPlatform} />
                      <span className="text-xs text-slate-500">竞品密度: {trend.lifecycle.competitorDensity === "low" ? "低" : trend.lifecycle.competitorDensity === "medium" ? "中" : "高"}</span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-amber-500" />热度 {(trend.metrics.views / 1000000).toFixed(0)}M</span>
                      <span className={cn("flex items-center gap-1", trend.metrics.growthRate > 0 ? "text-emerald-400" : "text-red-400")}>
                        <TrendingUp className="h-3 w-3" />{trend.metrics.growthRate > 0 ? "+" : ""}{trend.metrics.growthRate}%
                      </span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{(trend.demographicAffinity.female * 100).toFixed(0)}% 女 · {(trend.demographicAffinity.age_18_24 * 100).toFixed(0)}% 18-24</span>
                      {trend.audienceOverlap >= 80 && trend.lifecycle.stage === "rising" && (
                        <span className="inline-flex items-center gap-0.5 text-amber-400"><Zap className="h-3 w-3" /> 优先关注</span>
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
              <p className="text-sm mt-1">调整筛选条件获取更多结果</p>
            </div>
          )}
        </div>
      </div>
    </FilterPanel>
  );
}
