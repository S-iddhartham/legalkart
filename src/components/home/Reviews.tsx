import type { Review } from "@/lib/api/types";
import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeading } from "@/components/ui/Section";

/** Renders only real reviews from the API; the section is omitted when there are none. */
export function Reviews({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;
  return (
    <Section id="reviews" labelledBy="reviews-title">
      <SectionHeading id="reviews-title" eyebrow="Customer reviews" title="What clients say" />
      <ul
        aria-label="Customer reviews"
        tabIndex={0}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3"
      >
        {reviews.map((r) => (
          <li key={r.id} className="w-[85%] shrink-0 snap-start md:w-auto">
            <figure className="flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-6">
              {r.rating ? (
                <div className="flex gap-0.5 text-warn-600" role="img" aria-label={`Rated ${r.rating} out of 5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Icon key={i} name="star" filled={i < Math.round(r.rating!)} className="h-4 w-4" />
                  ))}
                </div>
              ) : null}
              <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-700">“{r.text}”</blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="font-semibold text-ink">{r.author}</span>
                {r.service ? <span className="text-ink-500"> · {r.service}</span> : null}
                {r.source ? <span className="block text-xs text-ink-400">via {r.source}</span> : null}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
