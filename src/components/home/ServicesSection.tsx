import type { Service, ServiceGroup } from "@/lib/api/types";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ServiceCard } from "./ServiceCard";

const GROUPS: { id: ServiceGroup; title: string }[] = [
  { id: "documents", title: "Documents" },
  { id: "business", title: "Business & property" },
  { id: "other", title: "More from LegalKart" },
];

export function ServicesSection({ services }: { services: Service[] }) {
  const consult = services.filter((s) => s.group === "consultation");
  return (
    <Section id="services" labelledBy="services-title">
      <SectionHeading
        id="services-title"
        eyebrow="All services"
        title="What do you need help with?"
        intro="Talk to a lawyer, get a document checked, or complete a legal formality — each with clear pricing."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {consult.map((s) => (
          <ServiceCard key={s.slug} service={s} featured />
        ))}
      </div>
      {GROUPS.map((g) => {
        const items = services.filter((s) => s.group === g.id);
        if (!items.length) return null;
        return (
          <div key={g.id} className="mt-10 sm:mt-12">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-ink-500">{g.title}</h3>
            <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((s) => (
                <ServiceCard key={s.slug} service={s} />
              ))}
            </div>
          </div>
        );
      })}
    </Section>
  );
}
