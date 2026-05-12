"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className="w-full">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-claria-ink/10">
        <div
          className={cn(
            "h-full rounded-full bg-claria-ink transition-all duration-500 ease-out"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-medium text-claria-ink/50">
        {current} di {total}
      </p>
    </div>
  );
}
