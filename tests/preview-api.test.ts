import { describe, expect, it } from "vitest";
import { createPreviewApi } from "@/lib/api/preview";
import { lawyerRate } from "@/lib/pricing";

const api = createPreviewApi();

describe("preview API", () => {
  it("never returns social proof it does not have", async () => {
    expect(await api.getReviews(10)).toEqual([]);
    expect(await api.getPlatformStats()).toEqual([]);
    expect(await api.getArticles(10)).toEqual([]);
  });

  it("has no session, so consults stop at sign-in", async () => {
    expect(await api.getSession()).toBeNull();
    await expect(api.startConsultation("l1", "chat")).rejects.toThrow();
  });

  it("filters by mode and max rate using the effective rate", async () => {
    const page = await api.searchLawyers({ mode: "call", maxRate: 35 });
    expect(page.items.length).toBeGreaterThan(0);
    for (const l of page.items) expect(lawyerRate(l, "call")!.perMin).toBeLessThanOrEqual(35);
  });

  it("sorts by price ascending", async () => {
    const { items } = await api.searchLawyers({ mode: "chat", sort: "price_asc" });
    const rates = items.map((l) => lawyerRate(l, "chat")!.perMin);
    expect(rates).toEqual([...rates].sort((a, b) => a - b));
  });

  it("paginates stably", async () => {
    const p1 = await api.searchLawyers({ page: 1 });
    const p2 = await api.searchLawyers({ page: 2 });
    expect(p1.total).toBe(p2.total);
    const ids = new Set([...p1.items, ...p2.items].map((l) => l.id));
    expect(ids.size).toBe(p1.items.length + p2.items.length);
  });
});
