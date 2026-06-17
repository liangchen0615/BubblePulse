"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useBrandPreset } from "@/lib/brand-context";
import {
  Flame, Users, Target, FileText, Settings, Calendar, Layers,
} from "lucide-react";

const navItems = [
  { href: "/trends", label: "实时热点", icon: Flame },
  { href: "/kol", label: "KOL 发现", icon: Users },
  { href: "/ip-tracker", label: "IP 联动追踪", icon: Target },
  { href: "/brief", label: "AI 策略简报", icon: FileText },
  { href: "/calendar", label: "营销日历", icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();
  const { strategies, activeStrategyId, setActiveStrategy } = useBrandPreset();
  const [pulseKey, setPulseKey] = useState(0);

  const handleStrategyClick = (id: string | null) => {
    setActiveStrategy(id);
    setPulseKey((k) => k + 1);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-700 bg-slate-800 flex flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-slate-700 px-4 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
          <Flame className="h-4 w-4 text-amber-500" />
        </div>
        <span className="font-semibold text-slate-50 text-lg">BubblePulse</span>
      </div>

      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {/* Strategy switcher */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 px-1 mb-1.5">
            <Layers className="h-3 w-3 text-slate-500" />
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">策略预设</span>
          </div>
          <div className="space-y-0.5">
            {strategies.map((s, i) => {
              const isActive = activeStrategyId === s.id;
              return (
                <button
                  key={s.id + pulseKey}
                  onClick={() => handleStrategyClick(isActive ? null : s.id)}
                  className={cn(
                    "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-left transition-all border",
                    isActive
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-300 animate-brand-pulse"
                      : "border-transparent text-slate-400 hover:bg-slate-700/50 hover:text-slate-300"
                  )}
                >
                  <span className={cn("shrink-0 text-[10px]", isActive ? "text-amber-400" : "text-slate-600")}>
                    {isActive ? "◆" : "◇"}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{s.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {s.markets.map((m) => ({ US: "北美", UK: "欧洲", AU: "澳洲", SEA: "东南亚" }[m] || m)).join("·")} · {s.ageMin}-{s.ageMax}岁 · {s.gender === "female" ? "女" : s.gender === "male" ? "男" : "不限"}
                    </div>
                  </div>
                </button>
              );
            })}
            {/* Free mode toggle */}
            <button
              onClick={() => handleStrategyClick(null)}
              className={cn(
                "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-left transition-all border",
                !activeStrategyId
                  ? "border-slate-600 bg-slate-700/30 text-slate-300"
                  : "border-transparent text-slate-500 hover:bg-slate-700/50 hover:text-slate-400"
              )}
            >
              <span className="shrink-0 text-[10px] text-slate-500">◇</span>
              <span className="font-medium">自由筛选</span>
            </button>
          </div>
        </div>

        {/* Page nav */}
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-slate-700 text-slate-50" : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 p-3 space-y-2 shrink-0">
        <Link
          href="/brand/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/brand/settings" ? "bg-slate-700 text-slate-50" : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          品牌设置
        </Link>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-500">C</span>
          <span className="font-medium text-slate-200">CHAGEE</span>
          <span className="ml-auto flex h-2 w-2 rounded-full bg-emerald-500" />
        </div>
      </div>
    </aside>
  );
}
