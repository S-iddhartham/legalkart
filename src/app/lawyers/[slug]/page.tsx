import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApi } from "@/lib/api";
import type { ConsultMode } from "@/lib/api/types";
import { lawyerRate } from "@/lib/pricing";
import { site } from "@/config/site";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Icon } from "@/components/ui/Icon";
import { TrackView } from "@/components/ui/TrackView";
import { Avatar } from "@/components/lawyer/Avatar";
import { AvailabilityDot } from "@/components/lawyer/AvailabilityDot";
import { Rate } from "@/components/lawyer/Rate";
import { ConsultActions } from "@/components/lawyer/ConsultActions";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> };

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [lawyer, caps] = await Promise.all([getApi().getLawyer(slug), getApi().getSearchCapabilities().catch(() => null)]);
  if (!lawyer) return { title: "Lawyer not found", robots: { index: false } };
  const spec = lawyer.specialties.map((s) => caps?.specialties.find((o) => o.value === s)?.label ?? s).join(", ");
  return {
    title: `${lawyer.name}${spec ? ` — ${spec} Lawyer` : ""}${lawyer.city ? ` in ${lawyer.city}` : ""}`,
    description: `Consult ${lawyer.name}${spec ? `, ${spec.toLowerCase()} lawyer` : ""}, on LegalKart by call or chat. See languages, experience and per-minute rates.`,
    alternates: { canonical: site.routes.lawyer(lawyer.slug) },
  };
}

export default async function LawyerProfilePage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const api = getApi();
  const [lawyer, caps] = await Promise.all([api.getLawyer(slug), api.getSearchCapabilities()]);
  if (!lawyer) notFound();
  const labels = Object.fromEntries(caps.specialties.map((s) => [s.value, s.label]));
  const autoStart = sp.start === "call" || sp.start === "chat" ? (sp.start as ConsultMode) : undefined;
  const modes = (["chat", "call"] as ConsultMode[]).filter((m) => lawyer.modes.includes(m));
  const primarySpecialty = lawyer.specialties[0];

  const facts = [
    lawyer.experienceYears != null ? { k: "Experience", v: `${lawyer.experienceYears} years` } : null,
    lawyer.rating ? { k: "Rating", v: `${lawyer.rating.average.toFixed(1)} ★ (${lawyer.rating.count.toLocaleString("en-IN")} reviews)` } : null,
    lawyer.consultationsCount != null ? { k: "Consultations", v: lawyer.consultationsCount.toLocaleString("en-IN") } : null,
    lawyer.languages.length ? { k: "Languages", v: lawyer.languages.join(", ") } : null,
    lawyer.city ? { k: "Location", v: lawyer.city } : null,
  ].filter((f): f is { k: string; v: string } => f != null);

  return (
    <div className="container py-8 sm:py-10">
      <TrackView event="lawyer_profile_viewed" props={{ lawyer: lawyer.id }} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Find a lawyer", href: "/consult" },
          ...(primarySpecialty && labels[primarySpecialty]
            ? [{ label: labels[primarySpecialty], href: `/consult?specialty=${primarySpecialty}` }]
            : []),
          { label: lawyer.name },
        ]}
      />
      <div className="mt-6 grid gap-8 [&>*]:min-w-0 lg:grid-cols-[1fr_22rem]">
        <div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar name={lawyer.name} src={lawyer.photoUrl} size={96} className="rounded-3xl" />
            <div>
              <h1 className="flex flex-wrap items-center gap-2 font-display text-3xl font-semibold tracking-tight text-ink">
                {lawyer.name}
                {lawyer.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-semibold text-success-700">
                    <Icon name="shield" className="h-3.5 w-3.5" /> Verified
                  </span>
                ) : null}
              </h1>
              {lawyer.specialties.length ? (
                <p className="mt-1 text-base font-medium text-brand-700">
                  {lawyer.specialties.map((s) => labels[s] ?? s).join(" · ")}
                </p>
              ) : null}
              <AvailabilityDot status={lawyer.availability} className="mt-2 text-sm" />
            </div>
          </div>

          {facts.length ? (
            <dl className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-ink-100 p-5 sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.k}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">{f.k}</dt>
                  <dd className="mt-1 text-[15px] font-medium text-ink">{f.v}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {lawyer.bio ? (
            <section className="mt-10" aria-labelledby="about">
              <h2 id="about" className="font-display text-xl font-semibold text-ink">About</h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-700">{lawyer.bio}</p>
            </section>
          ) : null}

          {lawyer.education?.length ? (
            <section className="mt-10" aria-labelledby="education">
              <h2 id="education" className="font-display text-xl font-semibold text-ink">Education</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-[15px] text-ink-700">
                {lawyer.education.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {primarySpecialty ? (
            <p className="mt-10 text-[15px] text-ink-600">
              Looking for someone else?{" "}
              <Link href={`/consult?specialty=${primarySpecialty}`} className="font-semibold text-brand-700 hover:underline">
                See more {labels[primarySpecialty] ?? ""} lawyers
              </Link>
            </p>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <h2 className="font-display text-lg font-semibold text-ink">Consultation rates</h2>
            <ul className="mt-4 divide-y divide-ink-100">
              {modes.map((m) => {
                const r = lawyerRate(lawyer, m);
                return r ? (
                  <li key={m} className="flex items-center justify-between py-3">
                    <span className="inline-flex items-center gap-2 text-[15px] text-ink-700">
                      <Icon name={m === "call" ? "phone" : "chat"} className="h-4 w-4 text-ink-400" />
                      {m === "call" ? "Call" : "Chat"}
                    </span>
                    <Rate rate={r} size="md" />
                  </li>
                ) : null;
              })}
            </ul>
            {lawyer.availability === "offline" ? (
              <div className="mt-4 rounded-xl bg-ink-50 p-4 text-sm text-ink-700">
                {lawyer.name} isn’t taking consultations right now.{" "}
                <Link
                  href={`/consult?${new URLSearchParams({ ...(primarySpecialty ? { specialty: primarySpecialty } : {}), available: "1" })}`}
                  className="font-semibold text-brand-700 hover:underline"
                >
                  See available lawyers
                </Link>
              </div>
            ) : (
              <ConsultActions lawyer={lawyer} autoStart={autoStart} size="md" className="mt-4" />
            )}
            <p className="mt-4 text-xs leading-relaxed text-ink-500">
              Charged per minute from your wallet. You’ll see your balance and confirm before anything starts.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
