"use client";

import Link from "next/link";
import type { Service } from "@/lib/api/types";
import { formatINR } from "@/lib/pricing";
import { track } from "@/lib/analytics";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

function priceLabel(s: Service): string {
  if (!s.price) return "View pricing";
  const { from, unit, note } = s.price;
  if (unit === "min") return `From ${formatINR(from)}/min`;
  if (unit === "pack") return `${formatINR(from)}${note ? ` for ${note}` : ""}`;
  return `From ${formatINR(from)}`;
}

export function ServiceCard({ service, featured = false }: { service: Service; featured?: boolean }) {
  const link = (
    <Link
      href={service.href}
      onClick={() => track("service_card_selected", { service: service.slug })}
      className="outline-none after:absolute after:inset-0 after:rounded-2xl"
    >
      {service.name}
    </Link>
  );
  const footer = (
    <div className="mt-auto flex items-center justify-between gap-3 pt-5">
      <span className={cn("text-sm", service.price ? "font-semibold text-ink" : "text-ink-500")}>{priceLabel(service)}</span>
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700" aria-hidden>
        {service.cta} <Icon name="arrow-right" className="h-4 w-4" />
      </span>
    </div>
  );
  const cardBase =
    "relative rounded-2xl border border-ink-100 bg-white transition-shadow hover:shadow-lift has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-brand-600";

  if (featured) {
    return (
      <article className={cn(cardBase, "flex h-full flex-col p-5 shadow-card sm:p-6")}>
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Icon name={service.icon} className="h-6 w-6" />
          </span>
          {service.badge ? (
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{service.badge}</span>
          ) : null}
        </div>
        <h3 className="mt-4 font-display text-xl font-semibold text-ink">{link}</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-600">{service.summary}</p>
        {footer}
      </article>
    );
  }

  // Compact row on phones, full card from `sm` up.
  return (
    <article className={cn(cardBase, "flex h-full items-center gap-4 p-4 sm:flex-col sm:items-stretch sm:gap-0 sm:p-5")}>
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <Icon name={service.icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1 sm:flex sm:flex-col">
        <h3 className="font-display text-[15px] font-semibold text-ink sm:mt-4 sm:text-base">{link}</h3>
        <p className="mt-0.5 text-sm text-ink-500 sm:hidden">{priceLabel(service)}</p>
        <p className="mt-1.5 hidden text-sm leading-relaxed text-ink-600 sm:block">{service.summary}</p>
        <div className="hidden flex-1 sm:flex sm:flex-col">{footer}</div>
      </div>
      <Icon name="chevron-right" className="h-5 w-5 shrink-0 text-ink-300 sm:hidden" />
    </article>
  );
}
