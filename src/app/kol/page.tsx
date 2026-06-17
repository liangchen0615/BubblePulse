"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FilterPanel, FilterChips, type FilterGroup } from "@/components/layout/filter-panel";
import { useBrandPreset } from "@/lib/brand-context";
import { kols as mockKols, countryLabel } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { KOL as KOLType } from "@/types";
import { Users, Search, DollarSign, Star, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Platform, ContentStyle, Country, Market } from "@/types";

const platformLabel: Record<Platform, string> = { tiktok: "TikTok", instagram: "Instagram", youtube_shorts: "YT Shorts", youtube: "YouTube" };
const styleLabel: Record<ContentStyle, string> = { ASMR: "ASMR", aesthetic: "Aesthetic", comedic: "Comedic", educational: "Educational", lifestyle: "Lifestyle", food_review: "Food Review" };
const allContentStyles: ContentStyle[] = ["ASMR", "aesthetic", "comedic", "educational", "lifestyle", "food_review"];

function OverlapBadge({ score }: { score: number }) {
  const color = score >= 80 ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : score >= 60 ? "border-amber-500/50 text-amber-400 bg-amber-500/10" : "border-blue-400/50 text-blue-400 bg-blue-400/10";
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium shrink-0", color)}>{score}% 重合</span>;
}

