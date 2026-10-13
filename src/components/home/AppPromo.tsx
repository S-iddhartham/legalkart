"use client";

import { site } from "@/config/site";
import { track } from "@/lib/analytics";
import { Icon } from "@/components/ui/Icon";

const BENEFITS = [
  "Take calls and chats with your lawyer from your phone",
  "Keep your consultation history in one place",
  "Check and top up your wallet on the go",
];

export function AppPromo() {
  const stores = [
    { label: "Get it on Google Play", href: site.apps.playStore, id: "play" },
    { label: "Download on the App Store", href: site.apps.appStore, id: "ios" },
  ].filter((s) => s.href);

  return (
    <section id="get-the-app" aria-labelledby="app-title" className="py-16 sm:py-20">
      <div className="container">
        <div className="grid items-center gap-8 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white sm:p-12 ">
          <div>
            <h2 id="app-title" className="font-display text-[1.75rem] font-semibold leading-tight sm:text-4xl">
              LegalKart in your pocket
            </h2>
            <ul className="mt-6 space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3 text-[15px] text-brand-50 sm:text-base">
                  <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-white" /> {b}
                </li>
              ))}
            </ul>
            {stores.length ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {stores.map((s) => (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("app_store_clicked", { store: s.id })}
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 font-semibold text-ink hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <Icon name="phone-mobile" /> {s.label}
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-8 text-brand-100">Search “LegalKart” on Google Play or the App Store.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
