"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useBrandPreset } from "@/lib/brand-context";
import {
  Flame,
  Users,
  Target,
  FileText,
  Settings,
  Calendar,
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
  const { brandPreset, toggleBrandPreset } = useBrandPreset();
  const [pulseKey, setPulseKey] = useState(0);

  const handleToggle = () => {
    toggleBrandPreset();
    setPulseKey((k) => k + 1);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-700 bg-slate-800 flex flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-slate-700 px-4 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
          <Flame className="h-4 w-4 text-amber-500" />
        </div>
        <span className="font-semibold text-slate-50 text-lg">
          BubblePulse
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {/* Brand preset global toggle */}
        <button
          key={pulseKey}
          onClick={handleToggle}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all mb-2 border",
            "animate-brand-pulse",
            brandPreset
              ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
              : "border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400"
          )}
        >
          <span className={cn(
            "flex h-4 w-4 items-center justify-center rounded text-xs transition-colors duration-300",
            brandPreset ? "bg-amber-500/20 text-amber-400" : "bg-slate-700 text-slate-500"
          )}>
            {brandPreset ? "◆" : "◇"}
          </span>
          {brandPreset ? "品牌预设 · ON" : "自由筛选"}
        </button>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-700 text-slate-50"
                  : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
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
            pathname === "/brand/settings"
              ? "bg-slate-700 text-slate-50"
              : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          品牌设置
        </Link>

        <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-500">
            C
          </span>
          <span className="font-medium text-slate-200">CHAGEE</span>
          <span className="ml-auto flex h-2 w-2 rounded-full bg-emerald-500" />
        </div>
      </div>
    </aside>
  );
}
