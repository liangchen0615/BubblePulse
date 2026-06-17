"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Coffee } from "lucide-react";
import { calendarEvents, countryLabel } from "@/lib/mock-data";
import type { Market, Country } from "@/types";

const regionLabel: Record<Market, string> = { US: "美国", UK: "英国", AU: "澳洲", SEA: "东南亚" };
const regionCountries: Record<Market, Country[]> = {
  US: ["US", "CA"],
  UK: ["UK", "FR", "DE"],
  AU: ["AU"],
  SEA: ["SG", "MY", "TH", "ID", "PH", "VN", "JP", "KR", "CN"],
};
const typeIcon: Record<string, string> = {
  sports: "🏈", festival: "🎵", holiday: "🎆", cultural: "🎋",
};

export default function CalendarPage() {
  const [region, setRegion] = useState<Market>("US");
  const [country, setCountry] = useState<string>("all");
  const [year] = useState("2026");

  const filtered = calendarEvents
    .filter((e) => e.region === region)
    .filter((e) => country === "all" || e.country === country)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">营销日历</h1>
        <p className="mt-1 text-sm text-slate-400">
          按地区展示可预测的重要文化节点。这些是确定的，提前规划即可。
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={region} onValueChange={(v) => { setRegion(v as Market); setCountry("all"); }}>
          <SelectTrigger className="w-28 h-8 text-xs">
            <SelectValue placeholder="地区" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="US">美国</SelectItem>
            <SelectItem value="UK">英国</SelectItem>
            <SelectItem value="AU">澳洲</SelectItem>
            <SelectItem value="SEA">东南亚</SelectItem>
          </SelectContent>
        </Select>
        <Select value={country} onValueChange={(v) => setCountry(v || "all")}>
          <SelectTrigger className="w-24 h-8 text-xs">
            <SelectValue placeholder="国家" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部国家</SelectItem>
            {regionCountries[region].map((c) => (
              <SelectItem key={c} value={c}>{countryLabel[c]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">{year}</Badge>
        <span className="text-xs text-slate-500">{filtered.length} 个节点</span>
      </div>

      <div className="space-y-6">
        {monthNames.map((month, mi) => {
          const monthEvents = filtered.filter((e) => {
            const m = new Date(e.date).getMonth() + 1;
            return m === mi + 1;
          });
          if (monthEvents.length === 0) return null;

          return (
            <div key={month}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-slate-300">{month}</h3>
                <div className="flex-1 h-px bg-slate-700" />
              </div>
              <div className="space-y-2">
                {monthEvents.map((event) => (
                  <Card key={event.id} className="border-slate-700 bg-slate-800/50 hover:border-amber-500/20 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-lg">
                          {typeIcon[event.type] || "📅"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-100">{event.name}</h4>
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                              {event.type === "sports" ? "赛事" : event.type === "festival" ? "音乐节" : event.type === "holiday" ? "节日" : "文化"}
                            </Badge>
                            <span className="text-xs text-slate-500 ml-auto">
                              {new Date(event.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                          <div className="flex items-start gap-2 mt-1">
                            <Coffee className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-slate-400">{event.suggestion}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-slate-600" />
            <p>该地区暂无营销节点数据</p>
          </div>
        )}
      </div>
    </div>
  );
}
