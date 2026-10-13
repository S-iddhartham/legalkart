import Link from "next/link";
import type { Lawyer } from "@/lib/api/types";
import { site } from "@/config/site";
import { buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeading } from "@/components/ui/Section";
import { LawyerCard } from "@/components/lawyer/LawyerCard";

export function FeaturedLawyers({
  lawyers,
  specialtyLabels,
  error,
}: {
  lawyers: Lawyer[];
  specialtyLabels: Record<string, string>;
  error?: boolean;
}) {
  const viewAll = (
    <Link href={site.routes.consult} className={buttonClass("secondary", "md")}>
      View all lawyers <Icon name="arrow-right" className="h-4 w-4" />
    </Link>
  );
  return (
    <Section id="lawyers" labelledBy="lawyers-title" className="bg-ink-50/60">
      <SectionHeading
        id="lawyers-title"
        eyebrow="Choose who you consult"
        title="Every lawyer, their own rate"
        intro="Compare specialisation, languages and per-minute rates. Your wallet works with all of them."
        action={<div className="hidden md:block">{viewAll}</div>}
      />
      {error ? (
        <div role="alert" className="rounded-2xl border border-ink-100 bg-white p-8 text-center">
          <p className="text-ink-700">We couldn’t load lawyers just now.</p>
          <Link href={site.routes.consult} className={buttonClass("primary", "md", "mt-4")}>
            Browse all lawyers
          </Link>
        </div>
      ) : lawyers.length === 0 ? (
        <div className="rounded-2xl border border-ink-100 bg-white p-8 text-center">
          <p className="text-ink-700">No lawyers are available this minute.</p>
          <Link href={site.routes.consult} className={buttonClass("primary", "md", "mt-4")}>
            See all lawyers
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 [&>*]:min-w-0 sm:grid-cols-2 lg:grid-cols-3">
          {lawyers.map((l) => (
            <LawyerCard key={l.id} lawyer={l} specialtyLabels={specialtyLabels} />
          ))}
        </div>
      )}
      <div className="mt-8 md:hidden">{viewAll}</div>
    </Section>
  );
}
