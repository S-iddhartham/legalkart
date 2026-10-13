import Link from "next/link";
import { site } from "@/config/site";
import { Icon } from "./Icon";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${site.url}${c.href}` } : {}),
    })),
  };
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-500">
        {items.map((c, i) => (
          <li key={c.label} className="inline-flex items-center gap-1">
            {i > 0 ? <Icon name="chevron-right" className="h-3.5 w-3.5 text-ink-300" /> : null}
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className="hover:text-ink">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink-700">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </nav>
  );
}
