"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ConsultMode, LawyerPage, LawyerSearchParams, SearchCapabilities } from "@/lib/api/types";
import { activeFilterCount, parseSearchParams, toSearchParams } from "@/lib/consult-query";
import { formatINR } from "@/lib/pricing";
import { track } from "@/lib/analytics";
import { site } from "@/config/site";
import { Button, buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { LawyerCard, LawyerCardSkeleton } from "@/components/lawyer/LawyerCard";
import { FilterFields } from "./FilterFields";
import { Pagination } from "./Pagination";
import { useLawyerSearch } from "./useLawyerSearch";

const SEARCH_DEBOUNCE_MS = 350;

export function ConsultExplorer({
  caps,
  initial,
  initialKey,
}: {
  caps: SearchCapabilities;
  initial: LawyerPage | null;
  initialKey: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  // The URL is the single source of truth, so back/forward restores state.
  const params = useMemo(() => parseSearchParams(sp), [sp]);
  const autoStart = useMemo(() => {
    const m = sp.get("start");
    return m === "call" || m === "chat" ? { mode: m as ConsultMode, slug: sp.get("lawyer") } : null;
  }, [sp]);
  const { state, retry } = useLawyerSearch(params, { key: initialKey, data: initial });
  const [drawer, setDrawer] = useState(false);
  const [text, setText] = useState(params.q ?? "");
  const resultsRef = useRef<HTMLDivElement>(null);
  const labels = useMemo(() => Object.fromEntries(caps.specialties.map((s) => [s.value, s.label])), [caps.specialties]);

  const hrefFor = (p: LawyerSearchParams) => {
    const q = toSearchParams(p).toString();
    return q ? `${pathname}?${q}` : pathname;
  };

  /** Filter change: new history entry, back to page 1. */
  const patch = (change: Partial<LawyerSearchParams>, history: "push" | "replace" = "push") => {
    const next = { ...params, ...change, page: "page" in change ? change.page : undefined };
    track("filter_changed", { keys: Object.keys(change).join(",") });
    router[history](hrefFor(next), { scroll: false });
  };

  // Keep the input in sync when the URL changes via back/forward.
  useEffect(() => setText(params.q ?? ""), [params.q]);

  // Debounced free-text search (replace, so typing doesn't flood history).
  useEffect(() => {
    const t = text.trim();
    if (t === (params.q ?? "")) return;
    const h = setTimeout(() => patch({ q: t || undefined }, "replace"), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const data = state.data;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const filterCount = activeFilterCount(params);

  const chips: { label: string; clear: Partial<LawyerSearchParams> }[] = [
    params.q ? { label: `“${params.q}”`, clear: { q: undefined } } : null,
    params.specialty ? { label: labels[params.specialty] ?? params.specialty, clear: { specialty: undefined } } : null,
    params.mode ? { label: params.mode === "call" ? "Call" : "Chat", clear: { mode: undefined } } : null,
    params.available ? { label: "Available now", clear: { available: undefined } } : null,
    params.language ? { label: params.language, clear: { language: undefined } } : null,
    params.maxRate ? { label: `Up to ${formatINR(params.maxRate)}/min`, clear: { maxRate: undefined } } : null,
    params.minExperience ? { label: `${params.minExperience}+ yrs`, clear: { minExperience: undefined } } : null,
    params.minRating ? { label: `${params.minRating}★+`, clear: { minRating: undefined } } : null,
  ].filter((c): c is NonNullable<typeof c> => c != null);

  const clearAll = () => {
    setText("");
    router.push(hrefFor({ sort: params.sort }), { scroll: false });
  };

  return (
    <div>
      {/* Search + mode */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <label htmlFor="consult-search" className="sr-only">
            Search by lawyer name or legal issue
          </label>
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
          <input
            id="consult-search"
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                track("search_submitted", { q: text.trim(), source: "consult" });
                patch({ q: text.trim() || undefined }, "push");
              }
            }}
            placeholder="Search by name, specialisation or issue"
            enterKeyHint="search"
            autoComplete="off"
            className="h-12 w-full rounded-full border border-ink-200 bg-white pl-12 pr-4 text-base text-ink shadow-card placeholder:text-ink-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
          />
        </div>
        {caps.filters.mode ? (
          <div role="radiogroup" aria-label="Consultation type" className="inline-flex shrink-0 self-start rounded-full bg-ink-100 p-1">
            {[
              { v: undefined, l: "All" },
              { v: "call" as const, l: "Call" },
              { v: "chat" as const, l: "Chat" },
            ].map((o) => (
              <button
                key={o.l}
                type="button"
                role="radio"
                aria-checked={params.mode === o.v}
                onClick={() => patch({ mode: o.v })}
                className={cn(
                  "h-10 rounded-full px-5 text-[15px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600",
                  params.mode === o.v ? "bg-white text-ink shadow-card" : "text-ink-600 hover:text-ink",
                )}
              >
                {o.l}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Specialty chips */}
      <div className="-mx-4 mt-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <ul className="flex gap-2 sm:flex-wrap" aria-label="Popular specialisations">
          {caps.specialties.map((s) => {
            const on = params.specialty === s.value;
            return (
              <li key={s.value} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => patch({ specialty: on ? undefined : s.value })}
                  className={cn(
                    "h-9 rounded-full px-4 text-sm font-medium ring-1 ring-inset transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600",
                    on ? "bg-ink text-white ring-ink" : "bg-white text-ink-700 ring-ink-200 hover:bg-ink-50",
                  )}
                >
                  {s.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-8 grid gap-8 [&>*]:min-w-0 lg:grid-cols-[15rem_1fr] xl:grid-cols-[16.5rem_1fr]">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-28 rounded-2xl border border-ink-100 bg-white p-5">
            <FilterFields caps={caps} params={params} patch={patch} idPrefix="sidebar" />
          </div>
        </aside>

        <div ref={resultsRef}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] text-ink-600" aria-live="polite">
              {data ? (
                <>
                  <span className="font-semibold text-ink">{data.total.toLocaleString("en-IN")}</span>{" "}
                  {data.total === 1 ? "lawyer" : "lawyers"}
                  {params.mode ? ` for ${params.mode === "call" ? "calls" : "chat"}` : ""}
                </>
              ) : (
                "Loading lawyers…"
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setDrawer(true)}>
                <Icon name="filter" className="h-4 w-4" /> Filters{filterCount ? ` (${filterCount})` : ""}
              </Button>
              <label htmlFor="consult-sort" className="sr-only">
                Sort by
              </label>
              <select
                id="consult-sort"
                value={params.sort ?? "relevance"}
                onChange={(e) => patch({ sort: e.target.value as LawyerSearchParams["sort"] })}
                className="h-9 rounded-full border border-ink-200 bg-white pl-3 pr-8 text-sm font-medium text-ink focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
              >
                {caps.sorts.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {chips.length ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => {
                    if ("q" in c.clear) setText("");
                    patch(c.clear);
                  }}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-brand-50 pl-3 pr-2 text-sm font-medium text-brand-800 hover:bg-brand-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"
                >
                  {c.label}
                  <Icon name="close" className="h-4 w-4" />
                  <span className="sr-only">Remove filter</span>
                </button>
              ))}
              <button type="button" onClick={clearAll} className="h-8 px-2 text-sm font-semibold text-ink-600 underline-offset-2 hover:underline">
                Clear all
              </button>
            </div>
          ) : null}

          {/* Results */}
          <div className="mt-6">
            {state.status === "error" && !data ? (
              <ErrorBox onRetry={retry} />
            ) : !data ? (
              <Grid>
                {Array.from({ length: 6 }, (_, i) => (
                  <LawyerCardSkeleton key={i} />
                ))}
              </Grid>
            ) : data.items.length === 0 ? (
              <EmptyState onClear={clearAll} hasFilters={chips.length > 0} />
            ) : (
              <>
                {state.status === "error" ? <ErrorBox onRetry={retry} compact /> : null}
                <div aria-busy={state.status === "loading"} className={cn("transition-opacity", state.status === "loading" && "opacity-60")}>
                  <Grid>
                    {data.items.map((l) => (
                      <LawyerCard
                        key={l.id}
                        lawyer={l}
                        specialtyLabels={labels}
                        mode={params.mode}
                        headingLevel="h2"
                        autoStart={autoStart?.slug === l.slug ? autoStart.mode : undefined}
                      />
                    ))}
                  </Grid>
                </div>
                <Pagination page={data.page} totalPages={totalPages} hrefFor={(p) => hrefFor({ ...params, page: p })} />
              </>
            )}
          </div>
        </div>
      </div>

      {drawer ? (
        <FilterDrawer onClose={() => setDrawer(false)} total={data?.total} onClear={clearAll} count={filterCount}>
          <FilterFields caps={caps} params={params} patch={patch} idPrefix="drawer" />
        </FilterDrawer>
      ) : null}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 [&>*]:min-w-0 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

function ErrorBox({ onRetry, compact = false }: { onRetry: () => void; compact?: boolean }) {
  return (
    <div role="alert" className={cn("rounded-2xl border border-ink-100 bg-white text-center", compact ? "mb-4 p-4" : "p-10")}>
      <p className="text-ink-700">We couldn’t load lawyers. Check your connection and try again.</p>
      <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

function EmptyState({ onClear, hasFilters }: { onClear: () => void; hasFilters: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center">
      <p className="font-display text-lg font-semibold text-ink">No lawyers match these filters</p>
      <p className="mx-auto mt-2 max-w-md text-[15px] text-ink-600">
        Try removing a filter or searching for a broader issue. Our support team can also help you find the right
        lawyer.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {hasFilters ? (
          <Button size="md" onClick={onClear}>
            Clear all filters
          </Button>
        ) : null}
        <a href={site.support.phoneHref} className={buttonClass("secondary", "md")}>
          Call support
        </a>
      </div>
    </div>
  );
}

function FilterDrawer({
  children,
  onClose,
  onClear,
  total,
  count,
}: {
  children: React.ReactNode;
  onClose: () => void;
  onClear: () => void;
  total?: number;
  count: number;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label="Filters"
      className="m-0 ml-auto h-dvh max-h-dvh w-[min(24rem,100vw)] max-w-none bg-white p-0 text-ink backdrop:bg-ink/40"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink-100 px-5">
          <h2 className="font-display text-lg font-semibold">Filters</h2>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close filters"
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink-50"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        <div className="flex shrink-0 gap-3 border-t border-ink-100 p-4" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          {count ? (
            <Button variant="secondary" size="lg" className="flex-1" onClick={onClear}>
              Clear
            </Button>
          ) : null}
          <Button size="lg" className="flex-[2]" onClick={() => ref.current?.close()}>
            {total != null ? `Show ${total} ${total === 1 ? "lawyer" : "lawyers"}` : "Show results"}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

