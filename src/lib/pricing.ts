import type { ConsultMode, Lawyer, RateCard } from "./api/types";

export interface DisplayRate {
  /** Rate the customer pays now, per minute. */
  perMin: number;
  /** Standard rate, shown struck through when a lower custom rate applies. */
  originalPerMin?: number;
  isCustom: boolean;
}

/**
 * Applies the custom-rate rule: an active, unexpired custom rate replaces the
 * default. The default is shown struck through only when the custom rate is
 * lower — a higher custom rate is shown plainly, never as a "discount".
 */
export function resolveRate(card: RateCard | undefined, now: Date = new Date()): DisplayRate | null {
  if (!card) return null;
  const c = card.custom;
  const customValid =
    c != null && c.active && c.perMin > 0 && (!c.validUntil || new Date(c.validUntil).getTime() > now.getTime());
  if (!customValid) return { perMin: card.defaultPerMin, isCustom: false };
  return {
    perMin: c.perMin,
    originalPerMin: c.perMin < card.defaultPerMin ? card.defaultPerMin : undefined,
    isCustom: true,
  };
}

export function lawyerRate(lawyer: Lawyer, mode: ConsultMode, now?: Date): DisplayRate | null {
  if (!lawyer.modes.includes(mode)) return null;
  return resolveRate(lawyer.rates[mode], now);
}

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function formatINR(amount: number): string {
  return inr.format(amount);
}

/** Whole minutes the balance covers at the given rate. */
export function minutesAffordable(balance: number, perMin: number): number {
  if (perMin <= 0) return 0;
  return Math.floor(balance / perMin);
}
