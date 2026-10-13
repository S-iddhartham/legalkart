import type { ConsultMode, LawyerSearchParams, LawyerSort } from "./api/types";

const SORTS: LawyerSort[] = ["relevance", "rating", "experience", "price_asc", "price_desc"];
const MODES: ConsultMode[] = ["call", "chat"];

type Readable = { get(name: string): string | null };

function num(v: string | null): number | undefined {
  if (v == null || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** URL query → typed search params. Unknown or invalid values are dropped. */
export function parseSearchParams(sp: Readable): LawyerSearchParams {
  const q = sp.get("q")?.trim() || undefined;
  const mode = sp.get("mode") as ConsultMode | null;
  const sort = sp.get("sort") as LawyerSort | null;
  const page = num(sp.get("page"));
  return {
    q,
    specialty: sp.get("specialty") || undefined,
    language: sp.get("language") || undefined,
    mode: mode && MODES.includes(mode) ? mode : undefined,
    minExperience: num(sp.get("minExperience")),
    minRating: num(sp.get("minRating")),
    maxRate: num(sp.get("maxRate")),
    available: sp.get("available") === "1" ? true : undefined,
    sort: sort && SORTS.includes(sort) && sort !== "relevance" ? sort : undefined,
    page: page && page > 1 ? Math.floor(page) : undefined,
  };
}

/** Typed search params → URL query (stable key order, defaults omitted). */
export function toSearchParams(p: LawyerSearchParams): URLSearchParams {
  const out = new URLSearchParams();
  if (p.q) out.set("q", p.q);
  if (p.specialty) out.set("specialty", p.specialty);
  if (p.language) out.set("language", p.language);
  if (p.mode) out.set("mode", p.mode);
  if (p.minExperience) out.set("minExperience", String(p.minExperience));
  if (p.minRating) out.set("minRating", String(p.minRating));
  if (p.maxRate) out.set("maxRate", String(p.maxRate));
  if (p.available) out.set("available", "1");
  if (p.sort && p.sort !== "relevance") out.set("sort", p.sort);
  if (p.page && p.page > 1) out.set("page", String(p.page));
  return out;
}

/** Count of user-set filters (search text and sort/page excluded). */
export function activeFilterCount(p: LawyerSearchParams): number {
  return [p.specialty, p.language, p.mode, p.minExperience, p.minRating, p.maxRate, p.available].filter(Boolean)
    .length;
}
