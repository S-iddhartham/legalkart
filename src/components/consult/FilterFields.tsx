"use client";

import type { LawyerSearchParams, SearchCapabilities } from "@/lib/api/types";
import { formatINR } from "@/lib/pricing";
import { cn } from "@/lib/cn";

type Patch = (p: Partial<LawyerSearchParams>) => void;

function Group({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-ink-100 py-5 first:pt-0 last:border-0">
      <legend className="float-left mb-3 w-full text-sm font-semibold text-ink">{legend}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

function RadioList<T extends string | number>({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: T | undefined;
  options: { value: T | undefined; label: string }[];
  onChange: (v: T | undefined) => void;
}) {
  return (
    <div className="space-y-1">
      {options.map((o) => {
        const checked = value === o.value;
        return (
          <label
            key={String(o.value)}
            className={cn(
              "flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-2 text-[15px] hover:bg-ink-50",
              checked ? "font-medium text-ink" : "text-ink-700",
            )}
          >
            <input
              type="radio"
              name={name}
              checked={checked}
              onChange={() => onChange(o.value)}
              className="h-4 w-4 accent-brand-600"
            />
            {o.label}
          </label>
        );
      })}
    </div>
  );
}

/** Renders only the filters the search API reports as supported. */
export function FilterFields({
  caps,
  params,
  patch,
  idPrefix,
}: {
  caps: SearchCapabilities;
  params: LawyerSearchParams;
  patch: Patch;
  /** Keeps ids/radio names unique when sidebar and drawer coexist. */
  idPrefix: string;
}) {
  const f = caps.filters;
  return (
    <div>
      {f.availability ? (
        <Group legend="Availability">
          <label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-2 text-[15px] text-ink-700 hover:bg-ink-50">
            <input
              type="checkbox"
              checked={!!params.available}
              onChange={(e) => patch({ available: e.target.checked || undefined })}
              className="h-4 w-4 rounded accent-brand-600"
            />
            Available now
          </label>
        </Group>
      ) : null}
      {f.language && caps.languages.length ? (
        <Group legend="Language">
          <label htmlFor={`${idPrefix}-language`} className="sr-only">
            Language
          </label>
          <select
            id={`${idPrefix}-language`}
            value={params.language ?? ""}
            onChange={(e) => patch({ language: e.target.value || undefined })}
            className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-[15px] text-ink focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
          >
            <option value="">Any language</option>
            {caps.languages.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </Group>
      ) : null}
      {f.price && caps.maxRateOptions.length ? (
        <Group legend="Rate per minute">
          <RadioList
            name={`${idPrefix}-maxRate`}
            value={params.maxRate}
            onChange={(v) => patch({ maxRate: v })}
            options={[{ value: undefined, label: "Any rate" }, ...caps.maxRateOptions.map((r) => ({ value: r, label: `Up to ${formatINR(r)}` }))]}
          />
        </Group>
      ) : null}
      {f.experience && caps.experienceOptions.length ? (
        <Group legend="Experience">
          <RadioList
            name={`${idPrefix}-minExperience`}
            value={params.minExperience}
            onChange={(v) => patch({ minExperience: v })}
            options={[{ value: undefined, label: "Any experience" }, ...caps.experienceOptions.map((y) => ({ value: y, label: `${y}+ years` }))]}
          />
        </Group>
      ) : null}
      {f.rating && caps.ratingOptions.length ? (
        <Group legend="Rating">
          <RadioList
            name={`${idPrefix}-minRating`}
            value={params.minRating}
            onChange={(v) => patch({ minRating: v })}
            options={[{ value: undefined, label: "Any rating" }, ...caps.ratingOptions.map((r) => ({ value: r, label: `${r}★ & above` }))]}
          />
        </Group>
      ) : null}
    </div>
  );
}
