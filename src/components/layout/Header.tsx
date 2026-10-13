import Link from "next/link";
import { getApi } from "@/lib/api";
import { isAppRoute, site } from "@/config/site";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { NavDropdown } from "./NavDropdown";
import { MobileNav } from "./MobileNav";

const PRIMARY_LINKS = [
  { label: "Talk to Lawyer", href: "/consult?mode=call" },
  { label: "Instant Document Review", href: "/services/ai-document-review" },
];
const SECONDARY_LINKS = [
  { label: "Blogs", href: site.routes.blogs },
  { label: "Check Challans", href: site.routes.challans },
];

const linkClass =
  "inline-flex h-10 items-center rounded-full px-3 text-[15px] font-medium text-ink-800 transition-colors hover:bg-ink-50 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600";

export async function Header() {
  const menus = await getApi().getNavMenus();
  const hasApp = Boolean(site.apps.playStore || site.apps.appStore);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="hidden border-b border-ink-100 bg-ink-50/60 md:block">
        <div className="container flex h-9 items-center justify-end gap-6 text-[13px] text-ink-600">
          <a href={site.support.phoneHref} className="inline-flex items-center gap-1.5 hover:text-ink">
            <Icon name="headset" className="h-4 w-4" />
            {site.support.hours} support · {site.support.phone}
          </a>
          {hasApp ? (
            <a href="#get-the-app" className="inline-flex items-center gap-1.5 font-medium text-brand-700 hover:text-brand-800">
              <Icon name="phone-mobile" className="h-4 w-4" /> Get the app
            </a>
          ) : null}
        </div>
      </div>
      <div className="container flex h-16 items-center gap-4 lg:h-[72px]">
        <Logo />
        <nav aria-label="Main" className="ml-auto hidden items-center gap-0.5 xl:flex">
          {PRIMARY_LINKS.map((l) => (
            <Link key={l.href} href={l.href} prefetch={isAppRoute(l.href) ? undefined : false} className={linkClass}>
              {l.label}
            </Link>
          ))}
          {menus.map((m, i) => (
            <NavDropdown key={m.id} menu={m} align={i === menus.length - 1 ? "right" : "left"} />
          ))}
          {SECONDARY_LINKS.map((l) => (
            <Link key={l.href} href={l.href} prefetch={isAppRoute(l.href) ? undefined : false} className={linkClass}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 xl:ml-3">
          <Link href={site.routes.consult} className={buttonClass("primary", "sm", "hidden sm:inline-flex")}>
            Find a lawyer
          </Link>
          <Link
            href={site.routes.account}
            prefetch={false}
            aria-label="My account"
            className="hidden h-10 w-10 items-center justify-center rounded-full ring-1 ring-inset ring-ink-200 hover:bg-ink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 xl:inline-flex"
          >
            <Icon name="user" className="h-5 w-5" />
          </Link>
          <MobileNav menus={menus} links={[...PRIMARY_LINKS, ...SECONDARY_LINKS]} />
        </div>
      </div>
    </header>
  );
}
