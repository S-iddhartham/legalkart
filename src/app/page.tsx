import type { Metadata } from "next";
import { getApi } from "@/lib/api";
import { buildPopular, buildSuggestions } from "@/lib/suggestions";
import { HOME_FAQ } from "@/content/faq";
import { site } from "@/config/site";
import { Hero } from "@/components/home/Hero";
import { ServicesSection } from "@/components/home/ServicesSection";
import { FeaturedLawyers } from "@/components/home/FeaturedLawyers";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TrustSection } from "@/components/home/TrustSection";
import { Reviews } from "@/components/home/Reviews";
import { Resources } from "@/components/home/Resources";
import { AppPromo } from "@/components/home/AppPromo";
import { Section, SectionHeading } from "@/components/ui/Section";
import { FaqList, faqJsonLd } from "@/components/ui/FaqList";

export const metadata: Metadata = {
  title: { absolute: "LegalKart — Talk to Verified Lawyers Online, Document Review & Legal Services" },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: { title: "LegalKart — Legal help, without the guesswork", description: site.description, url: "/" },
};

export const revalidate = 300;

/** Settles a read so one failing endpoint degrades its section instead of the page. */
async function settle<T>(p: Promise<T>, fallback: T): Promise<{ data: T; failed: boolean }> {
  try {
    return { data: await p, failed: false };
  } catch {
    return { data: fallback, failed: true };
  }
}

export default async function HomePage() {
  const api = getApi();
  const [services, caps, featured, reviews, stats, articles] = await Promise.all([
    settle(api.getServices(), []),
    settle(api.getSearchCapabilities(), null),
    settle(api.getFeaturedLawyers(6), []),
    settle(api.getReviews(6), []),
    settle(api.getPlatformStats(), []),
    settle(api.getArticles(6), []),
  ]);
  const specialties = caps.data?.specialties ?? [];
  const specialtyLabels = Object.fromEntries(specialties.map((s) => [s.value, s.label]));

  return (
    <>
      <Hero
        services={services.data}
        available={featured.data.filter((l) => l.availability === "online")}
        stats={stats.data}
        suggestions={buildSuggestions(specialties, services.data)}
        popular={buildPopular(specialties, services.data)}
        specialtyLabels={specialtyLabels}
      />
      <ServicesSection services={services.data} />
      <FeaturedLawyers lawyers={featured.data} specialtyLabels={specialtyLabels} error={featured.failed} />
      <HowItWorks services={services.data} />
      <TrustSection stats={stats.data} />
      <Reviews reviews={reviews.data} />
      <Section id="faq" labelledBy="faq-title">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading
            id="faq-title"
            eyebrow="FAQ"
            title="Questions, answered"
            intro="Still unsure? Our support team can help you choose the right service."
          />
          <FaqList items={HOME_FAQ} />
        </div>
      </Section>
      <Resources articles={articles.data} specialties={specialties} services={services.data} />
      <AppPromo />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(HOME_FAQ)) }} />
    </>
  );
}
