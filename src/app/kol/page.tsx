"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Users, Search, DollarSign, Star, SlidersHorizontal, X, BarChart3 } from "lucide-react";
import { kols, countryLabel } from "@/lib/mock-data";
import { useBrandPreset } from "@/lib/brand-context";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Platform, ContentStyle, Country, Market } from "@/types";

const platformLabel: Record<Platform, string> = {
  tiktok: "TikTok", instagram: "Instagram", youtube_shorts: "YT Shorts", youtube: "YouTube",
};
const styleLabel: Record<ContentStyle, string> = {
  ASMR: "ASMR", aesthetic: "Aesthetic", comedic: "Comedic",
  educational: "Educational", lifestyle: "Lifestyle", food_review: "Food Review",
};
const marketLabel: Record<Market, string> = { US: "北美", UK: "欧洲", AU: "澳洲", SEA: "东南亚" };

const regionCountries: Record<Market, Country[]> = {
  US: ["US", "CA"],
  UK: ["UK", "FR", "DE"],
  AU: ["AU"],
  SEA: ["SG", "MY", "TH", "ID", "PH", "VN", "JP", "KR", "CN"],
};

function OverlapBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" :
    score >= 60 ? "border-amber-500/50 text-amber-400 bg-amber-500/10" :
    "border-blue-400/50 text-blue-400 bg-blue-400/10";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium shrink-0", color)}>
      {score}% 重合
    </span>
  );
}

