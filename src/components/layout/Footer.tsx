import Link from "next/link";
import { getApi } from "@/lib/api";
import { isAppRoute, site } from "@/config/site";
import { Logo } from "./Logo";

export async function Footer() {
  const services = await getApi().getServices();
  const groups: { title: string; items: { label: string; href: string }[] }[] = [
    {
      title: "Consult",
      items: [
        { label: "Find a lawyer", href: site.routes.consult },
        ...services.filter((s) => s.group === "consultation").map((s) => ({ label: s.name, href: s.href })),
      ],
    },
    {
      title: "Documents",
      items: services.filter((s) => s.group === "documents").map((s) => ({ label: s.name, href: s.href })),
    },
    {
      title: "Business & property",
      items: services.filter((s) => s.group === "business").map((s) => ({ label: s.name, href: s.href })),
    },
    {
      title: "Company",
      items: [
        { label: "About us", href: site.routes.about },
        { label: "Blogs", href: site.routes.blogs },
        { label: "Contact us", href: site.routes.contact },
        { label: "Privacy policy", href: site.routes.privacy },
        { label: "Terms & conditions", href: site.routes.terms },
        { label: "Refund policy", href: site.routes.refund },
      ],
    },
  ];

  return (
    <footer className="border-t border-ink-100 bg-ink-50/60">
      <div className="container py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-600">{site.description}</p>
            <p className="mt-4 text-sm text-ink-700">
              {site.support.hours} support:{" "}
              <a href={site.support.phoneHref} className="font-semibold text-ink hover:text-brand-700">
                {site.support.phone}
              </a>
            </p>
            <ul className="mt-4 flex gap-4 text-sm">
              {site.social.map((s) => (
                <li key={s.href}>
                  <a href={s.href} rel="noopener noreferrer" target="_blank" className="text-ink-600 hover:text-ink">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {groups.map((g) => (
            <nav key={g.title} aria-label={g.title}>
              <h2 className="text-sm font-semibold text-ink">{g.title}</h2>
              <ul className="mt-3 space-y-2">
                {g.items.map((i) => (
                  <li key={i.href}>
                    <Link href={i.href} prefetch={isAppRoute(i.href) ? undefined : false} className="text-sm text-ink-600 hover:text-ink">
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 border-t border-ink-200 pt-6 text-xs leading-relaxed text-ink-500">
          <p>
            Disclaimer: {site.name} is a technology platform that connects users with independent legal professionals.
            {" "}{site.name} is not a law firm and does not provide legal advice itself. Information on this site is for
            general guidance and is not a substitute for advice on your specific situation.
          </p>
          <p className="mt-3">© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
