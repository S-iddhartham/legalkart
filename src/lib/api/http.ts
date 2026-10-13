import type {
  Article,
  ConsultMode,
  ConsultQuote,
  ConsultStartResult,
  Lawyer,
  LawyerPage,
  LawyerSearchParams,
  LegalKartApi,
  NavMenu,
  PlatformStat,
  Review,
  SearchCapabilities,
  Service,
  Session,
} from "./types";
import { toSearchParams } from "../consult-query";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Revalidation window (seconds) for cacheable catalogue reads on the server. */
const CATALOGUE_TTL = 300;

/**
 * Thin client for the LegalKart consumer API. Endpoint paths are the contract
 * documented in README.md → "API contract"; adjust them here only.
 */
export function createHttpApi(baseUrl: string): LegalKartApi {
  const base = baseUrl.replace(/\/$/, "");

  async function request<T>(
    path: string,
    init: RequestInit & { ttl?: number; allow404?: boolean } = {},
  ): Promise<T> {
    const { ttl, allow404, ...rest } = init;
    const res = await fetch(`${base}${path}`, {
      ...rest,
      credentials: "include",
      headers: { Accept: "application/json", ...(rest.body ? { "Content-Type": "application/json" } : {}), ...rest.headers },
      ...(ttl !== undefined ? { next: { revalidate: ttl } } : { cache: "no-store" }),
    });
    if (allow404 && res.status === 404) return null as T;
    if (!res.ok) throw new ApiError(`${rest.method ?? "GET"} ${path} failed`, res.status);
    return (await res.json()) as T;
  }

  return {
    isPreview: false,
    getServices: () => request<Service[]>("/catalog/services", { ttl: CATALOGUE_TTL }),
    getNavMenus: () => request<NavMenu[]>("/catalog/nav", { ttl: CATALOGUE_TTL }),
    getFeaturedLawyers: (limit) => request<Lawyer[]>(`/lawyers/featured?limit=${limit}`, { ttl: 60 }),
    searchLawyers: (params: LawyerSearchParams, signal?: AbortSignal) =>
      request<LawyerPage>(`/lawyers?${toSearchParams(params).toString()}`, { signal }),
    getLawyer: (slug) => request<Lawyer | null>(`/lawyers/${encodeURIComponent(slug)}`, { ttl: 60, allow404: true }),
    getSearchCapabilities: () => request<SearchCapabilities>("/lawyers/search-capabilities", { ttl: CATALOGUE_TTL }),
    getReviews: (limit) => request<Review[]>(`/reviews?limit=${limit}`, { ttl: CATALOGUE_TTL }),
    getPlatformStats: () => request<PlatformStat[]>("/platform/stats", { ttl: CATALOGUE_TTL }),
    getArticles: (limit) => request<Article[]>(`/articles?limit=${limit}`, { ttl: CATALOGUE_TTL }),
    getSession: async () => {
      try {
        return await request<Session>("/me");
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null;
        throw e;
      }
    },
    getConsultQuote: (lawyerId: string, mode: ConsultMode, signal?: AbortSignal) =>
      request<ConsultQuote>(`/consult/quote?lawyerId=${encodeURIComponent(lawyerId)}&mode=${mode}`, { signal }),
    startConsultation: (lawyerId: string, mode: ConsultMode) =>
      request<ConsultStartResult>("/consult/sessions", {
        method: "POST",
        body: JSON.stringify({ lawyerId, mode }),
      }),
  } satisfies LegalKartApi;
}

