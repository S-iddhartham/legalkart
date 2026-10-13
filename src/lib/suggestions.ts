import type { Option, Service } from "./api/types";
import type { Suggestion } from "@/components/home/HeroSearch";

/** Search suggestions from real categories: lawyer specialties + service catalogue. */
export function buildSuggestions(specialties: Option[], services: Service[]): Suggestion[] {
  return [
    ...specialties.map((s) => ({
      label: `${s.label} lawyers`,
      href: `/consult?specialty=${encodeURIComponent(s.value)}`,
      kind: "Lawyers" as const,
      terms: `${s.label} ${s.value} lawyer advocate`.toLowerCase(),
    })),
    ...services.map((s) => ({
      label: s.name,
      href: s.href,
      kind: "Service" as const,
      terms: [s.name, s.summary, ...(s.keywords ?? [])].join(" ").toLowerCase(),
    })),
  ];
}

/** Popular searches, each kept only if a matching specialty or service exists. */
const POPULAR: { label: string; specialty?: string; service?: string }[] = [
  { label: "Property disputes", specialty: "property" },
  { label: "Rental agreement", service: "property-documents" },
  { label: "Family matters", specialty: "family" },
  { label: "Company registration", service: "company-formation" },
];

export function buildPopular(specialties: Option[], services: Service[]): Suggestion[] {
  return POPULAR.flatMap((p): Suggestion[] => {
    if (p.specialty && specialties.some((s) => s.value === p.specialty))
      return [{ label: p.label, href: `/consult?specialty=${p.specialty}`, kind: "Lawyers", terms: "" }];
    const svc = p.service && services.find((s) => s.slug === p.service);
    return svc ? [{ label: p.label, href: svc.href, kind: "Service", terms: "" }] : [];
  });
}
