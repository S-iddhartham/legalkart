/**
 * Preview data source, used only when NEXT_PUBLIC_API_BASE_URL is unset.
 *
 * - Service names, starting prices and lawyer cards mirror what the current
 *   LegalKart site shows; they are NOT a source of truth for production.
 * - Reviews, platform statistics and articles deliberately return nothing so
 *   the site never publishes made-up social proof. Those sections hide
 *   themselves until the real API supplies data.
 * - There is no session in preview, so Call/Chat stops at the sign-in step.
 */
import type {
  ConsultMode,
  Lawyer,
  LawyerPage,
  LawyerSearchParams,
  LegalKartApi,
  NavMenu,
  SearchCapabilities,
  Service,
} from "./types";
import { lawyerRate } from "../pricing";

const PAGE_SIZE = 9;

const SERVICES: Service[] = [
  {
    slug: "talk-to-lawyer",
    name: "Talk to a Lawyer",
    summary: "One-on-one phone consultation with an advocate of your choice, in your language.",
    group: "consultation",
    icon: "phone",
    price: { from: 31, unit: "min" },
    href: "/consult?mode=call",
    cta: "Find a lawyer to call",
    keywords: ["call", "phone", "consultation", "advice"],
  },
  {
    slug: "chat-with-lawyer",
    name: "Chat with a Lawyer",
    summary: "Written consultation — buy credits, pick your advocate and keep the advice in writing.",
    group: "consultation",
    icon: "chat",
    price: { from: 22, unit: "min" },
    href: "/consult?mode=chat",
    cta: "Find a lawyer to chat",
    badge: "New",
    keywords: ["chat", "message", "text", "credits"],
  },
  {
    slug: "ai-document-review",
    name: "AI Document Review",
    summary: "Upload a legal document and get an instant AI read-out of risks and missing clauses.",
    group: "documents",
    icon: "bolt",
    price: null,
    href: "/services/ai-document-review",
    cta: "Review a document",
    keywords: ["instant document review", "ai", "contract check"],
  },
  {
    slug: "lawyer-document-review",
    name: "Lawyer Document Review",
    summary: "A practising advocate reviews your document and sends a written report.",
    group: "documents",
    icon: "doc-user",
    price: null,
    href: "/services/lawyer-document-review",
    cta: "Get expert review",
    keywords: ["expert review", "vetting", "legal opinion"],
  },
  {
    slug: "document-review-consult",
    name: "Document Review & Consult",
    summary: "Have your document reviewed, then discuss the findings with the reviewing lawyer.",
    group: "documents",
    icon: "doc-check",
    price: null,
    href: "/services/document-review-consult",
    cta: "View details",
  },
  {
    slug: "agreements-contracts",
    name: "Agreements & Contracts",
    summary: "Lawyer-drafted agreements for business, employment and personal use.",
    group: "documents",
    icon: "contract",
    price: null,
    href: "/services/agreements-contracts",
    cta: "Browse agreements",
    keywords: ["rental agreement", "nda", "contract drafting"],
  },
  {
    slug: "property-documents",
    name: "Property Documents",
    summary: "Drafting and verification of the documents that protect a property transaction.",
    group: "documents",
    icon: "home",
    price: null,
    href: "/services/property-documents",
    cta: "Browse documents",
    keywords: ["rental agreement", "sale deed", "property verification"],
  },
  {
    slug: "startup-documents",
    name: "Startup Documents",
    summary: "Founder, investor and employee documents prepared for early-stage companies.",
    group: "documents",
    icon: "rocket",
    price: null,
    href: "/services/startup-documents",
    cta: "Browse documents",
    keywords: ["founders agreement", "esop", "shareholders agreement"],
  },
  {
    slug: "company-formation",
    name: "Company Formation",
    summary: "Incorporate a private limited company, LLP or other entity with guided filings.",
    group: "business",
    icon: "building",
    price: null,
    href: "/services/company-formation",
    cta: "Start registration",
    keywords: ["company registration", "llp", "incorporation"],
  },
  {
    slug: "intellectual-property",
    name: "Intellectual Property",
    summary: "Trademark, copyright and related filings to protect your brand and work.",
    group: "business",
    icon: "bulb",
    price: null,
    href: "/services/intellectual-property",
    cta: "Protect your IP",
    keywords: ["trademark", "copyright", "patent"],
  },
  {
    slug: "registrations-licences",
    name: "Registrations & Licences",
    summary: "Statutory registrations and licences your business needs to operate.",
    group: "business",
    icon: "badge",
    price: null,
    href: "/services/registrations-licences",
    cta: "View registrations",
    keywords: ["gst", "msme", "fssai", "licence"],
  },
  {
    slug: "property-products",
    name: "Property Services",
    summary: "Legal support for buying, selling, renting and inheriting property.",
    group: "business",
    icon: "key",
    price: null,
    href: "/services/property-products",
    cta: "Explore property help",
    keywords: ["property dispute", "title check", "rera"],
  },
  {
    slug: "raise-legal-query",
    name: "Raise a Legal Query",
    summary: "Describe your issue and get routed to the right service or lawyer.",
    group: "other",
    icon: "question",
    price: null,
    href: "/services/raise-legal-query",
    cta: "Raise a query",
  },
  {
    slug: "check-challans",
    name: "Check Challans",
    summary: "Look up pending traffic challans for your vehicle.",
    group: "other",
    icon: "car",
    price: null,
    href: "/check-challans",
    cta: "Check challans",
    keywords: ["traffic", "e-challan", "fine"],
  },
];