export default function KolPage() {
  const { brandPreset, activeStrategy, strategies, setActiveStrategy } = useBrandPreset();

  const [search, setSearch] = useState("");
  const [selPlatforms, setSelPlatforms] = useState<string[]>([]);
  const [selStyles, setSelStyles] = useState<string[]>([]);
  const [selCountries, setSelCountries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"overlap" | "fit">("overlap");
  const [selectedKol, setSelectedKol] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"mock" | "merged" | "youtube">("mock");
  const [apiData, setApiData] = useState<KOLType[]>([]);
  const [apiLoading, setApiLoading] = useState(false);

  const [committed, setCommitted] = useState<{ platforms: string[]; styles: string[]; countries: string[] }>({ platforms: [], styles: [], countries: [] });
  const [presetGlow, setPresetGlow] = useState<Set<string>>(new Set());

  // Fetch KOLs from API
  const fetchKols = () => {
    if (dataSource === "mock") { setApiData([]); return; }
    setApiLoading(true);
    fetch(`/api/kols/all?source=${dataSource}&max=10`)
      .then((r) => r.json()).then((d) => { setApiData(d.items); setApiLoading(false); })
      .catch(() => setApiLoading(false));
  };
  useEffect(() => { fetchKols(); }, [dataSource]);

  const allKols = dataSource === "mock" ? mockKols : (apiData.length > 0 ? apiData : mockKols);

  // Sync strategy → filter panel
  const [prevStrategyRef] = useState(() => activeStrategy?.id);
  useEffect(() => {
    if (brandPreset && activeStrategy && prevStrategyRef !== activeStrategy.id) {
      setSelCountries([...activeStrategy.countries]);
      setPresetGlow(new Set(["country"]));
      const c = { platforms: selPlatforms, styles: selStyles, countries: [...activeStrategy.countries] };
      setCommitted(c);
    } else if (!brandPreset) {
      setSelCountries([]); setPresetGlow(new Set());
      setCommitted({ platforms: selPlatforms, styles: selStyles, countries: [] });
    }
  }, [brandPreset, activeStrategy]);

  // Effective filter: strategy overrides when active
  const effCountries = brandPreset && activeStrategy ? activeStrategy.countries : committed.countries;

  const filtered = allKols
    .filter((k) => committed.platforms.length === 0 || committed.platforms.includes(k.platform))
    .filter((k) => committed.styles.length === 0 || k.contentStyleTags.some((s) => committed.styles.includes(s)))
    .filter((k) => effCountries.length === 0 || effCountries.includes(k.audienceProfile.region as any))
    .filter((k) => !search || k.handle.toLowerCase().includes(search.toLowerCase()) || k.displayName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "overlap" ? b.audienceOverlap - a.audienceOverlap : b.brandFitScore - a.brandFitScore);

  const activeCount = committed.platforms.length + committed.styles.length + committed.countries.length;
  const kol = allKols.find((k) => k.id === selectedKol);

  const matchKOLStrategy = (c: typeof committed): string | null => {
    const arrEq = (a: string[], b: string[]) => a.length === b.length && a.every((v) => b.includes(v));
    const match = strategies.find((s) => arrEq(c.countries, s.countries));
    return match?.id || null;
  };

  const applyFilters = () => {
    const c = { platforms: selPlatforms, styles: selStyles, countries: selCountries };
    setCommitted(c);
    if (!brandPreset) setActiveStrategy(matchKOLStrategy(c));
  };
  const resetFilters = () => { setSelPlatforms([]); setSelStyles([]); setSelCountries([]); setCommitted({ platforms: [], styles: [], countries: [] }); if (!brandPreset) setActiveStrategy(null); };
  const removeChip = (gk: string, v: string) => {
    const m: Record<string, [string[], (a: string[]) => void]> = { platform: [selPlatforms, setSelPlatforms], style: [selStyles, setSelStyles], country: [selCountries, setSelCountries] };
    const [arr, setter] = m[gk] || [[], () => {}]; setter(arr.filter((x) => x !== v));
  };

  const filterGroups: FilterGroup[] = [
    { key: "platform", label: "平台", selected: selPlatforms, onChange: setSelPlatforms, glow: false,
      options: (["tiktok", "instagram", "youtube"] as Platform[]).map((p) => ({ value: p, label: platformLabel[p] })) },
    { key: "style", label: "内容风格", selected: selStyles, onChange: setSelStyles, glow: false,
      options: allContentStyles.map((s) => ({ value: s, label: styleLabel[s] })) },
    { key: "country", label: "国家", selected: selCountries, onChange: setSelCountries, glow: presetGlow.has("country"),
      options: (Object.keys(countryLabel) as Country[]).map((c) => ({ value: c, label: countryLabel[c] })) },
  ];

  const chipGroups = [
    ...(brandPreset && activeStrategy ? [{ key: "brand-country" as string, label: "品牌·国家", activeValues: activeStrategy.countries.map((c) => ({ value: c, label: countryLabel[c] })) }] : []),
    { key: "platform", label: "平台", activeValues: committed.platforms.map((v) => ({ value: v, label: platformLabel[v as Platform] })) },
    { key: "style", label: "风格", activeValues: committed.styles.map((v) => ({ value: v, label: styleLabel[v as ContentStyle] })) },
    { key: "country", label: "国家", activeValues: committed.countries.map((v) => ({ value: v, label: countryLabel[v as Country] })) },
  ];

  return (
    <FilterPanel groups={filterGroups} overlapValue={0} onOverlapChange={() => {}} onApply={applyFilters} onReset={resetFilters} activeCount={activeCount}>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">KOL 发现</h1>
          <p className="mt-1 text-sm text-slate-400">
            {brandPreset && activeStrategy
              ? `按策略「${activeStrategy.name}」筛选 · ${activeStrategy.markets.map((m) => ({ US: "美国", UK: "英国", AU: "澳洲", SEA: "东南亚" }[m] || m)).join("·")}`
              : "基于品牌受众画像，按受众重合度推荐创作者"}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input placeholder="搜索 KOL..." className="pl-9 h-8 text-sm border-slate-700 bg-slate-800/50" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {/* Data source */}
          <span className="flex items-center gap-0.5 rounded-lg border border-slate-700 bg-slate-800/80 p-0.5">
            {(["mock", "merged", "youtube"] as const).map((s) => (
              <button key={s} onClick={() => setDataSource(s)} className={cn("px-2 py-0.5 text-xs rounded-md transition-colors", dataSource === s ? "bg-amber-500/20 text-amber-400" : "text-slate-500 hover:text-slate-300")}>
                {s === "mock" ? "离线" : s === "merged" ? "全网" : "YT"}
              </button>
            ))}
          </span>
          {apiLoading && <Loader2 className="h-3 w-3 animate-spin text-amber-500" />}

          <span className="flex items-center gap-0.5 rounded-lg border border-slate-700 bg-slate-800/80 p-0.5">
            {(["overlap", "fit"] as const).map((s) => (
              <button key={s} onClick={() => setSortBy(s)} className={cn("px-2 py-0.5 text-xs rounded-md transition-colors", sortBy === s ? "bg-amber-500/20 text-amber-400" : "text-slate-500 hover:text-slate-300")}>
                {s === "overlap" ? "按重合度" : "按匹配分"}
              </button>
            ))}
          </span>
          {brandPreset && activeStrategy && <span className="text-xs text-amber-400 font-medium">◆ {activeStrategy.name}</span>}
          <span className="text-xs text-slate-500 ml-auto">{filtered.length} 个结果</span>
        </div>

        <FilterChips groups={chipGroups} onRemove={removeChip} onClearAll={resetFilters} />

        <div className="grid grid-cols-2 gap-4">
          {filtered.map((k) => (
            <Card key={k.id} className="border-slate-700 bg-slate-800/50 hover:border-amber-500/20 transition-colors cursor-pointer" onClick={() => setSelectedKol(k.id)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-700 text-lg font-bold text-slate-200">{k.displayName.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-100">{k.handle}</h3>
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">{platformLabel[k.platform]}</Badge>
                    </div>
                    <p className="text-sm text-slate-400">{k.followers >= 1000 ? `${(k.followers / 1000).toFixed(0)}K` : k.followers} 粉丝 · 互动率 {k.avgEngagementRate}%</p>
                  </div>
                  <div className="flex flex-col items-center shrink-0">
                    <OverlapBadge score={k.audienceOverlap} />
                    <span className="text-2xl font-bold text-slate-100 mt-1">{k.brandFitScore}</span>
                    <span className="text-xs text-slate-500">匹配分</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {k.contentStyleTags.map((tag) => <Badge key={tag} variant="secondary" className="text-xs bg-slate-700 text-slate-300">{styleLabel[tag]}</Badge>)}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />受众重合 {k.audienceOverlap}%</span>
                  <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${(k.estimatedCostRange.min / 1000).toFixed(0)}K-{(k.estimatedCostRange.max / 1000).toFixed(0)}K/条</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-12 text-slate-500">
              <p>暂无匹配 KOL</p>
              <p className="text-sm mt-1">调整筛选条件或扩大粉丝量范围</p>
            </div>
          )}
        </div>

        <Sheet open={!!selectedKol} onOpenChange={(open) => !open && setSelectedKol(null)}>
          <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto border-slate-700 bg-slate-900">
            {kol && (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3 text-slate-50">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-700 text-xl font-bold text-slate-200">{kol.displayName.charAt(0)}</div>
                    <div>
                      <div className="text-lg">{kol.handle}</div>
                      <div className="text-sm text-slate-400 font-normal">{platformLabel[kol.platform]} · {kol.followers >= 1000 ? `${(kol.followers / 1000).toFixed(0)}K` : kol.followers} 粉丝</div>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-slate-700 p-3 text-center"><div className="text-lg font-bold text-amber-400">{kol.audienceOverlap}%</div><div className="text-xs text-slate-500">受众重合</div></div>
                    <div className="rounded-lg border border-slate-700 p-3 text-center"><div className="text-lg font-bold text-emerald-400">{kol.avgEngagementRate}%</div><div className="text-xs text-slate-500">互动率</div></div>
                    <div className="rounded-lg border border-slate-700 p-3 text-center"><div className="text-lg font-bold text-slate-100">{kol.brandFitScore}</div><div className="text-xs text-slate-500">匹配分</div></div>
                  </div>
                  <Separator className="bg-slate-700" />
                  <div><h4 className="text-sm font-medium text-slate-200 mb-2">内容风格</h4><div className="flex flex-wrap gap-1">{kol.contentStyleTags.map((tag) => <Badge key={tag} variant="secondary" className="bg-slate-700 text-slate-300">{styleLabel[tag]}</Badge>)}</div></div>
                  <div><h4 className="text-sm font-medium text-slate-200 mb-2">受众画像</h4><p className="text-sm text-slate-400">{kol.audienceProfile.age} · {kol.audienceProfile.gender} · {kol.audienceProfile.region}</p><p className="text-sm text-slate-500 mt-1">兴趣: {kol.audienceProfile.interests.join(" · ")}</p></div>
                  {kol.recentViralPosts && kol.recentViralPosts.length > 0 && (
                    <>
                      <Separator className="bg-slate-700" />
                      <div>
                        <div className="flex items-center gap-2 mb-3"><BarChart3 className="h-4 w-4 text-amber-500" /><h4 className="text-sm font-medium text-slate-200">近期内容互动量</h4></div>
                        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-2">
                          <ResponsiveContainer width="100%" height={140}>
                            <BarChart data={kol.recentViralPosts} layout="vertical" margin={{ top: 0, right: 12, left: -20, bottom: 0 }}>
                              <XAxis type="number" tick={false} axisLine={false} />
                              <YAxis type="category" dataKey="postTitle" tick={{ fontSize: 11, fill: "#94A3B8" }} width={100} axisLine={false} tickLine={false} />
                              <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px", color: "#F8FAFC" }} formatter={(value) => [`${(Number(value) / 1000).toFixed(0)}K`, "互动"]} />
                              <Bar dataKey="engagement" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={16} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </>
                  )}
                  {kol.brandCollabHistory.length > 0 && (
                    <>
                      <Separator className="bg-slate-700" />
                      <div><h4 className="text-sm font-medium text-slate-200 mb-2">品牌合作历史</h4>
                        {kol.brandCollabHistory.map((h, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-slate-400 mb-1"><Badge variant="outline" className="text-xs border-slate-600 text-slate-300">{h.brand}</Badge><span>{h.type} · {h.date}</span></div>
                        ))}
                      </div>
                    </>
                  )}
                  <Separator className="bg-slate-700" />

                  {/* Brand safety + content quality */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-200 mb-2">品牌适配评估</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {(() => {
                        const collabCount = kol.brandCollabHistory.length;
                        const safetyScore = collabCount > 0 ? 85 + collabCount * 3 : 75;
                        const qualityScore = Math.round(kol.avgEngagementRate * 15 + (kol.audienceOverlap / 10));
                        const recentViral = kol.recentViralPosts && kol.recentViralPosts.length > 0 ? kol.recentViralPosts.length : 0;
                        return (
                          <>
                            <div className="rounded-lg border border-slate-700 p-2 text-center">
                              <div className={cn("text-sm font-bold", safetyScore >= 90 ? "text-emerald-400" : "text-amber-400")}>{safetyScore}</div>
                              <div className="text-[10px] text-slate-500">品牌安全</div>
                            </div>
                            <div className="rounded-lg border border-slate-700 p-2 text-center">
                              <div className="text-sm font-bold text-blue-400">{qualityScore}</div>
                              <div className="text-[10px] text-slate-500">内容质量</div>
                            </div>
                            <div className="rounded-lg border border-slate-700 p-2 text-center">
                              <div className={cn("text-sm font-bold", recentViral >= 2 ? "text-emerald-400" : "text-slate-400")}>{recentViral}条</div>
                              <div className="text-[10px] text-slate-500">近期爆款</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    {kol.brandCollabHistory.length > 0 && (
                      <div className="mt-2 rounded-lg border border-slate-700 bg-slate-800/50 p-2">
                        <div className="text-[10px] text-slate-500 mb-1">合作品牌: {kol.brandCollabHistory.map((h) => h.brand).join(" · ")}</div>
                        <div className="text-[10px] text-slate-500">最近合作: {kol.brandCollabHistory[kol.brandCollabHistory.length - 1]?.date}</div>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-slate-700" />

                  {/* ROI metrics */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-200 mb-2">ROI 预估</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {(() => {
                        const avgCost = (kol.estimatedCostRange.min + kol.estimatedCostRange.max) / 2;
                        const estExposure = kol.followers * 0.15;
                        const cpm = Math.round(avgCost / (estExposure / 1000));
                        const estEngagement = Math.round(kol.followers * kol.avgEngagementRate / 100);
                        const engagementROI = (estEngagement / avgCost).toFixed(2);
                        const matchPremium = (kol.audienceOverlap * kol.avgEngagementRate / Math.max(cpm, 1)).toFixed(1);
                        return (
                          <>
                            <div className="rounded-lg border border-slate-700 p-2 text-center">
                              <div className="text-sm font-bold text-amber-400">${cpm}</div>
                              <div className="text-[10px] text-slate-500">CPM</div>
                            </div>
                            <div className="rounded-lg border border-slate-700 p-2 text-center">
                              <div className="text-sm font-bold text-emerald-400">{engagementROI}</div>
                              <div className="text-[10px] text-slate-500">互动ROI</div>
                            </div>
                            <div className="rounded-lg border border-slate-700 p-2 text-center">
                              <div className="text-sm font-bold text-blue-400">{matchPremium}</div>
                              <div className="text-[10px] text-slate-500">匹配溢价</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <Separator className="bg-slate-700" />
                  <div><h4 className="text-sm font-medium text-slate-200 mb-2">预估合作费用</h4><p className="text-lg font-bold text-slate-100">${kol.estimatedCostRange.min.toLocaleString()} - ${kol.estimatedCostRange.max.toLocaleString()}/条</p></div>
                  <div className="flex gap-2 pt-2"><Button className="flex-1 gap-1 bg-amber-500 text-black hover:bg-amber-400"><Star className="h-4 w-4" /> 收藏到品牌KOL库</Button><Button variant="outline" className="gap-1 border-slate-700 text-slate-300">导出报告</Button></div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </FilterPanel>
  );
}
