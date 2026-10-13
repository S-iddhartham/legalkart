import Link from "next/link";
import { site } from "@/config/site";

/** LegalKart wordmark (text-based, matches the existing brand lockup). */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" aria-label={`${site.name} home`} className="group inline-flex flex-col leading-none">
      <span className="font-display text-[1.45rem] font-extrabold uppercase tracking-tight text-ink sm:text-[1.6rem]">
        Legalkart<sup className="ml-0.5 text-[0.55em] font-semibold">®</sup>
      </span>
      {!compact ? <span className="mt-1 hidden text-xs font-medium text-ink-500 sm:block">{site.tagline}</span> : null}
    </Link>
  );
}
