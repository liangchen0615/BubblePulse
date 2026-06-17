"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterPanel, FilterChips, type FilterGroup } from "@/components/layout/filter-panel";
import { useBrandPreset } from "@/lib/brand-context";
import { ips } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Target, TrendingUp, TrendingDown, Minus, Zap, AlertCircle } from "lucide-react";
import type { Feasibility, IpCategory } from "@/types";

const categoryLabel: Record<IpCategory, string> = { anime: "Anime", game: "Game", movie: "Movie", character: "Character", meme: "Meme" };
const allCategories: IpCategory[] = ["anime", "game", "movie", "character", "meme"];

function FeasibilityBadge({ feasibility }: { feasibility: Feasibility }) {
  const c = { high: "border-emerald-500/50 text-emerald-400 bg-emerald-500/10", medium: "border-amber-500/50 text-amber-400 bg-amber-500/10", low: "border-red-500/50 text-red-400 bg-red-500/10" };
  const l = feasibility === "high" ? "高可行性" : feasibility === "medium" ? "中可行性" : "低可行性";
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", c[feasibility])}>{l}</span>;
}
function TrendIcon({ direction }: { direction: "up" | "stable" | "down" }) {
  if (direction === "up") return <TrendingUp className="h-4 w-4 text-emerald-400" />;
  if (direction === "down") return <TrendingDown className="h-4 w-4 text-red-400" />;
  return <Minus className="h-4 w-4 text-slate-500" />;
}
function OverlapBadge({ score }: { score: number }) {
  const c = score >= 70 ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : score >= 55 ? "border-amber-500/50 text-amber-400 bg-amber-500/10" : "border-blue-400/50 text-blue-400 bg-blue-400/10";
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium shrink-0", c)}>{score}% 重合</span>;
}

export default function IpTrackerPage() {
  const { brandPreset } = useBrandPreset();
  const [selCategories, setSelCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"overlap" | "heat">("overlap");
  const [committed, setCommitted] = useState<string[]>([]);

  const filtered = ips
    .filter((ip) => (brandPreset ? ip.audienceOverlap >= 55 : true))
    .filter((ip) => committed.length === 0 || committed.includes(ip.category))
    .sort((a, b) => sortBy === "overlap" ? b.audienceOverlap - a.audienceOverlap : b.heatScore - a.heatScore);

  const applyFilters = () => setCommitted(selCategories);
  const resetFilters = () => { setSelCategories([]); setCommitted([]); };
  const removeChip = (_gk: string, v: string) => { setSelCategories((s) => s.filter((x) => x !== v)); };

  const filterGroups: FilterGroup[] = [{
    key: "category", label: "IP 类型", selected: selCategories, onChange: setSelCategories, glow: false,
    options: allCategories.map((c) => ({ value: c, label: categoryLabel[c] })),
  }];

  const chipGroups = [{ key: "category", label: "类型", activeValues: committed.map((v) => ({ value: v, label: categoryLabel[v as IpCategory] })) }];

  return (
    <FilterPanel groups={filterGroups} overlapValue={0} onOverlapChange={() => {}} onApply={applyFilters} onReset={resetFilters} activeCount={committed.length}>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">IP 联动追踪</h1>
          <p className="mt-1 text-sm text-slate-400">IP 决策周期 3-12 个月，不同于短视频热点。按受众重合度筛选。</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-0.5 rounded-lg border border-slate-700 bg-slate-800/80 p-0.5">
            {(["overlap", "heat"] as const).map((s) => (
              <button key={s} onClick={() => setSortBy(s)} className={cn("px-2 py-0.5 text-xs rounded-md transition-colors", sortBy === s ? "bg-amber-500/20 text-amber-400" : "text-slate-500 hover:text-slate-300")}>
                {s === "overlap" ? "按重合度" : "按热度"}
              </button>
            ))}
          </span>
          {brandPreset && <span className="text-xs text-amber-400 font-medium">◆ 品牌预设 · 仅显示重合≥55%</span>}
          <span className="text-xs text-slate-500 ml-auto">{filtered.length} 个 IP</span>
        </div>

        <FilterChips groups={chipGroups} onRemove={removeChip} onClearAll={resetFilters} />

        <div className="space-y-3">
          {filtered.map((ip) => {
            const isOpportunity = ip.feasibility === "high" && !ip.competitorOccupied;
            const isCrowded = ip.feasibility !== "low" && ip.competitorOccupied;
            return (
              <Card key={ip.id} className={cn("border-slate-700 bg-slate-800/50 hover:border-amber-500/20 transition-colors", isOpportunity && "border-l-2 border-l-emerald-500", isCrowded && "border-l-2 border-l-amber-500")}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-700"><Target className="h-7 w-7 text-amber-500/50" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-slate-100 text-lg">{ip.name}</h3>
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">{categoryLabel[ip.category]}</Badge>
                        <FeasibilityBadge feasibility={ip.feasibility} />
                        <OverlapBadge score={ip.audienceOverlap} />
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-slate-400">热度 <span className="font-bold text-slate-100">{ip.heatScore}</span><TrendIcon direction={ip.trendDirection} /></span>
                        <span className="text-slate-500">受众: {ip.audienceProfile}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {ip.competitorOccupied
                          ? <span className="inline-flex items-center gap-1 text-xs text-amber-400"><AlertCircle className="h-3 w-3" />竞品已占用</span>
                          : <span className="inline-flex items-center gap-1 text-xs text-emerald-400"><Zap className="h-3 w-3" />首发机会</span>}
                      </div>
                      {ip.collabPrecedents.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {ip.collabPrecedents.map((p, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-slate-700 text-slate-300">{p.brand} · {p.year} · {p.description}{p.socialImpression !== "N/A" && ` (${p.socialImpression})`}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="gap-1 border-slate-700 text-slate-300 text-xs h-8">追踪此 IP</Button>
                        <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 text-xs h-8">查看详情</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </FilterPanel>
  );
}
