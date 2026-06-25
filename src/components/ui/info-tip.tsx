"use client";

import { Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function InfoTip({
  content,
  calc,
  className,
  iconSize = "sm",
}: {
  content: string;
  calc?: string;
  className?: string;
  iconSize?: "sm" | "md";
}) {
  const sizeClass = iconSize === "md" ? "h-3.5 w-3.5" : "h-3 w-3";

  return (
    <TooltipProvider delay={300}>
      <Tooltip>
        <TooltipTrigger>
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full cursor-help shrink-0",
              "hover:bg-slate-700/50 transition-colors",
              iconSize === "md" ? "h-4 w-4" : "h-3.5 w-3.5",
              className
            )}
          >
            <Info className={cn(sizeClass, "text-slate-600 hover:text-slate-400")} />
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={6}
          className="max-w-72 p-3 !bg-slate-100 !text-slate-800 **:!bg-slate-100 **:!fill-slate-100"
        >
          <div className="space-y-1.5">
            <p className="text-xs leading-relaxed">{content}</p>
            {calc && (
              <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-300 pt-1.5">
                {calc}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function InfoLabel({
  children,
  tip,
  calc,
  className,
}: {
  children: React.ReactNode;
  tip: string;
  calc?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {children}
      <InfoTip content={tip} calc={calc} />
    </span>
  );
}
