"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trendTopics } from "@/lib/trend-data";
import { subCategoryLabel, type TrendCategory, type TrendSubCategory } from "@/types";
import { trendsGlossary } from "@/lib/glossary";
import { InfoTip, InfoLabel } from "@/components/ui/info-tip";
import {
  TrendingUp, TrendingDown, ChevronDown, ChevronUp,
  BarChart3, FlaskConical, Globe, Target,
} from "lucide-react";

const tg = (term: string) => trendsGlossary.find((e) => e.term === term);

const categoryMeta: Record<TrendCategory, { label: string; icon: typeof Target; color: string }> = {
  ingredient: { label: "原料/口味", icon: FlaskConical, color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
  category: { label: "品类赛道", icon: BarChart3, color: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
  regional: { label: "区域市场", icon: Globe, color: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  strategy: { label: "竞品策略", icon: Target, color: "border-purple-500/30 bg-purple-500/10 text-purple-400" },
};

// Sub-category keys per main dimension
const subCategoriesByCategory: Record<TrendCategory, TrendSubCategory[]> = {
  ingredient: ["coffee_tea", "fruit", "dairy"],
  category: ["tea_drink", "coffee", "functional", "prepared_food"],
  regional: ["north_america", "sea", "europe", "middle_east"],
  strategy: ["content", "expansion", "pricing"],
};

const densityLabel: Record<string, string> = { low: "低", medium: "中", high: "高" };
const densityColor: Record<string, string> = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-red-400",
};

const allCategories: Array<TrendCategory | "all"> = ["all", "ingredient", "category", "regional", "strategy"];
const allPlatforms: string[] = ["全部", "tiktok", "instagram", "facebook"];
const platformLabel: Record<string, string> = { tiktok: "TikTok", instagram: "Instagram", facebook: "Facebook" };

export default function TrendsPage() {
  const [categoryFilter, setCategoryFilter] = useState<TrendCategory | "all">("all");
  const [subCategoryFilter, setSubCategoryFilter] = useState<TrendSubCategory | "all">("all");
  const [platformFilter, setPlatformFilter] = useState<string>("全部");
  const [sortBy, setSortBy] = useState<"growth" | "volume">("growth");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCategoryChange = useCallback((cat: TrendCategory | "all") => {
    setCategoryFilter(cat);
    setSubCategoryFilter("all");
  }, []);

  const filtered = trendTopics
    .filter((t) => categoryFilter === "all" || t.category === categoryFilter)
    .filter((t) => subCategoryFilter === "all" || t.subCategory === subCategoryFilter)
    .filter((t) => {
      if (platformFilter === "全部") return true;
      const pct = t.platforms[platformFilter as "tiktok" | "instagram" | "facebook"];
      return pct >= 15;
    })
    .sort((a, b) => sortBy === "growth" ? b.growthRate - a.growthRate : b.discussionVolume - a.discussionVolume);

  const showSubFilter = categoryFilter !== "all";
  const subOptions = showSubFilter ? subCategoriesByCategory[categoryFilter] : [];

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-50">行业趋势</h1>
        <p className="mt-0.5 text-sm text-slate-400">
          热点话题聚合 · 按维度分类的行业信号雷达
        </p>
      </div>

      {/* Control bar */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 space-y-2">
        {/* Row 1: main category filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <InfoLabel tip={tg("trendCategory")?.explanation || ""}>
            <span className="text-[10px] text-slate-500 shrink-0 mr-1">维度:</span>
          </InfoLabel>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md transition-colors",
                categoryFilter === cat
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {cat === "all" ? "全部" : categoryMeta[cat].label}
            </button>
          ))}
          <span className="text-slate-700 mx-1">|</span>
          <span className="text-[10px] text-slate-500 shrink-0 mr-1">平台侧重:</span>
          {allPlatforms.map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md transition-colors",
                platformFilter === p
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {p === "全部" ? "全部" : platformLabel[p] || p}
            </button>
          ))}
          <span className="text-slate-700 mx-2">|</span>
          <span className="text-[10px] text-slate-500 shrink-0 mr-1">排序:</span>
          {(["growth", "volume"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md transition-colors",
                sortBy === s
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {s === "growth" ? "增长最快" : "讨论量最高"}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-500">{filtered.length} 个趋势</span>
        </div>

        {/* Row 2: sub-category filter (only when a main category is selected) */}
        {showSubFilter && (
          <div className="flex items-center gap-2 flex-wrap border-t border-slate-700/50 pt-2">
            <InfoLabel tip={tg("trendSubCategory")?.explanation || ""}>
              <span className="text-[10px] text-slate-500 shrink-0 mr-1">子类:</span>
            </InfoLabel>
            <button
              onClick={() => setSubCategoryFilter("all")}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md transition-colors",
                subCategoryFilter === "all"
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              全部
            </button>
            {subOptions.map((sub) => (
              <button
                key={sub}
                onClick={() => setSubCategoryFilter(sub)}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-md transition-colors",
                  subCategoryFilter === sub
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                {subCategoryLabel[sub]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Trend cards */}
      <div className="space-y-3">
        {filtered.map((topic) => {
          const meta = categoryMeta[topic.category];
          const isExpanded = expandedId === topic.id;
          return (
            <Card key={topic.id} className="border-slate-700 bg-slate-800/50 overflow-hidden">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg shrink-0", meta.color.replace("text-", "bg-").replace("/10", "/10"))}>
                    <meta.icon className={cn("h-4 w-4", meta.color.match(/text-\S+/)?.[0])} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-slate-100 text-sm">{topic.title}</h3>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border shrink-0", meta.color)}>
                        {meta.label}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-600 text-slate-500 shrink-0">
                        {subCategoryLabel[topic.subCategory]}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{topic.description}</p>
                  </div>
                </div>

                {/* Metrics row */}
                <div className="flex items-center gap-5 mt-3 text-xs flex-wrap">
                  <span className="text-slate-500">
                    <InfoLabel tip={tg("discussionVolume")?.explanation || ""} calc={tg("discussionVolume")?.calc}>
                      讨论量
                    </InfoLabel>{" "}
                    <span className="text-slate-200 font-medium">{(topic.discussionVolume / 10000).toFixed(0)}万</span>
                  </span>
                  <span className={cn("flex items-center gap-1", topic.growthRate >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {topic.growthRate >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {topic.growthRate > 0 ? "+" : ""}{topic.growthRate}%
                    <InfoTip content={tg("growthRate")?.explanation || ""} calc={tg("growthRate")?.calc} />
                  </span>
                  <span className="text-slate-500">
                    <InfoLabel tip={tg("platformDistribution")?.explanation || ""} calc={tg("platformDistribution")?.calc}>
                      平台
                    </InfoLabel>
                    :{" "}
                    {Object.entries(topic.platforms)
                      .sort(([, a], [, b]) => b - a)
                      .map(([k, v]) => `${platformLabel[k] || k} ${v}%`)
                      .join(" · ")}
                  </span>
                  {topic.associatedBrands.length > 0 && (
                    <span className="text-slate-500">
                      关联品牌:{" "}
                      {topic.associatedBrands.map((b, i) => (
                        <span key={b}>
                          <span className="text-slate-300">{b}</span>
                          {i < topic.associatedBrands.length - 1 && <span className="text-slate-600"> · </span>}
                        </span>
                      ))}
                    </span>
                  )}
                  <span className={cn("text-xs", densityColor[topic.competitorDensity])}>
                    <InfoLabel tip={tg("competitorDensity")?.explanation || ""} calc={tg("competitorDensity")?.calc}>
                      竞品密度
                    </InfoLabel>
                    : {densityLabel[topic.competitorDensity]}
                  </span>
                </div>

                {/* Observation */}
                <div className="mt-3 text-xs text-slate-400 leading-relaxed border-l-2 border-slate-600 pl-2.5">
                  {topic.actionSuggestion}
                </div>

                {/* Expand toggle */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : topic.id)}
                  className="flex items-center gap-1 mt-2 text-xs text-slate-500 hover:text-amber-400 transition-colors"
                >
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  证据链 ({topic.evidence.length}条)
                </button>

                {/* Evidence panel */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2">
                    {topic.evidence.map((ev, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-amber-400 shrink-0 mt-0.5">·</span>
                        <div>
                          <span className="text-slate-300 font-medium">{ev.brand || "未知来源"}</span>
                          <span className="text-slate-600 mx-1">·</span>
                          <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-500">
                            {platformLabel[ev.platform] || ev.platform}
                          </Badge>
                          <span className="text-slate-600 mx-1">·</span>
                          <span className="text-slate-500">{ev.date}</span>
                          <p className="text-slate-400 mt-0.5">{ev.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>该筛选条件下无趋势数据</p>
            <p className="text-sm mt-1">调整维度或子类筛选获取更多结果</p>
          </div>
        )}
      </div>
    </div>
  );
}
