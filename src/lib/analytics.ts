/**
 * Funnel instrumentation. Events are pushed to `window.dataLayer` (GTM) so the
 * existing analytics stack can segment by device, source and visitor type.
 *
 * Purchases are counted only from backend-confirmed events — never from clicks.
 */
export type FunnelEvent =
  | "search_submitted"
  | "search_suggestion_selected"
  | "service_card_selected"
  | "lawyer_profile_viewed"
  | "consult_mode_selected"
  | "consult_quote_shown"
  | "consult_recharge_started"
  | "consult_started"
  | "consult_blocked"
  | "filter_changed"
  | "app_store_clicked";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: FunnelEvent, props: Record<string, string | number | boolean | undefined> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...props });
}
