import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Section({
  id,
  className,
  children,
  labelledBy,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
  labelledBy?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("py-16 sm:py-20", className)}>
      <div className="container">{children}</div>
    </section>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  align = "left",
  action,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-4 sm:mb-12",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">{eyebrow}</p>
        ) : null}
        <h2 id={id} className="font-display text-[1.75rem] font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
          {title}
        </h2>
        {intro ? <p className="mt-3 text-base leading-relaxed text-ink-600 sm:text-lg">{intro}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