const NAV: NavMenu[] = [
  {
    id: "property",
    label: "Property",
    items: [
      { label: "Property Documents", href: "/services/property-documents", description: "Drafting and verification" },
      { label: "Property Services", href: "/services/property-products", description: "Buy, sell, rent, inherit" },
      { label: "Talk to a property lawyer", href: "/consult?specialty=property", description: "Property & RERA advocates" },
    ],
  },
  {
    id: "document",
    label: "Document",
    items: [
      { label: "AI Document Review", href: "/services/ai-document-review", description: "Instant risk read-out" },
      { label: "Lawyer Document Review", href: "/services/lawyer-document-review", description: "Written expert report" },
      { label: "Document Review & Consult", href: "/services/document-review-consult", description: "Review plus discussion" },
      { label: "Agreements & Contracts", href: "/services/agreements-contracts", description: "Lawyer-drafted templates" },
    ],
  },
  {
    id: "startup",
    label: "Startup",
    items: [
      { label: "Company Formation", href: "/services/company-formation", description: "Pvt Ltd, LLP and more" },
      { label: "Startup Documents", href: "/services/startup-documents", description: "Founder & investor docs" },
      { label: "Intellectual Property", href: "/services/intellectual-property", description: "Trademark & copyright" },
      { label: "Registrations & Licences", href: "/services/registrations-licences", description: "Statutory compliance" },
    ],
  },
];

const SPECIALTIES = [
  { value: "property", label: "Property & RERA" },
  { value: "family", label: "Family & Matrimonial" },
  { value: "criminal", label: "Criminal" },
  { value: "consumer", label: "Consumer & Cheque Bounce" },
  { value: "corporate", label: "Corporate & Startup" },
  { value: "employment", label: "Employment & Labour" },
  { value: "civil", label: "Civil" },
  { value: "tax", label: "Tax" },
  { value: "cyber", label: "Cyber Crime" },
];

const L = (l: Omit<Lawyer, "verified" | "modes"> & Partial<Pick<Lawyer, "modes">>): Lawyer => ({
  verified: true,
  modes: ["call", "chat"],
  ...l,
});

const LAWYERS: Lawyer[] = [
  L({ id: "l1", slug: "rohit-sharma", name: "Adv. Rohit Sharma", specialties: ["property", "civil"], experienceYears: 12, languages: ["Hindi", "English"], city: "Delhi", rating: { average: 4.8, count: 412 }, availability: "online", rates: { call: { defaultPerMin: 45 }, chat: { defaultPerMin: 45 } }, consultationsCount: 2010 }),
  L({ id: "l2", slug: "priya-nair", name: "Adv. Priya Nair", specialties: ["family"], experienceYears: 8, languages: ["Hindi", "English", "Malayalam"], city: "Kochi", rating: { average: 4.9, count: 268 }, availability: "online", rates: { call: { defaultPerMin: 35, custom: { perMin: 30, active: true } }, chat: { defaultPerMin: 30 } }, consultationsCount: 1240 }),
  L({ id: "l3", slug: "aditya-rao", name: "Adv. Aditya Rao", specialties: ["criminal"], experienceYears: 15, languages: ["Hindi", "English", "Telugu"], city: "Hyderabad", rating: { average: 4.9, count: 190 }, availability: "busy", rates: { call: { defaultPerMin: 55 }, chat: { defaultPerMin: 55 } }, consultationsCount: 980 }),
  L({ id: "l4", slug: "sneha-kulkarni", name: "Adv. Sneha Kulkarni", specialties: ["consumer", "civil"], experienceYears: 6, languages: ["Marathi", "Hindi", "English"], city: "Pune", rating: { average: 4.7, count: 151 }, availability: "online", rates: { call: { defaultPerMin: 31 }, chat: { defaultPerMin: 22 } }, consultationsCount: 760 }),
  L({ id: "l5", slug: "imran-khan", name: "Adv. Imran Khan", specialties: ["corporate", "tax"], experienceYears: 10, languages: ["Hindi", "English"], city: "Mumbai", rating: { average: 4.8, count: 233 }, availability: "offline", rates: { call: { defaultPerMin: 50 }, chat: { defaultPerMin: 40 } }, consultationsCount: 1430 }),
  L({ id: "l6", slug: "meera-iyer", name: "Adv. Meera Iyer", specialties: ["employment"], experienceYears: 9, languages: ["Tamil", "Hindi", "English"], city: "Chennai", rating: { average: 4.9, count: 204 }, availability: "online", rates: { call: { defaultPerMin: 40, custom: { perMin: 35, active: true } }, chat: { defaultPerMin: 35 } }, consultationsCount: 1105 }),
  L({ id: "l7", slug: "arjun-mehta", name: "Adv. Arjun Mehta", specialties: ["cyber", "criminal"], experienceYears: 7, languages: ["Gujarati", "Hindi", "English"], city: "Ahmedabad", rating: { average: 4.6, count: 88 }, availability: "online", rates: { call: { defaultPerMin: 38 } }, modes: ["call"] }),
  L({ id: "l8", slug: "kavita-singh", name: "Adv. Kavita Singh", specialties: ["family", "civil"], experienceYears: 14, languages: ["Hindi", "Punjabi", "English"], city: "Chandigarh", availability: "offline", rates: { call: { defaultPerMin: 48 }, chat: { defaultPerMin: 42 } } }),
  L({ id: "l9", slug: "subhajit-das", name: "Adv. Subhajit Das", specialties: ["property", "tax"], experienceYears: 11, languages: ["Bengali", "Hindi", "English"], city: "Kolkata", rating: { average: 4.7, count: 132 }, availability: "online", rates: { call: { defaultPerMin: 42 }, chat: { defaultPerMin: 36, custom: { perMin: 40, active: false } } } }),
  L({ id: "l10", slug: "nikhil-reddy", name: "Adv. Nikhil Reddy", specialties: ["corporate"], experienceYears: 5, languages: ["Telugu", "English"], city: "Bengaluru", rating: { average: 4.5, count: 41 }, availability: "busy", rates: { call: { defaultPerMin: 33 }, chat: { defaultPerMin: 25 } } }),
];

