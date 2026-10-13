"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NavMenu } from "@/lib/api/types";
import { isAppRoute, site } from "@/config/site";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";

export function MobileNav({ menus, links }: { menus: NavMenu[]; links: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("a,button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("a,button");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={toggle}
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-ink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 xl:hidden"
      >
        <Icon name="menu" className="h-6 w-6" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-[60] xl:hidden" role="dialog" aria-modal="true" aria-label="Site menu">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div
            ref={panel}
            className="absolute inset-y-0 right-0 flex w-[min(24rem,100%)] flex-col bg-white shadow-lift"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="flex h-16 items-center justify-between border-b border-ink-100 px-4">
              <span className="font-display text-lg font-bold tracking-tight text-ink">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => {
                  setOpen(false);
                  toggle.current?.focus();
                }}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"
              >
                <Icon name="close" className="h-6 w-6" />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-2 py-3">
              <ul>
                {links.slice(0, 2).map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} prefetch={isAppRoute(l.href) ? undefined : false} className="flex min-h-12 items-center rounded-xl px-3 text-base font-medium text-ink hover:bg-ink-50">
                      {l.label}
                    </Link>
                  </li>
                ))}
                {menus.map((m) => {
                  const isOpen = expanded === m.id;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setExpanded(isOpen ? null : m.id)}
                        className="flex min-h-12 w-full items-center justify-between rounded-xl px-3 text-left text-base font-medium text-ink hover:bg-ink-50"
                      >
                        {m.label}
                        <Icon name="chevron-down" className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen ? (
                        <ul className="mb-2 ml-3 border-l border-ink-100 pl-2">
                          {m.items.map((i) => (
                            <li key={i.href}>
                              <Link href={i.href} className="flex min-h-11 items-center rounded-lg px-3 text-[15px] text-ink-700 hover:bg-ink-50">
                                {i.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
                {links.slice(2).map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} prefetch={isAppRoute(l.href) ? undefined : false} className="flex min-h-12 items-center rounded-xl px-3 text-base font-medium text-ink hover:bg-ink-50">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="space-y-2 border-t border-ink-100 p-4">
              <Link href={site.routes.consult} className={buttonClass("primary", "lg", "w-full")}>
                Find a lawyer
              </Link>
              <Link href={site.routes.account} prefetch={false} className={buttonClass("secondary", "lg", "w-full")}>
                <Icon name="user" className="h-5 w-5" /> My account
              </Link>
              <a href={site.support.phoneHref} className="block pt-2 text-center text-sm text-ink-600">
                {site.support.hours} support · {site.support.phone}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
