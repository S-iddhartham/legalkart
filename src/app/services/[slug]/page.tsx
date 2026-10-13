import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApi } from "@/lib/api";
import { formatINR } from "@/lib/pricing";
import { site } from "@/config/site";
import { buttonClass } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Icon } from "@/components/ui/Icon";
import { ServiceCard } from "@/components/home/ServiceCard";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  const services = await getApi().getServices().catch(() => []);
  return services.filter((s) => s.href === site.routes.service(s.slug)).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const svc = (await getApi().getServices()).find((s) => s.slug === slug);
  if (!svc) return { title: "Service not found", robots: { index: false } };
  return { title: svc.name, description: svc.summary, alternates: { canonical: site.routes.service(slug) } };
}

/**
 * Service overview. Product checkout pages live in the existing commerce flow;
 * this page explains the service and hands off to it (or to a consultation).
 */
export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const api = getApi();
  const [services, menus] = await Promise.all([api.getServices(), api.getNavMenus()]);
  const svc = services.find((s) => s.slug === slug);
  if (!svc) notFound();
  const menu = menus.find((m) => m.items.some((i) => i.href === svc.href));
  const related = services.filter((s) => s.group === svc.group && s.slug !== svc.slug).slice(0, 3);

  return (
    <div className="container py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          ...(menu ? [{ label: menu.label }] : []),
          { label: svc.name, href: svc.href },
        ]}
      />
      <div className="mt-6 grid gap-8 [&>*]:min-w-0 lg:grid-cols-[1fr_22rem]">
        <div>
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Icon name={svc.icon} className="h-7 w-7" />
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{svc.name}</h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-600">{svc.summary}</p>
          {menu ? (
            <nav aria-label={`More in ${menu.label}`} className="mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-500">More in {menu.label}</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {menu.items
                  .filter((i) => i.href !== svc.href)
                  .map((i) => (
                    <li key={i.href}>
                      <Link href={i.href} className="inline-flex h-9 items-center rounded-full bg-ink-50 px-4 text-sm font-medium text-ink-700 hover:bg-ink-100">
                        {i.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </nav>
          ) : null}
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <p className="text-sm text-ink-500">Pricing</p>
            <p className="mt-1 font-display text-2xl font-semibold text-ink">
              {svc.price ? `From ${formatINR(svc.price.from)}${svc.price.unit === "min" ? "/min" : ""}` : "Depends on the product"}
            </p>
            <p className="mt-2 text-sm text-ink-600">
              {svc.price
                ? "The exact price is shown before you pay."
                : "Each product lists its price before checkout. Talk to a lawyer if you’re not sure which one you need."}
            </p>
            <Link href={site.routes.consult} className={buttonClass("primary", "lg", "mt-5 w-full")}>
              Talk to a lawyer first
            </Link>
            <a href={site.support.phoneHref} className={buttonClass("secondary", "lg", "mt-2 w-full")}>
              Call support
            </a>
          </div>
        </aside>
      </div>
      {related.length ? (
        <section aria-labelledby="related" className="mt-16">
          <h2 id="related" className="font-display text-xl font-semibold text-ink">Related services</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
