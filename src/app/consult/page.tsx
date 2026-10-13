import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getApi } from "@/lib/api";
import type { LawyerPage } from "@/lib/api/types";
import { parseSearchParams, toSearchParams } from "@/lib/consult-query";
import { HOME_FAQ } from "@/content/faq";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqList } from "@/components/ui/FaqList";
import { ConsultExplorer } from "@/components/consult/ConsultExplorer";

type SP = Promise<Record<string, string | string[] | undefined>>;

function toReadable(raw: Record<string, string | string[] | undefined>) {
  return { get: (k: string) => (Array.isArray(raw[k]) ? (raw[k] as string[])[0] : (raw[k] as string | undefined)) ?? null };
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const params = parseSearchParams(toReadable(await searchParams));
  const caps = await getApi().getSearchCapabilities().catch(() => null);
  const specialty = params.specialty && caps?.specialties.find((s) => s.value === params.specialty)?.label;
  const title = specialty ? `${specialty} Lawyers — Consult Online` : "Find a Lawyer — Consult Online by Call or Chat";
  // Specialty pages are indexable landing pages; any other filter combination
  // canonicalises to its specialty (or the base) page to avoid thin duplicates.
  const canonical = params.specialty && specialty ? `/consult?specialty=${params.specialty}` : "/consult";
  const filtered = Object.keys(Object.fromEntries(toSearchParams({ ...params, specialty: undefined }))).length > 0;
  return {
    title,
    description: `Compare ${specialty ? `${specialty.toLowerCase()} ` : ""}lawyers by specialisation, language, availability and per-minute rate. Start a call or chat when you're ready.`,
    alternates: { canonical },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function ConsultPage({ searchParams }: { searchParams: SP }) {
  const raw = await searchParams;
  const params = parseSearchParams(toReadable(raw));
  const api = getApi();
  const [caps, initial] = await Promise.all([
    api.getSearchCapabilities(),
    api.searchLawyers(params).catch((): LawyerPage | null => null),
  ]);

  return (
    <div className="container py-8 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Find a lawyer", href: "/consult" }]} />
      <header className="mt-5 max-w-3xl">
        <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-[2.6rem]">
          Find the right lawyer for your legal needs.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-600 sm:text-lg">
          Compare verified professional profiles, specialisations, languages, availability and consultation rates.
        </p>
      </header>

      <div className="mt-8">
        <Suspense>
          <ConsultExplorer caps={caps} initial={initial} initialKey={toSearchParams(params).toString()} />
        </Suspense>
      </div>

      <section aria-labelledby="consult-faq" className="mt-20 grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <h2 id="consult-faq" className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            Before you start
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
            Not sure you need a consultation? A document review may be quicker for checking an agreement.
          </p>
          <ul className="mt-4 space-y-2 text-[15px]">
            <li>
              <Link href="/services/ai-document-review" className="font-semibold text-brand-700 hover:underline">
                AI Document Review →
              </Link>
            </li>
            <li>
              <Link href="/services/lawyer-document-review" className="font-semibold text-brand-700 hover:underline">
                Lawyer Document Review →
              </Link>
            </li>
          </ul>
        </div>
        <FaqList items={HOME_FAQ.slice(0, 4)} />
      </section>
    </div>
  );
}
