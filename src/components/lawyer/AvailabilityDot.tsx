import type { Availability } from "@/lib/api/types";
import { cn } from "@/lib/cn";

const LABEL: Record<Availability, string> = { online: "Available now", busy: "In a consultation", offline: "Offline" };
const DOT: Record<Availability, string> = { online: "bg-success-600", busy: "bg-warn-600", offline: "bg-ink-300" };

export function AvailabilityDot({ status, className }: { status?: Availability; className?: string }) {
  if (!status) return null;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium text-ink-600", className)}>
      <span className={cn("h-2 w-2 rounded-full", DOT[status])} aria-hidden />
      {LABEL[status]}
    </span>
  );
}
