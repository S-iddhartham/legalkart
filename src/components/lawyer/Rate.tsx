import type { DisplayRate } from "@/lib/pricing";
import { formatINR } from "@/lib/pricing";
import { cn } from "@/lib/cn";

export function Rate({ rate, size = "md", className }: { rate: DisplayRate; size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-1.5", className)}>
      <span
        className={cn(
          "font-display font-semibold text-ink",
          size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-base",
        )}
      >
        {formatINR(rate.perMin)}
      </span>
      <span className="text-sm text-ink-500">/min</span>
      {rate.originalPerMin ? (
        <span className="text-sm text-ink-400 line-through" aria-label={`Standard rate ${formatINR(rate.originalPerMin)} per minute`}>
          {formatINR(rate.originalPerMin)}
        </span>
      ) : null}
    </span>
  );
}
