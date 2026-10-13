import Link from "next/link";
import type { Article, Option, Service } from "@/lib/api/types";
import { site } from "@/config/site";
import { Section, SectionHeading } from "@/components/ui/Section";

export function Resources({ articles, specialties, services }: { articles: Article[]; specialties: Option[]; services: Service[] }) {
  const cols = [
    {
      title: "Lawyers by specialisation",
      links: specialties.map((s) => ({ label: `${s.label} lawyers`, href: `${site.routes.consult}?specialty=${s.value}` })),
    },
    {
      title: "Documents & reviews",
      links: services.filter((s) => s.group === "documents").map((s) => ({ label: s.name, href: s.href })),
    },
    {
      title: "Startup & property",
      links: services.filter((s) => s.group === "business").map((s) => ({ label: s.name, href: s.href })),
    },
  ];
  return (
    <Section id="resources" labelledBy="resources-title" className="bg-ink-50/60">
      <SectionHeading id="resources-title" eyebrow="Explore" title="Legal resources" />
      {articles.length ? (
        <ul className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <li key={a.href}>
              <Link href={a.href} className="block h-full rounded-2xl border border-ink-100 bg-white p-5 hover:shadow-card">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-700">{a.category}</span>
                <span className="mt-2 block font-medium text-ink">{a.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h3 className="text-sm font-semibold text-ink">{c.title}</h3>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[15px] text-ink-600 hover:text-brand-700">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <nav aria-label="Guides">
          <h3 className="text-sm font-semibold text-ink">Guides</h3>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href={site.routes.blogs} prefetch={false} className="text-[15px] text-ink-600 hover:text-brand-700">
                LegalKart blog
              </Link>
            </li>
            <li>
              <Link href={site.routes.challans} prefetch={false} className="text-[15px] text-ink-600 hover:text-brand-700">
                Check traffic challans
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </Section>
  );
}
