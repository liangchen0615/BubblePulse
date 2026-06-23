"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { competitorBrands, competitorActivities } from "@/lib/competitor-data";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import type { ActivityType, Platform } from "@/types";

const typeLabel: Record<string, { icon: string; color: string }> = {
  "新品": { icon: "🍵", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
  "开店": { icon: "🏪", color: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
  "联名": { icon: "🤝", color: "border-purple-500/30 bg-purple-500/10 text-purple-400" },
  "促销": { icon: "🎉", color: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  "品牌": { icon: "📖", color: "border-slate-500/30 bg-slate-500/10 text-slate-400" },
  "文化": { icon: "🎋", color: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400" },
  "其他": { icon: "📌", color: "border-slate-500/30 bg-slate-500/10 text-slate-400" },
};

const platformLabel: Record<string, string> = { tiktok: "TikTok", instagram: "Instagram", facebook: "Facebook" };
const heatBadge: Record<string, string> = { "高": "bg-red-500/20 text-red-400", "中": "bg-amber-500/20 text-amber-400", "低": "bg-slate-500/20 text-slate-400" };

export default function CompetitorPage() {
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set(competitorBrands.map((b) => b.id)));
  const [typeFilter, setTypeFilter] = useState<string>("全部");
  const [platformFilter, setPlatformFilter] = useState<string>("全部");

  const toggleBrand = (id: string) => {
    const next = new Set(selectedBrands);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedBrands(next);
  };

  const allTypes: string[] = ["全部", "新品", "开店", "联名", "促销", "品牌", "文化", "其他"];
  const allPlatforms: string[] = ["全部", "tiktok", "instagram", "facebook"];

  // Cross-brand insight: scan overlapping patterns
  const recentActivities = competitorActivities.filter((a) => {
    const d = new Date(a.date);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    return d >= thirtyDaysAgo && a.type === "新品";
  });
  const brandCountByKeyword: Record<string, Set<string>> = {};
  const keywordMap: Record<string, string[]> = {
    "芒果": ["芒果"], "椰子": ["椰子", "椰椰"], "西瓜": ["西瓜"],
    "草莓": ["草莓"], "芝士": ["芝士", "奶酪"], "荔枝": ["荔枝"],
    "咖啡": ["咖啡", "拿铁"], "茶": ["奶茶", "茶"],
  };
  for (const a of recentActivities) {
    for (const [label, kws] of Object.entries(keywordMap)) {
      if (kws.some((kw) => a.title.includes(kw))) {
        if (!brandCountByKeyword[label]) brandCountByKeyword[label] = new Set();
        brandCountByKeyword[label].add(a.brandName);
      }
    }
  }
  const insights = Object.entries(brandCountByKeyword)
    .filter(([, brands]) => brands.size >= 2)
    .map(([keyword, brands]) => ({ keyword, brands: [...brands].slice(0, 3) }));

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">竞品情报</h1>
        <p className="mt-1 text-sm text-slate-400">监测竞品品牌在 TikTok/Instagram/Facebook 上的社媒动态</p>
      </div>

      {/* Cross-brand insight panel */}
      {insights.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-400 text-sm font-semibold">⚠ 交叉信号</span>
            <span className="text-xs text-slate-500">近30天新品趋势 · 系统自动识别</span>
          </div>
          <div className="space-y-1.5">
            {insights.map((ins, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-amber-400 font-medium">{ins.keyword}</span>
                <span className="text-slate-500">品类同时出现在</span>
                {ins.brands.map((b, j) => (
                  <span key={b}>
                    <span className="text-slate-200 font-medium">{b}</span>
                    {j < ins.brands.length - 1 && <span className="text-slate-600"> · </span>}
                  </span>
                ))}
                <span className="text-slate-500">的新品线中</span>
                <span className="text-xs text-amber-400/70 ml-auto">建议关注此赛道</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brand selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 mr-1">监控品牌:</span>
        {competitorBrands.map((b) => (
          <button
            key={b.id}
            onClick={() => toggleBrand(b.id)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-lg border transition-all",
              selectedBrands.has(b.id)
                ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                : "border-slate-700 text-slate-500 hover:border-slate-600"
            )}
          >
            {b.name}
          </button>
        ))}
        <button className="px-3 py-1.5 text-xs rounded-lg border border-dashed border-slate-700 text-slate-600 hover:border-amber-500/30 hover:text-amber-400">
          + 添加监控
        </button>
      </div>

      {/* Brand cards */}
      {competitorBrands.filter((b) => selectedBrands.has(b.id)).map((brand) => {
        const activities = competitorActivities
          .filter((a) => a.brandId === brand.id)
          .filter((a) => typeFilter === "全部" || a.type === typeFilter)
          .filter((a) => platformFilter === "全部" || a.platform === platformFilter)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return (
          <Card key={brand.id} className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-4">
              {/* Brand header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-100 text-lg">{brand.name}</h2>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>近30天发帖 <span className="text-slate-200 font-medium">{brand.recentPostCount}条</span></span>
                  <span className={cn("flex items-center gap-1", brand.postChange >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {brand.postChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {brand.postChange > 0 ? "+" : ""}{brand.postChange}%
                  </span>
                  <span>互动率 <span className="text-slate-200 font-medium">{brand.engagementRate}%</span></span>
                  <span className="text-xs text-slate-600">
                    {brand.platforms.map((p) => platformLabel[p] || p).join(" · ")}
                  </span>
                </div>
              </div>

              {/* Activity timeline */}
              <div className="space-y-1.5">
                {activities.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">该筛选条件下无动态</p>
                ) : (
                  activities.map((a) => {
                    const t = typeLabel[a.type] || typeLabel["其他"];
                    return (
                      <div key={a.id} className="flex items-center gap-2 py-1.5 border-b border-slate-800 last:border-0 group">
                        <span className="text-xs text-slate-500 font-mono w-12 shrink-0">
                          {new Date(a.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                        </span>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border shrink-0", t.color)}>
                          {t.icon} {a.type}
                        </span>
                        <span className="flex-1 text-sm text-slate-300 truncate">{a.title}</span>
                        <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-500 shrink-0">
                          {platformLabel[a.platform] || a.platform}
                        </Badge>
                        <span className={cn("text-[10px] px-1 py-0.5 rounded shrink-0", heatBadge[a.heat])}>
                          {a.heat === "高" ? "🔥" : ""} {a.heat}
                        </span>
                        {a.url && (
                          <a href={a.url} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-amber-400 shrink-0">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Filter bar (bottom fixed) */}
      <div className="fixed bottom-6 left-72 right-6 flex items-center justify-center gap-4 z-10">
        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/95 backdrop-blur px-4 py-2 shadow-lg">
          <span className="text-[10px] text-slate-500 mr-1">分类:</span>
          {allTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn("px-2 py-0.5 text-xs rounded-md transition-colors", typeFilter === t ? "bg-amber-500/20 text-amber-400" : "text-slate-500 hover:text-slate-300")}
            >
              {t}
            </button>
          ))}
          <span className="text-slate-700 mx-2">|</span>
          <span className="text-[10px] text-slate-500 mr-1">平台:</span>
          {allPlatforms.map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={cn("px-2 py-0.5 text-xs rounded-md transition-colors", platformFilter === p ? "bg-amber-500/20 text-amber-400" : "text-slate-500 hover:text-slate-300")}
            >
              {p === "全部" ? "全部" : platformLabel[p] || p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