export default function KolPage() {
  const { brandPreset, brandFilters } = useBrandPreset();

  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [region, setRegion] = useState<string>("all");
  const [country, setCountry] = useState<string>("all");
  const [style, setStyle] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("overlap");
  const [selectedKol, setSelectedKol] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  const countriesForRegion = region !== "all" ? regionCountries[region as Market] : null;

  const filtered = kols
    .filter((k) => selectedPlatform === "all" || k.platform === selectedPlatform)
    .filter((k) => style === "all" || k.contentStyleTags.includes(style as ContentStyle))
    .filter((k) => !search || k.handle.toLowerCase().includes(search.toLowerCase()) || k.displayName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "overlap" ? b.audienceOverlap - a.audienceOverlap : b.brandFitScore - a.brandFitScore);

  const activeFilterCount = brandPreset
    ? [selectedPlatform, style].filter((v) => v !== "all").length
    : [selectedPlatform, region, style].filter((v) => v !== "all").length;

  const kol = kols.find((k) => k.id === selectedKol);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">KOL 发现</h1>
        <p className="mt-1 text-sm text-slate-400">
          基于品牌受众画像，按受众重合度推荐创作者
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="搜索 KOL..."
            className="pl-9 h-8 text-sm border-slate-700 bg-slate-800/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors h-8",
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
              setSelectedPlatform("all"); setStyle("all");
              if (!brandPreset) { setRegion("all"); setCountry("all"); }
            }}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
          >
            <X className="h-3 w-3" /> 清除
          </button>
        )}

        <Select value={sortBy} onValueChange={(v) => setSortBy(v || "overlap")}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue placeholder="排序" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overlap">按受众重合度</SelectItem>
            <SelectItem value="fit">按匹配分</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <span className="text-xs text-slate-500">{filtered.length} 个结果</span>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {brandPreset && (
            <>
              <span className="text-xs text-amber-400 font-medium">🔗 品牌预设</span>
              <span className="text-xs text-slate-600">—</span>
            </>
          )}
          <Select value={selectedPlatform} onValueChange={(v) => setSelectedPlatform(v || "all")}>
            <SelectTrigger className="w-28 h-7 text-xs">
              <SelectValue placeholder="平台" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部平台</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>
          <Select value={style} onValueChange={(v) => setStyle(v || "all")}>
            <SelectTrigger className="w-28 h-7 text-xs">
              <SelectValue placeholder="风格" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部风格</SelectItem>
              {(Object.keys(styleLabel) as ContentStyle[]).map((s) => (
                <SelectItem key={s} value={s}>{styleLabel[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!brandPreset && (
            <>
              <Select value={region} onValueChange={(v) => { setRegion(v || "all"); setCountry("all"); }}>
                <SelectTrigger className="w-24 h-7 text-xs">
                  <SelectValue placeholder="区域" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部区域</SelectItem>
                  <SelectItem value="US">北美</SelectItem>
                  <SelectItem value="UK">欧洲</SelectItem>
                  <SelectItem value="AU">澳洲</SelectItem>
                  <SelectItem value="SEA">东南亚</SelectItem>
                </SelectContent>
              </Select>
              <Select value={country} onValueChange={(v) => setCountry(v || "all")}>
                <SelectTrigger className="w-24 h-7 text-xs">
                  <SelectValue placeholder="国家" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部国家</SelectItem>
                  {(countriesForRegion || Object.keys(countryLabel) as Country[]).map((c) => (
                    <SelectItem key={c} value={c}>{countryLabel[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {filtered.map((k) => (
          <Card
            key={k.id}
            className="border-slate-700 bg-slate-800/50 hover:border-amber-500/20 transition-colors cursor-pointer"
            onClick={() => setSelectedKol(k.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-700 text-lg font-bold text-slate-200">
                  {k.displayName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-100">{k.handle}</h3>
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                      {platformLabel[k.platform]}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400">
                    {k.followers >= 1000 ? `${(k.followers / 1000).toFixed(0)}K` : k.followers} 粉丝 · 互动率 {k.avgEngagementRate}%
                  </p>
                </div>
                <div className="flex flex-col items-center shrink-0">
                  <OverlapBadge score={k.audienceOverlap} />
                  <span className="text-2xl font-bold text-slate-100 mt-1">{k.brandFitScore}</span>
                  <span className="text-xs text-slate-500">匹配分</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-3">
                {k.contentStyleTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-slate-700 text-slate-300">{styleLabel[tag]}</Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  受众重合 {k.audienceOverlap}%
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  ${(k.estimatedCostRange.min / 1000).toFixed(0)}K-{(k.estimatedCostRange.max / 1000).toFixed(0)}K/条
                </span>
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
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-700 text-xl font-bold text-slate-200">
                    {kol.displayName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-lg">{kol.handle}</div>
                    <div className="text-sm text-slate-400 font-normal">
                      {platformLabel[kol.platform]} · {kol.followers >= 1000 ? `${(kol.followers / 1000).toFixed(0)}K` : kol.followers} 粉丝
                    </div>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-slate-700 p-3 text-center">
                    <div className="text-lg font-bold text-amber-400">{kol.audienceOverlap}%</div>
                    <div className="text-xs text-slate-500">受众重合</div>
                  </div>
                  <div className="rounded-lg border border-slate-700 p-3 text-center">
                    <div className="text-lg font-bold text-emerald-400">{kol.avgEngagementRate}%</div>
                    <div className="text-xs text-slate-500">互动率</div>
                  </div>
                  <div className="rounded-lg border border-slate-700 p-3 text-center">
                    <div className="text-lg font-bold text-slate-100">{kol.brandFitScore}</div>
                    <div className="text-xs text-slate-500">匹配分</div>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div>
                  <h4 className="text-sm font-medium text-slate-200 mb-2">内容风格</h4>
                  <div className="flex flex-wrap gap-1">
                    {kol.contentStyleTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-slate-700 text-slate-300">{styleLabel[tag]}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-200 mb-2">受众画像</h4>
                  <p className="text-sm text-slate-400">
                    {kol.audienceProfile.age} · {kol.audienceProfile.gender} · {kol.audienceProfile.region}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">兴趣: {kol.audienceProfile.interests.join(" · ")}</p>
                </div>

                {kol.recentViralPosts && kol.recentViralPosts.length > 0 && (
                  <>
                    <Separator className="bg-slate-700" />
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="h-4 w-4 text-amber-500" />
                        <h4 className="text-sm font-medium text-slate-200">近期内容互动量</h4>
                      </div>
                      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-2">
                        <ResponsiveContainer width="100%" height={140}>
                          <BarChart data={kol.recentViralPosts} layout="vertical" margin={{ top: 0, right: 12, left: -20, bottom: 0 }}>
                            <XAxis type="number" tick={false} axisLine={false} />
                            <YAxis
                              type="category"
                              dataKey="postTitle"
                              tick={{ fontSize: 11, fill: "#94A3B8" }}
                              width={100}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "#1E293B",
                                border: "1px solid #334155",
                                borderRadius: "8px",
                                fontSize: "12px",
                                color: "#F8FAFC",
                              }}
                              formatter={(value) => [`${(Number(value) / 1000).toFixed(0)}K`, "互动"]}
                            />
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
                    <div>
                      <h4 className="text-sm font-medium text-slate-200 mb-2">品牌合作历史</h4>
                      {kol.brandCollabHistory.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                          <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">{h.brand}</Badge>
                          <span>{h.type} · {h.date}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <Separator className="bg-slate-700" />

                <div>
                  <h4 className="text-sm font-medium text-slate-200 mb-2">预估合作费用</h4>
                  <p className="text-lg font-bold text-slate-100">
                    ${kol.estimatedCostRange.min.toLocaleString()} - ${kol.estimatedCostRange.max.toLocaleString()}/条
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 gap-1 bg-amber-500 text-black hover:bg-amber-400">
                    <Star className="h-4 w-4" /> 收藏到品牌KOL库
                  </Button>
                  <Button variant="outline" className="gap-1 border-slate-700 text-slate-300">
                    导出报告
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
