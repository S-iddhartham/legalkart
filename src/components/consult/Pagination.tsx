import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

function pages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1]! > 1) out.push("…");
    out.push(p);
  });
  return out;
}

/** Crawlable link-based pagination; `hrefFor` keeps the current filters. */
export function Pagination({ page, totalPages, hrefFor }: { page: number; totalPages: number; hrefFor: (p: number) => string }) {
  if (totalPages <= 1) return null;
  const base = "inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-[15px] font-medium";
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={cn(base, "text-ink hover:bg-ink-100")} aria-label="Previous page">
          <Icon name="chevron-left" />
        </Link>
      ) : null}
      {pages(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-2 text-ink-400">…</span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(base, p === page ? "bg-ink text-white" : "text-ink-700 hover:bg-ink-100")}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} rel="next" className={cn(base, "text-ink hover:bg-ink-100")} aria-label="Next page">
          <Icon name="chevron-right" />
        </Link>
      ) : null}
    </nav>
  );
}
