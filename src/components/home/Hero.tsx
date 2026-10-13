import Link from "next/link";
import type { Lawyer, PlatformStat, Service } from "@/lib/api/types";
import { formatINR, lawyerRate } from "@/lib/pricing";
import { site } from "@/config/site";
import { buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/lawyer/Avatar";
import { HeroSearch, type Suggestion } from "./HeroSearch";

export function Hero({
  services,
  available,
  stats,
  suggestions,
  popular,
  specialtyLabels,
}: {
  services: Service[];
  available: Lawyer[];
  stats: PlatformStat[];
  suggestions: Suggestion[];
  popular: Suggestion[];
  specialtyLabels: Record<string, string>;
}) {
  const talk = services.find((s) => s.slug === "talk-to-lawyer");
  const chat = services.find((s) => s.slug === "chat-with-lawyer");

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden border-b border-ink-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_85%_-10%,theme(colors.brand.50),transparent_70%),radial-gradient(40rem_24rem_at_0%_110%,theme(colors.ink.50),transparent_70%)]"
      />
      <div className="container relative grid gap-10 [&>*]:min-w-0 py-10 sm:py-14 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-14 lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-700 ring-1 ring-ink-200">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" aria-hidden />
            Lawyers · Document review · Legal services
          </p>
          <h1
            id="hero-title"
            className="mt-5 font-display text-[2.35rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.6rem]"
          >
            Legal help, <span className="text-brand-600">without the guesswork.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-600 sm:text-lg">
            Connect with verified legal professionals, review documents, and explore legal products — all in one place,
            with the price shown before you start.
          </p>

          <div className="mt-7 max-w-xl">
            <HeroSearch suggestions={suggestions} popular={popular} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-7 sm:flex">
            <Link href={site.routes.consult} className={buttonClass("dark", "lg", "px-4")}>
              Find a Lawyer <Icon name="arrow-right" className="h-5 w-5" />
            </Link>
            <Link href="#services" className={buttonClass("secondary", "lg", "px-4")}>
              <span className="sm:hidden">All services</span>
              <span className="hidden sm:inline">Explore Legal Services</span>
            </Link>
          </div>

          {stats.length ? (
            <dl className="mt-9 grid max-w-xl grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {stats.slice(0, 4).map((s) => (
                <div key={s.label}>
                  <dt className="text-xs text-ink-500">{s.label}</dt>
                  <dd className="font-display text-xl font-semibold text-ink">{s.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-600">
              {["Rate shown before you start", "Pay per minute from your wallet", `${site.support.hours} customer support`].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <Icon name="check" className="h-4 w-4 text-success-600" /> {t}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl border border-ink-100 bg-white/90 p-5 shadow-lift backdrop-blur sm:p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Start a consultation</h2>
          <p className="mt-1 text-sm text-ink-500">Pick how you want to talk. You choose the lawyer next.</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              { svc: talk, icon: "phone" as const, label: "Call", sub: "Speak to a lawyer" },
              { svc: chat, icon: "chat" as const, label: "Chat", sub: "Advice in writing" },
            ].map(({ svc, icon, label, sub }) =>
              svc ? (
                <Link
                  key={svc.slug}
                  href={svc.href}
                  className="group rounded-2xl border border-ink-100 bg-ink-50/60 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600 shadow-card">
                    <Icon name={icon} />
                  </span>
                  <span className="mt-3 block font-display text-base font-semibold text-ink">{label}</span>
                  <span className="block text-sm text-ink-500">{sub}</span>
                  {svc.price ? (
                    <span className="mt-2 block text-sm font-semibold text-ink">
                      from {formatINR(svc.price.from)}
                      <span className="font-normal text-ink-500">/min</span>
                    </span>
                  ) : null}
                </Link>
              ) : null,
            )}
          </div>

          {available.length ? (
            <div className="mt-6 hidden sm:block">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">Available now</h3>
                <Link href={`${site.routes.consult}?available=1`} className="text-sm font-medium text-brand-700 hover:underline">
                  See all
                </Link>
              </div>
              <ul className="mt-3 divide-y divide-ink-100">
                {available.slice(0, 3).map((l) => {
                  const r = lawyerRate(l, "chat") ?? lawyerRate(l, "call");
                  return (
                    <li key={l.id}>
                      <Link
                        href={site.routes.lawyer(l.slug)}
                        className="flex items-center gap-3 rounded-xl py-3 hover:bg-ink-50/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"
                      >
                        <Avatar name={l.name} src={l.photoUrl} size={40} className="rounded-xl" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-medium text-ink">{l.name}</span>
                          <span className="block truncate text-xs text-ink-500">
                            {l.specialties.map((s) => specialtyLabels[s] ?? s).slice(0, 1).join("")}
                            {l.experienceYears != null ? ` · ${l.experienceYears} yrs` : ""}
                          </span>
                        </span>
                        {r ? (
                          <span className="shrink-0 text-sm font-semibold text-ink">
                            {formatINR(r.perMin)}
                            <span className="font-normal text-ink-500">/min</span>
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
