"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FilterSelectProps {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
  width?: string;
  glow?: boolean;
}

export function FilterSelect({ label, value, onValueChange, options, width = "w-28", glow }: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v || "all")}>
      <SelectTrigger className={cn(
        "h-7 text-xs gap-1 transition-all duration-300",
        width,
        glow && "brand-preset-active brand-preset-glow"
      )}>
        <span className={cn("text-[10px] shrink-0 transition-colors duration-300", glow ? "text-amber-400" : "text-slate-500")}>{label}</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="min-w-0 w-(--anchor-width)">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
