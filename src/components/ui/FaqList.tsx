import Link from "next/link";
import type { Faq } from "@/content/faq";
import { Icon } from "./Icon";

/** Native <details> accordion: keyboard/AT accessible without JavaScript. */
export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
      {items.map((f) => (
        <details key={f.q} className="group px-5 sm:px-6">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 [&::-webkit-details-marker]:hidden">
            <span className="text-[15px] sm:text-base">{f.q}</span>
            <Icon name="chevron-down" className="h-5 w-5 shrink-0 text-ink-400 transition-transform group-open:rotate-180" />
          </summary>
          <div className="pb-5 text-[15px] leading-relaxed text-ink-600">
            <p>{f.a}</p>
            {f.link ? (
              <Link href={f.link.href} className="mt-2 inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
                {f.link.label} <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </details>
      ))}
    </div>
  );
}

export function faqJsonLd(items: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
