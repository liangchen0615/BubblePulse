"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterPanel, FilterChips, type FilterGroup } from "@/components/layout/filter-panel";
import { useBrandPreset } from "@/lib/brand-context";
import { ips as mockIps } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Minus, Zap, AlertCircle, Search } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { Feasibility, IpCategory, IP } from "@/types";

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
  const { brandPreset, activeStrategy } = useBrandPreset();
  const [selCategories, setSelCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"overlap" | "heat">("overlap");
  const [search, setSearch] = useState("");
  const [dataSource] = useState<"mock" | "merged" | "wikipedia">("wikipedia");
  const [apiData, setApiData] = useState<IP[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [selectedIp, setSelectedIp] = useState<IP | null>(null);
  const [committed, setCommitted] = useState<string[]>([]);

  const fetchIps = () => {
    if (dataSource === "mock") { setApiData([]); return; }
    setApiLoading(true);
    fetch(`/api/ips/all?source=${dataSource}&max=8`)
      .then((r) => r.json()).then((d) => { setApiData(d.items); setApiLoading(false); })
      .catch(() => setApiLoading(false));
  };
  useEffect(() => { fetchIps(); }, [dataSource]);

  const allIps = dataSource === "mock" ? mockIps : (apiData.length > 0 ? apiData : mockIps);

  const filtered = allIps
    .filter((ip) => (brandPreset ? ip.audienceOverlap >= 55 : true))
    .filter((ip) => committed.length === 0 || committed.includes(ip.category))
    .filter((ip) => !search || ip.name.toLowerCase().includes(search.toLowerCase()) || ip.category.toLowerCase().includes(search.toLowerCase()))
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
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input placeholder="搜索 IP..." className="pl-9 h-8 text-sm border-slate-700 bg-slate-800/50" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <span className="flex items-center gap-0.5 rounded-lg border border-slate-700 bg-slate-800/80 p-0.5">
            {(["overlap", "heat"] as const).map((s) => (
              <button key={s} onClick={() => setSortBy(s)} className={cn("px-2 py-0.5 text-xs rounded-md transition-colors", sortBy === s ? "bg-amber-500/20 text-amber-400" : "text-slate-500 hover:text-slate-300")}>
                {s === "overlap" ? "按重合度" : "按热度"}
              </button>
            ))}
          </span>
          {brandPreset && activeStrategy && <span className="text-xs text-amber-400 font-medium">◆ {activeStrategy.name} · 重合≥55%</span>}
          <span className="text-xs text-slate-500 ml-auto">{filtered.length} 个 IP</span>
        </div>

        <FilterChips groups={chipGroups} onRemove={removeChip} onClearAll={resetFilters} />

        <div className="space-y-3">
          {filtered.map((ip) => {
            const isOpportunity = ip.feasibility === "high" && !ip.competitorOccupied;
            const isCrowded = ip.feasibility !== "low" && ip.competitorOccupied;
            return (
              <Card key={ip.id} className={cn("border-slate-700 bg-slate-800/50 hover:border-amber-500/20 transition-colors cursor-pointer", isOpportunity && "border-l-2 border-l-emerald-500", isCrowded && "border-l-2 border-l-amber-500")} onClick={() => setSelectedIp(ip)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {ip.imageUrl ? (
                      <img src={ip.imageUrl} alt={ip.name} className="h-14 w-14 shrink-0 rounded-lg object-cover border border-slate-700" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-lg font-bold text-amber-400 border border-amber-500/20">
                        {ip.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-slate-100 text-lg">{ip.name}</h3>
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">{categoryLabel[ip.category]}</Badge>
                        <FeasibilityBadge feasibility={ip.feasibility} />
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
                            p.url ? (
                              <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                <Badge className="text-xs bg-slate-700 text-slate-300 hover:bg-slate-600 cursor-pointer">{p.brand} · {p.year} · {p.description}{p.socialImpression !== "N/A" && ` (${p.socialImpression})`}</Badge>
                              </a>
                            ) : (
                              <Badge key={i} variant="secondary" className="text-xs bg-slate-700 text-slate-300">{p.brand} · {p.year} · {p.description}{p.socialImpression !== "N/A" && ` (${p.socialImpression})`}</Badge>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* IP Detail Sheet */}
        <Sheet open={!!selectedIp} onOpenChange={(open) => !open && setSelectedIp(null)}>
          <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto border-slate-700 bg-slate-900">
            {selectedIp && (() => {
              const ipEvents = selectedIp.collabPrecedents.length > 0
                ? selectedIp.collabPrecedents.map((p, j) => ({ day: 6 + j * 10, label: `${p.brand} ${p.description}`, boost: 15 + j * 3 }))
                : [{ day: 8, label: "社交媒体热度上升", boost: 10 }, { day: 20, label: "粉丝二创传播", boost: 8 }];
              const trendData = Array.from({ length: 30 }, (_, i) => {
                const base = selectedIp.heatScore;
                const noise = Math.sin(i / 5) * 5 + (Math.random() * 4 - 2);
                const eventBoost = ipEvents.reduce((sum, ev) => sum + (i >= ev.day - 1 && i <= ev.day + 1 ? ev.boost * Math.max(0, 1 - Math.abs(i - ev.day) / 2) : 0), 0);
                const score = Math.max(0, Math.min(100, Math.round(base + noise + eventBoost)));
                const date = new Date(Date.now() - (29 - i) * 86400000);
                const nearEvent = ipEvents.find((ev) => Math.abs(i - ev.day) <= 1);
                return { day: `${date.getMonth() + 1}/${date.getDate()}`, score, label: nearEvent?.label || "" };
              });
              const avgScore = Math.round(trendData.reduce((s, d) => s + d.score, 0) / trendData.length);
              const pulseCount = trendData.filter((d) => d.score > avgScore + 10).length;
              const pulseFreq = pulseCount >= 8 ? "高频" : pulseCount >= 4 ? "中频" : "低频";

              return (
                <>
                  <SheetHeader>
                    <SheetTitle className="text-slate-50 text-lg">{selectedIp.name}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg border border-slate-700 p-3 text-center"><div className="text-lg font-bold text-amber-400">{selectedIp.heatScore}</div><div className="text-xs text-slate-500">当前热度</div></div>
                      <div className="rounded-lg border border-slate-700 p-3 text-center"><div className="text-lg font-bold text-slate-100">{avgScore}</div><div className="text-xs text-slate-500">30天均值</div></div>
                      <div className="rounded-lg border border-slate-700 p-3 text-center"><div className={cn("text-lg font-bold", pulseFreq === "高频" ? "text-emerald-400" : pulseFreq === "中频" ? "text-amber-400" : "text-slate-400")}>{pulseFreq}</div><div className="text-xs text-slate-500">脉冲频率</div></div>
                    </div>

                    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
                      <h4 className="text-sm font-medium text-slate-200 mb-3">30天热度趋势</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                          <defs><linearGradient id="ipHeatGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} /><stop offset="100%" stopColor="#F59E0B" stopOpacity={0} /></linearGradient></defs>
                          <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748B" }} interval={4} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px", color: "#F8FAFC" }} />
                          <ReferenceLine y={avgScore} stroke="#475569" strokeDasharray="4 4" label={{ value: `均值 ${avgScore}`, position: "right", fontSize: 10, fill: "#64748B" }} />
                          <Area type="monotone" dataKey="score" stroke="#F59E0B" fill="url(#ipHeatGrad)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
                      <h4 className="text-sm font-medium text-slate-200 mb-2">热度波动事件</h4>
                      <div className="space-y-1.5">
                        {ipEvents.map((ev, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="text-amber-400 font-mono w-12">{trendData[ev.day]?.day || `D+${ev.day}`}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span className="text-slate-300">{ev.label}</span>
                            <span className="text-emerald-400 ml-auto">+{ev.boost}热度</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                      <h4 className="text-sm font-medium text-amber-300 mb-1">联动建议</h4>
                      <p className="text-xs text-slate-400">
                        {pulseFreq === "高频" ? "该IP持续高热，适合随时启动联动。关注大版本/事件窗口以获得最大曝光。" :
                         pulseFreq === "中频" ? "该IP有周期性热度，建议在脉冲事件前后2周内启动联动。" :
                         "该IP热度偏低，建议观望等待下一个脉冲窗口。"}
                      </p>
                    </div>
                  </div>
                </>
              );
            })()}
          </SheetContent>
        </Sheet>
      </div>
    </FilterPanel>
  );
}
