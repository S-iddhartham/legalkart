import { describe, expect, it } from "vitest";
import { formatINR, lawyerRate, minutesAffordable, resolveRate } from "@/lib/pricing";
import type { Lawyer } from "@/lib/api/types";

const NOW = new Date("2026-10-13T12:00:00Z");

describe("resolveRate (custom-rate rule)", () => {
  it("uses the default rate when no custom rate exists", () => {
    expect(resolveRate({ defaultPerMin: 40 }, NOW)).toEqual({ perMin: 40, isCustom: false });
  });

  it("shows a lower active custom rate with the default struck through", () => {
    expect(resolveRate({ defaultPerMin: 40, custom: { perMin: 30, active: true } }, NOW)).toEqual({
      perMin: 30,
      originalPerMin: 40,
      isCustom: true,
    });
  });

  it("shows a higher custom rate plainly, never as a discount", () => {
    const r = resolveRate({ defaultPerMin: 40, custom: { perMin: 50, active: true } }, NOW);
    expect(r).toEqual({ perMin: 50, originalPerMin: undefined, isCustom: true });
  });

  it("ignores inactive custom rates", () => {
    expect(resolveRate({ defaultPerMin: 40, custom: { perMin: 30, active: false } }, NOW)?.perMin).toBe(40);
  });

  it("ignores expired custom rates", () => {
    const card = { defaultPerMin: 40, custom: { perMin: 30, active: true, validUntil: "2026-10-13T11:59:59Z" } };
    expect(resolveRate(card, NOW)?.perMin).toBe(40);
  });

  it("honours an unexpired custom rate", () => {
    const card = { defaultPerMin: 40, custom: { perMin: 30, active: true, validUntil: "2026-10-14T00:00:00Z" } };
    expect(resolveRate(card, NOW)?.perMin).toBe(30);
  });

  it("ignores a zero/negative custom rate", () => {
    expect(resolveRate({ defaultPerMin: 40, custom: { perMin: 0, active: true } }, NOW)?.perMin).toBe(40);
  });
});

describe("lawyerRate", () => {
  const lawyer: Lawyer = { id: "1", slug: "a", name: "A", specialties: [], languages: [], modes: ["call"], rates: { call: { defaultPerMin: 30 }, chat: { defaultPerMin: 20 } } };
  it("returns null for a mode the lawyer doesn't offer", () => {
    expect(lawyerRate(lawyer, "chat")).toBeNull();
    expect(lawyerRate(lawyer, "call")?.perMin).toBe(30);
  });
});

describe("helpers", () => {
  it("formats INR without decimals", () => {
    expect(formatINR(1299)).toBe("₹1,299");
  });
  it("computes affordable whole minutes", () => {
    expect(minutesAffordable(299, 30)).toBe(9);
    expect(minutesAffordable(100, 0)).toBe(0);
  });
});
