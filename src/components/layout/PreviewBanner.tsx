import { getApi } from "@/lib/api";

/** Shown whenever the site runs on bundled preview data instead of the live API. */
export function PreviewBanner() {
  if (!getApi().isPreview) return null;
  return (
    <div role="note" className="bg-warn-50 text-warn-700">
      <p className="container py-2 text-center text-[13px] font-medium">
        Preview data — lawyers and prices shown are placeholders until the LegalKart API is connected.
      </p>
    </div>
  );
}
