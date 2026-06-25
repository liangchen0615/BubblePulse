"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { calendarEvents as initialEvents, countryLabel } from "@/lib/mock-data";
import { Calendar, MapPin, Coffee, Plus, Pencil, Trash2 } from "lucide-react";
import type { Market, Country, CalendarEvent } from "@/types";

const regionLabel: Record<Market, string> = { US: "美国", UK: "英国", AU: "澳洲", SEA: "东南亚" };
const regionCountries: Record<Market, Country[]> = {
  US: ["US", "CA"], UK: ["UK", "FR", "DE"], AU: ["AU"],
  SEA: ["SG", "MY", "TH", "ID", "PH", "VN", "JP", "KR", "CN"],
};
const typeOptions = [
  { value: "expo", label: "展会" }, { value: "conference", label: "峰会" },
  { value: "trade", label: "交易会" }, { value: "festival", label: "行业节庆" },
];
const typeIcon: Record<string, string> = { expo: "🏟", conference: "🎤", trade: "🤝", festival: "🎪" };

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [region, setRegion] = useState<Market>("US");
  const [country, setCountry] = useState<string>("all");
  const [year] = useState("2026");

  // Editor state
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const filtered = events
    .filter((e) => e.region === region)
    .filter((e) => country === "all" || e.country === country)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

  const openNew = () => {
    setEditing({ id: `cal-${Date.now()}`, date: "2026-01-01", region, country: regionCountries[region][0] || "US", name: "", type: "expo", suggestion: "" });
    setEditOpen(true);
  };
  const openEdit = (ev: CalendarEvent) => { setEditing({ ...ev }); setEditOpen(true); };
  const saveEvent = () => {
    if (!editing || !editing.name.trim()) return;
    setEvents((prev) => {
      const exists = prev.findIndex((e) => e.id === editing.id);
      if (exists >= 0) { const next = [...prev]; next[exists] = editing; return next; }
      return [...prev, editing];
    });
    setEditOpen(false);
  };
  const deleteEvent = (id: string) => {
    if (!confirm("删除此行业节点？")) return;
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">行业日历</h1>
          <p className="mt-1 text-sm text-slate-400">食品饮料行业重要展会、峰会和交易会时间表。可自行添加编辑。</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1 border-amber-500/30 text-amber-400 text-xs h-8" onClick={openNew}>
          <Plus className="h-3.5 w-3.5" /> 新建节点
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Select value={region} onValueChange={(v) => { setRegion(v as Market); setCountry("all"); }}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="地区" /></SelectTrigger>
          <SelectContent>{(["US","UK","AU","SEA"] as Market[]).map((m) => (<SelectItem key={m} value={m}>{regionLabel[m]}</SelectItem>))}</SelectContent>
        </Select>
        <Select value={country} onValueChange={(v) => setCountry(v || "all")}>
          <SelectTrigger className="w-24 h-8 text-xs"><SelectValue placeholder="国家" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部国家</SelectItem>
            {regionCountries[region].map((c) => (<SelectItem key={c} value={c}>{countryLabel[c]}</SelectItem>))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">{year}</Badge>
        <span className="text-xs text-slate-500">{filtered.length} 个节点</span>
      </div>

      <div className="space-y-6">
        {monthNames.map((month, mi) => {
          const monthEvents = filtered.filter((e) => new Date(e.date).getMonth() + 1 === mi + 1);
          if (monthEvents.length === 0) return null;
          return (
            <div key={month}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-slate-300">{month}</h3>
                <div className="flex-1 h-px bg-slate-700" />
              </div>
              <div className="space-y-2">
                {monthEvents.map((event) => (
                  <Card key={event.id} className="border-slate-700 bg-slate-800/50 hover:border-amber-500/20 transition-colors group">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-lg">{typeIcon[event.type] || "📅"}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-100">{event.name}</h4>
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                              {typeOptions.find((t) => t.value === event.type)?.label || event.type}
                            </Badge>
                            <span className="text-xs text-slate-500">{new Date(event.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}</span>
                          </div>
                          <div className="flex items-start gap-2 mt-1">
                            <Coffee className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-slate-400">{event.suggestion}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300" onClick={() => openEdit(event)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 hover:text-red-400" onClick={() => deleteEvent(event.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
            <p>该地区暂无行业节点</p>
            <Button variant="outline" size="sm" className="mt-3 gap-1 border-slate-700 text-slate-400 text-xs" onClick={openNew}><Plus className="h-3.5 w-3.5" /> 新建节点</Button>
          </div>
        )}
      </div>

      {/* Edit Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto border-slate-700 bg-slate-900">
          <SheetHeader><SheetTitle className="text-slate-50">{editing && events.find((e) => e.id === editing.id) ? "编辑节点" : "新建节点"}</SheetTitle></SheetHeader>
          {editing && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-200">名称</label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="如：Super Bowl" className="mt-1.5 border-slate-700 bg-slate-800 text-slate-100 h-9" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-200">日期</label>
                  <Input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className="mt-1.5 border-slate-700 bg-slate-800 text-slate-100 h-9 text-xs" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-200">地区</label>
                  <Select value={editing.region} onValueChange={(v) => setEditing({ ...editing, region: v as Market })}>
                    <SelectTrigger className="mt-1.5 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{(["US","UK","AU","SEA"] as Market[]).map((m) => (<SelectItem key={m} value={m}>{regionLabel[m]}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-200">国家</label>
                  <Select value={editing.country} onValueChange={(v) => setEditing({ ...editing, country: v as Country })}>
                    <SelectTrigger className="mt-1.5 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{(regionCountries[editing.region] || allCountries()).map((c) => (<SelectItem key={c} value={c}>{countryLabel[c]}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-200">类型</label>
                <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v as CalendarEvent["type"] })}>
                  <SelectTrigger className="mt-1.5 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{typeOptions.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-200">行业关联</label>
                <Input value={editing.suggestion} onChange={(e) => setEditing({ ...editing, suggestion: e.target.value })} placeholder="如：限定套餐 + 主题杯身" className="mt-1.5 border-slate-700 bg-slate-800 text-slate-100 h-9" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1 bg-amber-500 text-black hover:bg-amber-400" onClick={saveEvent}>保存</Button>
                <Button variant="outline" className="border-slate-700 text-slate-300" onClick={() => setEditOpen(false)}>取消</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function allCountries(): Country[] { return (Object.keys(countryLabel) as Country[]); }
