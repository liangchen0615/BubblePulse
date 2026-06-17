"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FilterSelectProps {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
  width?: string;
}

export function FilterSelect({ label, value, onValueChange, options, width = "w-28" }: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v || "all")}>
      <SelectTrigger className={cn("h-7 text-xs gap-1", width)}>
        <span className="text-[10px] text-slate-500 shrink-0">{label}</span>
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
