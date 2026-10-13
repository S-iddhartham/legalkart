"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export interface Suggestion {
  label: string;
  href: string;
  kind: "Lawyers" | "Service";
  terms: string;
}

/**
 * Combobox (ARIA 1.2 pattern) over real categories: lawyer specialties and the
 * service catalogue. Free text falls through to lawyer search on /consult.
 */
export function HeroSearch({ suggestions, popular }: { suggestions: Suggestion[]; popular: Suggestion[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const input = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return suggestions.filter((s) => s.terms.includes(t)).slice(0, 7);
  }, [q, suggestions]);

  const go = (s: Suggestion, source: string) => {
    track("search_suggestion_selected", { label: s.label, kind: s.kind, source });
    setOpen(false);
    router.push(s.href);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (active >= 0 && matches[active]) return go(matches[active], "keyboard");
    const term = q.trim();
    track("search_submitted", { q: term, results_hint: matches.length });
    router.push(term ? `/consult?q=${encodeURIComponent(term)}` : "/consult");
  };

  const showList = open && matches.length > 0;

  return (
    <div>
      <form role="search" onSubmit={submit} className="relative">
        <label htmlFor="hero-search" className="sr-only">
          Search lawyers, legal problems or services
        </label>
        <div className="flex items-center rounded-full bg-white p-1.5 shadow-lift ring-1 ring-ink-200 focus-within:ring-2 focus-within:ring-brand-600">
          <Icon name="search" className="ml-3 h-5 w-5 shrink-0 text-ink-400" />
          <input
            ref={input}
            id="hero-search"
            type="search"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            enterKeyHint="search"
            placeholder="Try “property dispute” or “rental agreement”"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
                setActive((a) => Math.min(a + 1, matches.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, -1));
              } else if (e.key === "Escape") {
                setOpen(false);
                setActive(-1);
              }
            }}
            className="h-11 min-w-0 flex-1 bg-transparent px-3 text-base text-ink placeholder:text-ink-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="submit"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-600 px-4 font-semibold text-white hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:px-6"
          >
            <span className="sr-only sm:not-sr-only">Find a lawyer</span>
            <Icon name="arrow-right" className="h-5 w-5 sm:hidden" />
          </button>
        </div>
        <ul
          id={listId}
          role="listbox"
          aria-label="Suggestions"
          hidden={!showList}
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-ink-100 bg-white p-1.5 shadow-menu"
        >
          {matches.map((s, i) => (
            <li
              key={s.href + s.label}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(s, "pointer")}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5",
                i === active ? "bg-brand-50" : "hover:bg-ink-50",
              )}
            >
              <span className="text-[15px] text-ink">{s.label}</span>
              <span className="shrink-0 text-xs font-medium text-ink-500">{s.kind}</span>
            </li>
          ))}
        </ul>
      </form>
      {popular.length ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-500">Popular:</span>
          {popular.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              onClick={() => track("search_suggestion_selected", { label: p.label, kind: p.kind, source: "popular" })}
              className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-ink-700 ring-1 ring-inset ring-ink-200 hover:bg-ink-50 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"
            >
              {p.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
