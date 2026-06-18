"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Download, Copy, CheckCircle2, Calendar, Users, Target, TrendingUp } from "lucide-react";
import { weeklyBrief } from "@/lib/mock-data";

function useTypewriter(sections: { key: string; html: React.ReactNode }[], isActive: boolean, onComplete: () => void) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const indexRef = useRef(0);

  useEffect(() => {
    if (!isActive) return;
    indexRef.current = 0;
    setRevealed(new Set());

    const interval = setInterval(() => {
      if (indexRef.current >= sections.length) {
        clearInterval(interval);
        onComplete();
        return;
      }
      setRevealed((prev) => {
        const next = new Set(prev);
        next.add(sections[indexRef.current]!.key);
        return next;
      });
      indexRef.current++;
    }, 600);

    return () => clearInterval(interval);
  }, [isActive, sections, onComplete]);

  return revealed;
}

const briefSections = [
  {
    key: "header",
    html: (
      <div className="flex items-center gap-2 mb-1 text-slate-300">
        <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
        <span className="text-sm">分析本周数据中...</span>
      </div>
    ),
  },
  {
    key: "title",
    html: (
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-slate-50">
          {weeklyBrief.brandName} 本周内容策略简报
        </CardTitle>
        <p className="text-sm text-slate-400">{weeklyBrief.weekStart}</p>
      </CardHeader>
    ),
  },
  {
    key: "trends",
    html: (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold text-slate-100">本周 TOP3 内容机会</h3>
        </div>
        <div className="space-y-3">
          {weeklyBrief.topOpportunities.map((op) => (
            <div key={op.rank} className="rounded-lg border border-slate-700 p-3 animate-in fade-in slide-in-from-left-2 duration-500">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge className="bg-amber-500 text-black text-xs">#{op.rank}</Badge>
                <span className="font-medium text-slate-100">{op.title}</span>
                <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">重合 {op.audienceOverlap}%</Badge>
              </div>
              <div className="flex gap-4 text-xs text-slate-500 mt-1">
                <span>窗口: {op.window}</span>
                <span>预估: {op.expectedBoost}</span>
              </div>
              <p className="text-sm text-slate-300 mt-2">→ {op.action}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: "separator1",
    html: <Separator className="bg-slate-700" />,
  },
  {
    key: "kol",
    html: (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-slate-100">推荐合作 KOL</h3>
        </div>
        <div className="space-y-2">
          {weeklyBrief.kolRecommendations.map((k) => (
            <div key={k.handle} className="flex items-center gap-3 rounded-lg border border-slate-700 p-3 animate-in fade-in slide-in-from-right-2 duration-500">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-200 shrink-0">
                {k.handle.charAt(1).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-100">{k.handle}</p>
                <p className="text-xs text-slate-400">{k.reason}</p>
              </div>
              <div className="text-right shrink-0">
                <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">匹配 {k.fitScore}</Badge>
                <p className="text-xs text-slate-500 mt-1">{k.costRange}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: "separator2",
    html: <Separator className="bg-slate-700" />,
  },
  {
    key: "ip",
    html: (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-emerald-400" />
          <h3 className="font-semibold text-slate-100">值得关注的 IP</h3>
        </div>
        <div className="space-y-2">
          {weeklyBrief.ipWatchlist.map((ip) => (
            <div key={ip.name} className="rounded-lg border border-slate-700 p-3 animate-in fade-in duration-500">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-100">{ip.name}</span>
                <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">{ip.urgency}</Badge>
              </div>
              <p className="text-sm text-slate-400 mt-1">{ip.reason}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: "separator3",
    html: <Separator className="bg-slate-700" />,
  },
  {
    key: "calendar",
    html: (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold text-slate-100">下周内容日历建议</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {weeklyBrief.contentCalendar.map((day) => (
            <div key={day.day} className="rounded-lg border border-slate-700 p-3 text-center animate-in fade-in zoom-in-95 duration-500">
              <Badge variant="secondary" className="mb-2 bg-slate-700 text-slate-300">{day.day}</Badge>
              <p className="text-sm text-slate-300">{day.content}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function BriefPage() {
  const [phase, setPhase] = useState<"idle" | "generating" | "complete">("idle");
  const [includeTrends, setIncludeTrends] = useState(true);
  const [includeKol, setIncludeKol] = useState(true);
  const [includeIp, setIncludeIp] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleExportPDF = () => window.print();
  const handleCopyLink = () => {
    const text = [
      `CHAGEE 本周内容策略简报 — ${weeklyBrief.weekStart}`,
      ...weeklyBrief.topOpportunities.map((o, i) => `${i + 1}. ${o.title} (重合${o.audienceOverlap}% · ${o.window}) → ${o.action}`),
      ...weeklyBrief.kolRecommendations.map((k) => `推荐KOL: ${k.handle} — ${k.reason} (${k.costRange})`),
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const sections = briefSections.filter((s) => {
    if (!includeTrends && (s.key === "trends" || s.key === "separator1")) return false;
    if (!includeKol && (s.key === "kol" || s.key === "separator2")) return false;
    if (!includeIp && (s.key === "ip" || s.key === "separator3")) return false;
    return true;
  });

  const handleComplete = useCallback(() => {
    setPhase("complete");
  }, []);

  const revealed = useTypewriter(sections, phase === "generating", handleComplete);

  const handleGenerate = () => {
    setPhase("generating");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">AI 策略简报</h1>
        <p className="mt-1 text-sm text-slate-400">
          接收已按受众重合度排序的数据，AI 按简报模板产出结构化内容计划
        </p>
      </div>

      {phase === "idle" && (
        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
              <Sparkles className="h-8 w-8 text-amber-500" />
            </div>
            <div className="text-center max-w-md">
              <h2 className="text-xl font-semibold text-slate-100">生成周度内容策略简报</h2>
              <p className="mt-2 text-sm text-slate-400">
                AI 综合分析本周热点趋势、KOL 匹配结果和 IP 联动机会，
                按简报模板产出可直接交付内容团队的行动计划
              </p>
            </div>

            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <Checkbox id="scope-trends" defaultChecked={includeTrends} onCheckedChange={(v) => setIncludeTrends(!!v)} />
                热点
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <Checkbox id="scope-kol" defaultChecked={includeKol} onCheckedChange={(v) => setIncludeKol(!!v)} />
                KOL
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <Checkbox id="scope-ip" defaultChecked={includeIp} onCheckedChange={(v) => setIncludeIp(!!v)} />
                IP
              </label>
            </div>

            <Button
              size="lg"
              className="gap-2 bg-amber-500 text-black hover:bg-amber-400 mt-2"
              onClick={handleGenerate}
            >
              <Sparkles className="h-4 w-4" />
              生成简报
            </Button>
          </CardContent>
        </Card>
      )}

      {phase !== "idle" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {phase === "generating" ? (
                <>
                  <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                  <span className="text-sm text-amber-400">AI 正在生成简报...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm text-slate-400">简报已生成 · {weeklyBrief.weekStart}</span>
                </>
              )}
            </div>
            {phase === "complete" && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1 border-slate-700 text-slate-300 text-xs h-8" onClick={handleExportPDF}>
                  <Download className="h-4 w-4" /> 导出 PDF
                </Button>
                <Button variant="outline" size="sm" className="gap-1 border-slate-700 text-slate-300 text-xs h-8" onClick={handleCopyLink}>
                  {copied ? <><CheckCircle2 className="h-4 w-4 text-emerald-400" /> 已复制</> : <><Copy className="h-4 w-4" /> 复制分享链接</>}
                </Button>
              </div>
            )}
          </div>

          <Card className="border-amber-500/20 bg-slate-800/50">
            <CardContent className="p-6 space-y-6">
              {sections.map((section) => (
                <div
                  key={section.key}
                  className={`transition-all duration-500 ${
                    revealed.has(section.key)
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  {revealed.has(section.key) ? section.html : null}
                </div>
              ))}

              {phase === "generating" && revealed.size < sections.length && (
                <div className="flex items-center gap-2 py-4">
                  <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-bounce" />
                  <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.15s]" />
                  <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.3s]" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
