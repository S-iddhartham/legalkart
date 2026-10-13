import Image from "next/image";
import { cn } from "@/lib/cn";

const TONES = ["bg-brand-100 text-brand-800", "bg-ink-100 text-ink-800", "bg-success-50 text-success-700", "bg-warn-50 text-warn-700"];

function initials(name: string) {
  return name
    .replace(/^Adv\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function Avatar({ name, src, size = 56, className }: { name: string; src?: string; size?: number; className?: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={`Photo of ${name}`}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-2xl object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  const tone = TONES[name.length % TONES.length];
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-2xl font-display font-semibold", tone, className)}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initials(name)}
    </span>
  );
}
