import type { Service } from "@/lib/api/types";
import { formatINR } from "@/lib/pricing";
import { Section, SectionHeading } from "@/components/ui/Section";

const STEPS = [
  { t: "Choose a service", d: "Call, chat, document review, or a legal product — pick what fits your situation." },
  { t: "Find the right lawyer or product", d: "Filter lawyers by specialisation, language and rate, or open the product page." },
  { t: "Review the price and pay", d: "See the exact rate or product price first. Pay securely or use your wallet balance." },
  { t: "Get your help", d: "Start the consultation, or receive the service you purchased with clear next steps." },
];

export function HowItWorks({ services }: { services: Service[] }) {
  const price = (slug: string) => {
    const p = services.find((s) => s.slug === slug)?.price;
    return p ? `From ${formatINR(p.from)}/min` : "View pricing";
  };
  const rows = [
    { name: "Talk to a Lawyer", best: "Urgent questions, talking it through", get: "Live phone consultation", price: price("talk-to-lawyer") },
    { name: "Chat with a Lawyer", best: "Advice you want to keep in writing", get: "Live written chat, documents and photos", price: price("chat-with-lawyer") },
    { name: "AI Document Review", best: "A quick first check of a document", get: "Instant automated read-out (not legal advice)", price: price("ai-document-review") },
    { name: "Lawyer Document Review", best: "Before signing something important", get: "Written report from an advocate", price: price("lawyer-document-review") },
  ];

  return (
    <Section id="how-it-works" labelledBy="how-title">
      <SectionHeading id="how-title" eyebrow="How LegalKart works" title="Four steps, no surprises" />
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.t} className="relative">
            <span className="font-display text-sm font-semibold text-brand-600">{String(i + 1).padStart(2, "0")}</span>
            <div className="mt-2 h-px w-full bg-ink-200" aria-hidden />
            <h3 className="mt-4 font-display text-lg font-semibold text-ink">{s.t}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-600">{s.d}</p>
          </li>
        ))}
      </ol>

      <div className="mt-14">
        <h3 className="font-display text-xl font-semibold text-ink">Which option is right for me?</h3>
        {/* Table on md+, stacked cards on mobile. */}
        <div className="mt-5 hidden overflow-hidden rounded-2xl border border-ink-100 md:block">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-ink-50 text-sm text-ink-600">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Service</th>
                <th scope="col" className="px-5 py-3 font-semibold">Best for</th>
                <th scope="col" className="px-5 py-3 font-semibold">What you get</th>
                <th scope="col" className="px-5 py-3 font-semibold">Pricing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((r) => (
                <tr key={r.name}>
                  <th scope="row" className="px-5 py-4 font-semibold text-ink">{r.name}</th>
                  <td className="px-5 py-4 text-ink-600">{r.best}</td>
                  <td className="px-5 py-4 text-ink-600">{r.get}</td>
                  <td className="px-5 py-4 font-medium text-ink">{r.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-5 space-y-3 md:hidden">
          {rows.map((r) => (
            <li key={r.name} className="rounded-2xl border border-ink-100 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="font-semibold text-ink">{r.name}</h4>
                <span className="shrink-0 text-sm font-medium text-ink">{r.price}</span>
              </div>
              <p className="mt-1 text-sm text-ink-600">{r.best}</p>
              <p className="mt-0.5 text-sm text-ink-500">{r.get}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
