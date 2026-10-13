import Link from "next/link";
import type { ConsultMode, Lawyer } from "@/lib/api/types";
import { lawyerRate } from "@/lib/pricing";
import { site } from "@/config/site";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "./Avatar";
import { AvailabilityDot } from "./AvailabilityDot";
import { Rate } from "./Rate";
import { ConsultActions } from "./ConsultActions";

const MODE_LABEL: Record<ConsultMode, string> = { chat: "Chat", call: "Call" };

export function LawyerCard({
  lawyer,
  specialtyLabels,
  mode,
  autoStart,
  headingLevel = "h3",
}: {
  lawyer: Lawyer;
  specialtyLabels: Record<string, string>;
  /** Selected consultation mode; when set, only that mode's rate is shown. */
  mode?: ConsultMode;
  autoStart?: ConsultMode;
  headingLevel?: "h2" | "h3";
}) {
  const H = headingLevel;
  const profile = site.routes.lawyer(lawyer.slug);
  const modes = (mode ? [mode] : (["chat", "call"] as ConsultMode[])).filter((m) => lawyer.modes.includes(m));
  const specialties = lawyer.specialties.map((s) => specialtyLabels[s] ?? s);

  return (
    <article className="group relative flex h-full min-w-0 flex-col rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-shadow hover:shadow-lift has-[a[href]:focus-visible]:ring-2 has-[a[href]:focus-visible]:ring-brand-600">
      <div className="flex gap-4">
        <Avatar name={lawyer.name} src={lawyer.photoUrl} />
        <div className="min-w-0 flex-1">
          <H className="flex items-center gap-1.5 font-display text-[1.05rem] font-semibold leading-snug text-ink">
            <Link href={profile} className="min-w-0 truncate outline-none after:absolute after:inset-0 after:rounded-2xl">
              {lawyer.name}
            </Link>
            {lawyer.verified ? (
              <Icon name="shield" className="h-4 w-4 shrink-0 text-success-600" title="Verified by LegalKart" />
            ) : null}
          </H>
          {specialties.length ? (
            <p className="mt-0.5 truncate text-sm font-medium text-brand-700">{specialties.slice(0, 2).join(" · ")}</p>
          ) : null}
          <AvailabilityDot status={lawyer.availability} className="mt-1.5" />
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-600">
        {lawyer.experienceYears != null ? <li>{lawyer.experienceYears} yrs exp.</li> : null}
        {lawyer.rating ? (
          <li className="inline-flex items-center gap-1">
            <Icon name="star" filled className="h-4 w-4 text-warn-600" />
            <span className="font-medium text-ink">{lawyer.rating.average.toFixed(1)}</span>
            <span className="text-ink-500">({lawyer.rating.count.toLocaleString("en-IN")})</span>
          </li>
        ) : null}
        {lawyer.languages.length ? (
          <li className="inline-flex min-w-0 items-center gap-1">
            <Icon name="globe" className="h-4 w-4 shrink-0 text-ink-400" />
            <span className="truncate">{lawyer.languages.join(", ")}</span>
          </li>
        ) : null}
      </ul>

      <div className="mt-auto pt-4">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 border-t border-ink-100 pt-4">
          {modes.map((m) => {
            const r = lawyerRate(lawyer, m);
            return r ? (
              <div key={m} className="flex items-baseline gap-2">
                {!mode ? <span className="text-xs font-medium uppercase tracking-wide text-ink-500">{MODE_LABEL[m]}</span> : null}
                <Rate rate={r} size={mode ? "md" : "sm"} />
              </div>
            ) : null;
          })}
        </div>
        {lawyer.availability === "offline" ? (
          <div className="relative z-10 mt-4 flex items-center justify-between gap-3 text-sm">
            <span className="text-ink-500">Not taking consultations right now.</span>
            <Link
              href={`${site.routes.consult}?${new URLSearchParams({ ...(lawyer.specialties[0] ? { specialty: lawyer.specialties[0] } : {}), available: "1" }).toString()}`}
              className="shrink-0 font-semibold text-brand-700 hover:underline"
            >
              See available
            </Link>
          </div>
        ) : (
          <ConsultActions lawyer={lawyer} autoStart={autoStart} className="relative z-10 mt-4" />
        )}
      </div>
    </article>
  );
}

export function LawyerCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-5" aria-hidden>
      <div className="flex gap-4">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="mt-5 h-3.5 w-4/5" />
      <Skeleton className="mt-6 h-px w-full" />
      <Skeleton className="mt-4 h-5 w-1/3" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-full" />
        <Skeleton className="h-9 flex-1 rounded-full" />
      </div>
    </div>
  );
}
