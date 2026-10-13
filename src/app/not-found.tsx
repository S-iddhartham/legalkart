import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center py-24 text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">We couldn’t find that page</h1>
      <p className="mt-3 max-w-md text-ink-600">The link may be out of date. You can still find a lawyer or browse our services.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/consult" className={buttonClass("primary", "md")}>
          Find a lawyer
        </Link>
        <Link href="/#services" className={buttonClass("secondary", "md")}>
          Browse services
        </Link>
      </div>
    </div>
  );
}
