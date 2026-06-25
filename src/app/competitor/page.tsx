"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { competitorBrands, competitorActivities } from "@/lib/competitor-data";
import { mockInsights, type AIInsight } from "@/lib/insight-data";
import { competitorGlossary } from "@/lib/glossary";
import { InfoTip, InfoLabel } from "@/components/ui/info-tip";
import {
  TrendingUp, TrendingDown, ExternalLink, ChevronDown, ChevronUp,
  Brain, Lightbulb,
} from "lucide-react";

const g = (term: string) => competitorGlossary.find((e) => e.term === term);

const typeLabel: Record<string, { icon: string; color: string }> = {
  "新品": { icon: "🍵", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
  "开店": { icon: "🏪", color: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
  "联名": { icon: "🤝", color: "border-purple-500/30 bg-purple-500/10 text-purple-400" },
  "促销": { icon: "🎉", color: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  "品牌": { icon: "📖", color: "border-slate-500/30 bg-slate-500/10 text-slate-400" },
  "文化": { icon: "🎋", color: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400" },
  "其他": { icon: "📌", color: "border-slate-500/30 bg-slate-500/10 text-slate-400" },
};

const brandColorMap: Record<string, string> = {
  "br1": "bg-emerald-500",
  "br2": "bg-red-500",
  "br3": "bg-blue-500",
  "br4": "bg-amber-500",
};

const platformLabel: Record<string, string> = { tiktok: "TikTok", instagram: "Instagram", facebook: "Facebook" };
const heatBadge: Record<string, string> = { "高": "bg-red-500/20 text-red-400", "中": "bg-amber-500/20 text-amber-400", "低": "bg-slate-500/20 text-slate-400" };

const allTypes: string[] = ["全部", "新品", "开店", "联名", "促销", "品牌", "文化", "其他"];
const allPlatforms: string[] = ["全部", "tiktok", "instagram", "facebook"];

export default function CompetitorPage() {
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set(competitorBrands.map((b) => b.id)));
  const [typeFilter, setTypeFilter] = useState<string>("全部");
  const [platformFilter, setPlatformFilter] = useState<string>("全部");

  const toggleBrand = (id: string) => {
    const next = new Set(selectedBrands);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedBrands(next);
  };

  const allActivities = competitorActivities
    .filter((a) => selectedBrands.has(a.brandId))
    .filter((a) => typeFilter === "全部" || a.type === typeFilter)
    .filter((a) => platformFilter === "全部" || a.platform === platformFilter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const monthGroups: { month: string; activities: typeof allActivities }[] = [];
  for (const a of allActivities) {
    const month = new Date(a.date).toLocaleDateString("zh-CN", { year: "numeric", month: "long" });
    const last = monthGroups[monthGroups.length - 1];
    if (last && last.month === month) {
      last.activities.push(a);
    } else {
      monthGroups.push({ month, activities: [a] });
    }
  }

  const activeBrands = competitorBrands.filter((b) => selectedBrands.has(b.id));

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-50">竞品情报</h1>
        <p className="mt-0.5 text-sm text-slate-400">监测竞品品牌在 TikTok/Instagram/Facebook 上的社媒动态 · 对比视图</p>
      </div>

      {/* Query Bar */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <InfoLabel tip={g("brandColor")?.explanation || ""}>
            <span className="text-xs text-slate-500 shrink-0 mr-0.5">监控品牌:</span>
          </InfoLabel>
          {competitorBrands.map((b) => (
            <button
              key={b.id}
              onClick={() => toggleBrand(b.id)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg border transition-all flex items-center gap-1.5",
                selectedBrands.has(b.id)
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                  : "border-slate-700 text-slate-500 hover:border-slate-600"
              )}
            >
              <span className={cn("h-2 w-2 rounded-full shrink-0", brandColorMap[b.id])} />
              {b.name}
            </button>
          ))}
          <button className="px-3 py-1.5 text-sm rounded-lg border border-dashed border-slate-700 text-slate-600 hover:border-amber-500/30 hover:text-amber-400">
            + 添加
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <InfoLabel tip={g("activityType")?.explanation || ""}>
            <span className="text-xs text-slate-500 shrink-0">分类:</span>
          </InfoLabel>
          {allTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn("px-2.5 py-1 text-sm rounded-md transition-colors", typeFilter === t ? "bg-amber-500/20 text-amber-400" : "text-slate-500 hover:text-slate-300")}
            >
              {t}
            </button>
          ))}
          <span className="text-slate-700 mx-1">|</span>
          <span className="text-xs text-slate-500 shrink-0">平台:</span>
          {allPlatforms.map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={cn("px-2.5 py-1 text-sm rounded-md transition-colors", platformFilter === p ? "bg-amber-500/20 text-amber-400" : "text-slate-500 hover:text-slate-300")}
            >
              {p === "全部" ? "全部" : platformLabel[p] || p}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Two-zone layout: Insights (left) + Timeline (right) ═══ */}
      <div className="flex gap-6 items-start">
        {/* Left: AI Signal Insights — sticky reference panel */}
        <aside className="w-[360px] shrink-0 space-y-4 sticky top-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-6 w-6 rounded bg-purple-500/15">
              <Brain className="h-3.5 w-3.5 text-purple-400" />
            </div>
            <InfoLabel tip={g("signal")?.explanation || ""} calc={g("confidence")?.calc}>
              <span className="text-base font-semibold text-slate-200">AI 信号洞察</span>
            </InfoLabel>
          </div>
          <InsightSidebar insights={mockInsights} />

          {/* Brand stat summary */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 space-y-3">
            <InfoLabel tip={g("postCount")?.explanation || ""} calc={g("postChange")?.calc}>
              <span className="text-sm text-slate-500 uppercase tracking-wider">品牌监测摘要</span>
            </InfoLabel>
            {activeBrands.map((b) => (
              <div key={b.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", brandColorMap[b.id])} />
                  <span className="text-sm text-slate-300">{b.name.split(" ")[0]}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-200">{b.recentPostCount}条</span>
                  <span className={cn(b.postChange >= 0 ? "text-emerald-400" : "text-red-400", "w-10 text-right")}>
                    {b.postChange > 0 ? "+" : ""}{b.postChange}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right: Unified Activity Timeline — main working area */}
        <main className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-2">
            <InfoLabel tip={g("activityType")?.explanation || ""} calc={g("heat")?.calc}>
              <span className="text-base font-semibold text-slate-200">社媒动态</span>
            </InfoLabel>
            <span className="text-sm text-slate-500">统一时间线 · {allActivities.length} 条</span>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800/40 overflow-hidden">
            {monthGroups.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">该筛选条件下无动态</div>
            ) : (
              monthGroups.map((group, gi) => (
                <div key={group.month}>
                  <div className="px-4 py-2.5 bg-slate-800/60 border-b border-slate-700/50 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-400">{group.month}</span>
                    <span className="text-xs text-slate-600">{group.activities.length} 条</span>
                  </div>
                  <div>
                    {group.activities.map((a, ai) => {
                      const t = typeLabel[a.type] || typeLabel["其他"];
                      const brand = competitorBrands.find((b) => b.id === a.brandId);
                      const isLastInGroup = ai === group.activities.length - 1;
                      const nextIsDifferentMonth = isLastInGroup && gi < monthGroups.length - 1;
                      return (
                        <div
                          key={a.id}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 group transition-colors hover:bg-slate-800/40",
                            !isLastInGroup && "border-b border-slate-800/80",
                            nextIsDifferentMonth && "border-b border-slate-700/50"
                          )}
                        >
                          <div className={cn("w-0.5 h-9 rounded-full shrink-0", brandColorMap[a.brandId])} />
                          <span className="text-sm text-slate-500 font-mono w-10 shrink-0">
                            {new Date(a.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                          </span>
                          <span className="text-sm text-slate-400 w-14 shrink-0 truncate">
                            {brand?.name.split(" ")[0]}
                          </span>
                          <span className={cn("text-xs px-1.5 py-0.5 rounded border shrink-0", t.color)}>
                            {t.icon} {a.type}
                          </span>
                          <span className="flex-1 text-[15px] text-slate-200 truncate">{a.title}</span>
                          <Badge variant="outline" className="text-xs border-slate-700 text-slate-500 shrink-0">
                            {platformLabel[a.platform] || a.platform}
                          </Badge>
                          <span className={cn("text-xs px-1.5 py-0.5 rounded shrink-0", heatBadge[a.heat])}>
                            {a.heat === "高" ? "🔥" : ""} {a.heat}
                          </span>
                          {a.url && (
                            <a href={a.url} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-amber-400 shrink-0">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function InsightSidebar({ insights }: { insights: AIInsight[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {insights.map((ins) => {
        const isExpanded = expandedId === ins.id;
        return (
          <div
            key={ins.id}
            className={cn(
              "rounded-xl border transition-colors overflow-hidden",
              isExpanded ? "border-amber-500/30 bg-amber-500/5" : "border-purple-500/15 bg-purple-500/3 hover:border-purple-500/25"
            )}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : ins.id)}
              className="w-full text-left p-4"
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="h-4.5 w-4.5 text-amber-400 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-100 leading-snug">{ins.title}</p>
                  <p className="text-sm text-slate-400 mt-1.5">{ins.signals}</p>
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    {ins.valueTags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" /> : <ChevronDown className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />}
              </div>
            </button>
            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-slate-700/50 pt-3 mx-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">📡 信号证据链</h4>
                  <div className="space-y-2">
                    {ins.evidence.map((ev, i) => (
                      <div key={i} className="text-sm">
                        <span className="text-amber-400">·</span>{" "}
                        <span className="text-slate-200 font-medium">{ev.source}</span>
                        <span className="text-slate-600"> · </span>
                        <span className="text-slate-500">{ev.platform} · {ev.date}</span>
                        <p className="text-slate-400 mt-0.5">{ev.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                  <h4 className="text-sm font-medium text-amber-300 mb-1.5">📋 建议行动</h4>
                  <p className="text-sm text-slate-200 leading-relaxed">{ins.action}</p>
                  <p className="text-sm text-amber-400/70 mt-1.5">→ {ins.actionFor}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
