"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { X, ChevronRight, ChevronLeft, RotateCcw } from "lucide-react";

export interface FilterGroup {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  glow?: boolean;
}

interface FilterPanelProps {
  groups: FilterGroup[];
  overlapValue: number;
  onOverlapChange: (v: number) => void;
  onApply: () => void;
  onReset: () => void;
  activeCount: number;
  children: ReactNode;
}

export function FilterPanel({
  groups,
  overlapValue,
  onOverlapChange,
  onApply,
  onReset,
  activeCount,
  children,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false);

  const toggleGroup = (group: FilterGroup, value: string) => {
    const current = new Set(group.selected);
    if (value === "all") {
      group.onChange(["all"]);
      return;
    }
    current.delete("all");
    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }
    if (current.size === 0) current.add("all");
    group.onChange([...current]);
  };

  return (
    <div className="flex flex-1">
      {/* Main content */}
      <div className="flex-1 min-w-0">{children}</div>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed right-0 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1 rounded-l-lg border border-r-0 border-slate-700 bg-slate-800 py-3 px-1.5 text-xs text-slate-400 hover:text-slate-200 transition-all",
          open && "right-72"
        )}
      >
        {open ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        {!open && activeCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black">
            {activeCount}
          </span>
        )}
      </button>

      {/* Filter panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-20 h-screen w-72 border-l border-slate-700 bg-slate-800/95 flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 shrink-0">
          <span className="text-sm font-semibold text-slate-200">筛选条件</span>
          <div className="flex items-center gap-1">
            <button onClick={onReset} className="p-1 rounded text-slate-500 hover:text-slate-300" title="重置">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setOpen(false)} className="p-1 rounded text-slate-500 hover:text-slate-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {groups.map((group) => (
            <div key={group.key}>
              <label
                className={cn(
                  "text-[11px] font-medium uppercase tracking-wider mb-1.5 block transition-colors",
                  group.glow ? "text-amber-400" : "text-slate-500"
                )}
              >
                {group.label}
              </label>
              <div className="space-y-0.5">
                {group.options.map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-colors text-xs",
                      group.selected.includes(opt.value)
                        ? "bg-amber-500/10 text-amber-300"
                        : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-300"
                    )}
                  >
                    <Checkbox
                      checked={group.selected.includes(opt.value)}
                      onCheckedChange={() => toggleGroup(group, opt.value)}
                      className="h-3.5 w-3.5"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Overlap threshold */}
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-slate-500 block mb-1.5">
              受众重合度 ≥ {overlapValue}%
            </label>
            <Slider
              value={[overlapValue]}
              onValueChange={(v) => {
                const val = Array.isArray(v) ? v[0] : v;
                if (val !== undefined) onOverlapChange(val);
              }}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        <div className="border-t border-slate-700 p-3 shrink-0">
          <Button
            onClick={() => { onApply(); setOpen(false); }}
            className="w-full gap-2 bg-amber-500 text-black hover:bg-amber-400 text-sm h-9"
          >
            应用筛选
            {activeCount > 0 && (
              <Badge className="bg-black/20 text-black text-xs">{activeCount}</Badge>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Active filter chips displayed above content
export function FilterChips({
  groups,
  onRemove,
  onClearAll,
}: {
  groups: { key: string; label: string; activeValues: { value: string; label: string }[] }[];
  onRemove: (groupKey: string, value: string) => void;
  onClearAll: () => void;
}) {
  const allChips = groups.flatMap((g) =>
    g.activeValues.map((v) => ({ groupKey: g.key, groupLabel: g.label, ...v }))
  );
  if (allChips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {allChips.map((chip) => (
        <Badge
          key={`${chip.groupKey}-${chip.value}`}
          variant="secondary"
          className="gap-1 pr-1 bg-slate-700 text-slate-200 text-xs"
        >
          <span className="text-slate-500">{chip.groupLabel}:</span> {chip.label}
          <button
            onClick={() => onRemove(chip.groupKey, chip.value)}
            className="ml-0.5 rounded-full p-0.5 hover:bg-slate-600"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </Badge>
      ))}
      <button onClick={onClearAll} className="text-xs text-slate-500 hover:text-slate-300">
        清除全部
      </button>
    </div>
  );
}
