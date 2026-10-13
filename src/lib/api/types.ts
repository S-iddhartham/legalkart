/**
 * Typed models for the LegalKart consumer API.
 *
 * Every optional field is optional on purpose: the UI renders a field only when
 * the backend returns it, so nothing (ratings, experience, availability…) is
 * ever filled in on the client.
 */

export type ConsultMode = "call" | "chat";

export type Availability = "online" | "busy" | "offline";

export interface CustomRate {
  perMin: number;
  active: boolean;
  /** ISO timestamp; when present the custom rate expires at this instant. */
  validUntil?: string;
}

export interface RateCard {
  /** Lawyer's standard per-minute rate in INR. */
  defaultPerMin: number;
  /** Lawyer-set custom rate. Only customers' *view* of it is modelled here. */
  custom?: CustomRate;
}

export interface Lawyer {
  id: string;
  slug: string;
  name: string;
  photoUrl?: string;
  verified?: boolean;
  specialties: string[];
  experienceYears?: number;
  languages: string[];
  city?: string;
  rating?: { average: number; count: number };
  availability?: Availability;
  modes: ConsultMode[];
  rates: Partial<Record<ConsultMode, RateCard>>;
  bio?: string;
  consultationsCount?: number;
  education?: string[];
}

export type LawyerSort = "relevance" | "rating" | "experience" | "price_asc" | "price_desc";

export interface LawyerSearchParams {
  q?: string;
  specialty?: string;
  language?: string;
  mode?: ConsultMode;
  minExperience?: number;
  minRating?: number;
  maxRate?: number;
  available?: boolean;
  sort?: LawyerSort;
  page?: number;
}

export interface LawyerPage {
  items: Lawyer[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Option {
  value: string;
  label: string;
}

/**
 * What the lawyer-search endpoint actually supports. The Consult screen only
 * renders a filter when its flag is true, so no filter can claim to work
 * without backend support.
 */
export interface SearchCapabilities {
  specialties: Option[];
  languages: Option[];
  sorts: { value: LawyerSort; label: string }[];
  filters: {
    mode: boolean;
    language: boolean;
    experience: boolean;
    rating: boolean;
    price: boolean;
    availability: boolean;
  };
  experienceOptions: number[];
  ratingOptions: number[];
  maxRateOptions: number[];
}

export type ServiceGroup = "consultation" | "documents" | "business" | "other";

export type IconName =
  | "phone"
  | "chat"
  | "bolt"
  | "doc-check"
  | "doc-user"
  | "contract"
  | "home"
  | "rocket"
  | "building"
  | "bulb"
  | "badge"
  | "key"
  | "bag"
  | "question"
  | "car";

export interface ServicePrice {
  from: number;
  unit: "min" | "once" | "pack";
  /** e.g. "10 min" for a chat pack. */
  note?: string;
}

export interface Service {
  slug: string;
  name: string;
  summary: string;
  group: ServiceGroup;
  icon: IconName;
  /** null → price depends on product; UI shows "View pricing". */
  price: ServicePrice | null;
  href: string;
  cta: string;
  badge?: string;
  /** Alternative wording used in search suggestions. */
  keywords?: string[];
}

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavMenu {
  id: string;
  label: string;
  items: NavLink[];
  viewAll?: NavLink;
}

export interface Review {
  id: string;
  text: string;
  /** Display name as permitted by the privacy policy (e.g. "Ankit S."). */
  author: string;
  rating?: number;
  service?: string;
  source?: string;
  date?: string;
}

export interface PlatformStat {
  label: string;
  value: string;
}

export interface Article {
  title: string;
  href: string;
  category: string;
}

export interface Session {
  userId: string;
  name?: string;
}

export interface ConsultQuote {
  lawyerId: string;
  mode: ConsultMode;
  ratePerMin: number;
  defaultRatePerMin: number;
  walletBalance: number;
  /** Balance needed before the backend will start a session. */
  minimumBalance: number;
  lawyerAvailable: boolean;
  /** A previous payment is still being confirmed by the gateway. */
  pendingPayment: boolean;
}

export type ConsultStartResult =
  | { status: "started"; sessionUrl: string }
  | { status: "insufficient_balance"; required: number }
  | { status: "lawyer_unavailable" }
  | { status: "payment_pending" };

export interface LegalKartApi {
  readonly isPreview: boolean;
  getServices(): Promise<Service[]>;
  getNavMenus(): Promise<NavMenu[]>;
  getFeaturedLawyers(limit: number): Promise<Lawyer[]>;
  searchLawyers(params: LawyerSearchParams, signal?: AbortSignal): Promise<LawyerPage>;
  getLawyer(slug: string): Promise<Lawyer | null>;
  getSearchCapabilities(): Promise<SearchCapabilities>;
  getReviews(limit: number): Promise<Review[]>;
  getPlatformStats(): Promise<PlatformStat[]>;
  getArticles(limit: number): Promise<Article[]>;
  getSession(): Promise<Session | null>;
  getConsultQuote(lawyerId: string, mode: ConsultMode, signal?: AbortSignal): Promise<ConsultQuote>;
  startConsultation(lawyerId: string, mode: ConsultMode): Promise<ConsultStartResult>;
}
