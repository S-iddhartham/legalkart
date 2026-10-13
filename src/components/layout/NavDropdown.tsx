"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { NavMenu } from "@/lib/api/types";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/**
 * Disclosure-style dropdown: click/Enter/Space toggles, hover opens on
 * pointer devices (with a close delay so the gap can be crossed), ArrowDown
 * moves into the panel, Escape closes and restores focus.
 */
export function NavDropdown({ menu, align = "left" }: { menu: NavMenu; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const items = () => Array.from(root.current?.querySelectorAll<HTMLAnchorElement>("[data-menu-item]") ?? []);

  function onKeyDown(e: React.KeyboardEvent) {
    const list = items();
    const idx = list.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
      trigger.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      requestAnimationFrame(() => items()[Math.min(idx + 1, items().length - 1)]?.focus());
    } else if (e.key === "ArrowUp" && open) {
      e.preventDefault();
      if (idx <= 0) trigger.current?.focus();
      else list[idx - 1]?.focus();
    }
  }

  const hoverOpen = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hoverClose = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };

  return (
    <div
      ref={root}
      className="relative"
      onPointerEnter={hoverOpen}
      onPointerLeave={hoverClose}
      onKeyDown={onKeyDown}
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex h-10 items-center gap-1 rounded-full px-3 text-[15px] font-medium text-ink-800 transition-colors hover:bg-ink-50 hover:text-ink",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600",
          open && "bg-ink-50 text-ink",
        )}
      >
        {menu.label}
        <Icon name="chevron-down" className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      <div
        id={panelId}
        hidden={!open}
        className={cn(
          "absolute top-full z-50 pt-2",
          align === "right" ? "right-0" : "left-0",
        )}
      >
        <ul className="w-[min(20rem,calc(100vw-2rem))] animate-fade-in rounded-2xl border border-ink-100 bg-white p-2 shadow-menu">
          {menu.items.map((item) => (
            <li key={item.href}>
              <Link
                data-menu-item
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2.5 outline-none hover:bg-ink-50 focus-visible:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-600"
              >
                <span className="block text-[15px] font-medium text-ink">{item.label}</span>
                {item.description ? <span className="block text-sm text-ink-500">{item.description}</span> : null}
              </Link>
            </li>
          ))}
          {menu.viewAll ? (
            <li className="mt-1 border-t border-ink-100 pt-1">
              <Link
                data-menu-item
                href={menu.viewAll.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-700 outline-none hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-600"
              >
                {menu.viewAll.label}
                <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