const CAPABILITIES: SearchCapabilities = {
  specialties: SPECIALTIES,
  languages: ["Hindi", "English", "Bengali", "Tamil", "Telugu", "Marathi", "Malayalam", "Gujarati", "Punjabi"].map((l) => ({
    value: l,
    label: l,
  })),
  sorts: [
    { value: "relevance", label: "Most relevant" },
    { value: "rating", label: "Highest rated" },
    { value: "experience", label: "Most experienced" },
    { value: "price_asc", label: "Price: low to high" },
    { value: "price_desc", label: "Price: high to low" },
  ],
  filters: { mode: true, language: true, experience: true, rating: true, price: true, availability: true },
  experienceOptions: [3, 5, 10, 15],
  ratingOptions: [4, 4.5],
  maxRateOptions: [30, 40, 50],
};

function rateFor(l: Lawyer, mode: ConsultMode | undefined): number {
  const rates = (mode ? [mode] : l.modes).map((m) => lawyerRate(l, m)?.perMin ?? Infinity);
  return Math.min(...rates);
}

function search(p: LawyerSearchParams): LawyerPage {
  const q = p.q?.toLowerCase();
  const specialtyLabel = (v: string) => SPECIALTIES.find((s) => s.value === v)?.label.toLowerCase() ?? v;
  let items = LAWYERS.filter((l) => {
    if (q && !(l.name.toLowerCase().includes(q) || l.specialties.some((s) => specialtyLabel(s).includes(q) || s.includes(q)) || l.city?.toLowerCase().includes(q)))
      return false;
    if (p.specialty && !l.specialties.includes(p.specialty)) return false;
    if (p.language && !l.languages.includes(p.language)) return false;
    if (p.mode && !l.modes.includes(p.mode)) return false;
    if (p.minExperience && (l.experienceYears ?? 0) < p.minExperience) return false;
    if (p.minRating && (l.rating?.average ?? 0) < p.minRating) return false;
    if (p.maxRate && rateFor(l, p.mode) > p.maxRate) return false;
    if (p.available && l.availability !== "online") return false;
    return true;
  });
  const by: Record<string, (a: Lawyer, b: Lawyer) => number> = {
    rating: (a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0),
    experience: (a, b) => (b.experienceYears ?? 0) - (a.experienceYears ?? 0),
    price_asc: (a, b) => rateFor(a, p.mode) - rateFor(b, p.mode),
    price_desc: (a, b) => rateFor(b, p.mode) - rateFor(a, p.mode),
  };
  if (p.sort && by[p.sort]) items = [...items].sort(by[p.sort]);
  const page = p.page ?? 1;
  return { items: items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: items.length, page, pageSize: PAGE_SIZE };
}

export function createPreviewApi(): LegalKartApi {
  return {
    isPreview: true,
    getServices: async () => SERVICES,
    getNavMenus: async () => NAV,
    getFeaturedLawyers: async (limit) => LAWYERS.filter((l) => l.availability === "online").slice(0, limit),
    searchLawyers: async (params) => search(params),
    getLawyer: async (slug) => LAWYERS.find((l) => l.slug === slug) ?? null,
    getSearchCapabilities: async () => CAPABILITIES,
    getReviews: async () => [],
    getPlatformStats: async () => [],
    getArticles: async () => [],
    getSession: async () => null,
    getConsultQuote: async () => {
      throw new Error("Sign-in is required before a quote can be issued.");
    },
    startConsultation: async () => {
      throw new Error("Consultations cannot be started in preview mode.");
    },
  };
}
