import type { MetadataRoute } from "next";
import { getApi } from "@/lib/api";
import { site } from "@/config/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const api = getApi();
  const [services, caps, lawyers] = await Promise.all([
    api.getServices().catch(() => []),
    api.getSearchCapabilities().catch(() => null),
    // First pages of the directory; the API's own sitemap should cover the full set.
    api.searchLawyers({}).catch(() => null),
  ]);
  const u = (path: string) => `${site.url}${path}`;
  return [
    { url: u("/"), changeFrequency: "daily", priority: 1 },
    { url: u("/consult"), changeFrequency: "hourly", priority: 0.9 },
    ...(caps?.specialties ?? []).map((s) => ({ url: u(`/consult?specialty=${s.value}`), changeFrequency: "daily" as const, priority: 0.7 })),
    ...services.filter((s) => s.href.startsWith("/services/")).map((s) => ({ url: u(s.href), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...(lawyers?.items ?? []).map((l) => ({ url: u(site.routes.lawyer(l.slug)), changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
