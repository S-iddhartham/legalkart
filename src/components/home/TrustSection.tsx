import Link from "next/link";
import type { PlatformStat } from "@/lib/api/types";
import { site } from "@/config/site";
import { Icon, type UiIcon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";

const POINTS: { icon: UiIcon; title: string; body: string; link?: { label: string; href: string } }[] = [
  {
    icon: "shield",
    title: "Verified profiles",
    body: "Lawyers carrying the verified mark have had their professional details checked by LegalKart.",
  },
  {
    icon: "receipt",
    title: "Transparent pricing",
    body: "Every lawyer’s per-minute rate is on their profile, and you confirm it before a consultation starts.",
  },
  {
    icon: "lock",
    title: "Secure payments",
    body: "Payments are handled by our payment partner. Wallet credits work with any lawyer on the platform.",
  },
  {
    icon: "user",
    title: "Your privacy",
    body: "Your consultation details are kept private and used only to provide the service.",
    link: { label: "Read our privacy policy", href: site.routes.privacy },
  },
  {
    icon: "headset",
    title: `${site.support.hours} support`,
    body: `Questions about a payment or consultation? Call ${site.support.phone}.`,
    link: { label: "Contact support", href: site.routes.contact },
  },
];

export function TrustSection({ stats }: { stats: PlatformStat[] }) {
  return (
    <Section id="trust" labelledBy="trust-title" className="bg-ink text-white">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">Why LegalKart</p>
          <h2 id="trust-title" className="font-display text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-4xl">
            Built so you can decide with confidence
          </h2>
          {stats.length ? (
            <dl className="mt-10 grid grid-cols-2 gap-6">
              {stats.slice(0, 4).map((s) => (
                <div key={s.label}>
                  <dd className="font-display text-3xl font-semibold">{s.value}</dd>
                  <dt className="mt-1 text-sm text-ink-300">{s.label}</dt>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
        <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
          {POINTS.map((p) => (
            <li key={p.title}>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-brand-200">
                <Icon name={p.icon} />
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold">{p.title}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-ink-300">{p.body}</p>
              {p.link ? (
                <Link href={p.link.href} className="mt-2 inline-block text-sm font-semibold text-brand-200 hover:text-white">
                  {p.link.label} →
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
