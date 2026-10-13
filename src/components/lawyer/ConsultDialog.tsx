"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getApi } from "@/lib/api";
import type { ConsultMode, ConsultQuote, Lawyer } from "@/lib/api/types";
import { formatINR, minutesAffordable } from "@/lib/pricing";
import { loginUrl, site } from "@/config/site";
import { track } from "@/lib/analytics";
import { Button, buttonClass } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";

type Step =
  | { kind: "loading" }
  | { kind: "signin" }
  | { kind: "quote"; quote: ConsultQuote }
  | { kind: "starting"; quote: ConsultQuote }
  | { kind: "unavailable" }
  | { kind: "pending" }
  | { kind: "error"; message: string };

const MODE_LABEL: Record<ConsultMode, string> = { call: "call", chat: "chat" };

/**
 * Call/Chat gate. Order: session → backend quote → balance check → backend
 * start. The consultation only opens when the backend returns
 * `status: "started"` with a session URL; nothing here assumes success.
 */
export function ConsultDialog({
  lawyer,
  mode,
  returnPath,
  onClose,
}: {
  lawyer: Lawyer;
  mode: ConsultMode;
  /** Where to send the user back to after sign-in / recharge. */
  returnPath: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<Step>({ kind: "loading" });
  const resumeUrl = `${returnPath}${returnPath.includes("?") ? "&" : "?"}start=${mode}&lawyer=${lawyer.slug}`;

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setStep({ kind: "loading" });
      try {
        const api = getApi();
        const session = await api.getSession();
        if (signal?.aborted) return;
        if (!session) {
          setStep({ kind: "signin" });
          return;
        }
        const quote = await api.getConsultQuote(lawyer.id, mode, signal);
        if (signal?.aborted) return;
        if (!quote.lawyerAvailable) setStep({ kind: "unavailable" });
        else if (quote.pendingPayment) setStep({ kind: "pending" });
        else {
          setStep({ kind: "quote", quote });
          track("consult_quote_shown", {
            mode,
            lawyer: lawyer.id,
            rate: quote.ratePerMin,
            sufficient: quote.walletBalance >= quote.minimumBalance,
          });
        }
      } catch (e) {
        if (signal?.aborted) return;
        setStep({ kind: "error", message: e instanceof Error ? e.message : "Something went wrong." });
      }
    },
    [lawyer.id, mode],
  );

  useEffect(() => {
    ref.current?.showModal();
    const ac = new AbortController();
    void load(ac.signal);
    return () => ac.abort();
  }, [load]);

  async function start(quote: ConsultQuote) {
    setStep({ kind: "starting", quote });
    try {
      const res = await getApi().startConsultation(lawyer.id, mode);
      switch (res.status) {
        case "started":
          track("consult_started", { mode, lawyer: lawyer.id });
          window.location.assign(res.sessionUrl);
          return;
        case "insufficient_balance":
          track("consult_blocked", { reason: "balance", mode });
          setStep({ kind: "quote", quote: { ...quote, minimumBalance: res.required } });
          return;
        case "lawyer_unavailable":
          track("consult_blocked", { reason: "unavailable", mode });
          setStep({ kind: "unavailable" });
          return;
        case "payment_pending":
          track("consult_blocked", { reason: "payment_pending", mode });
          setStep({ kind: "pending" });
          return;
      }
    } catch (e) {
      setStep({ kind: "error", message: e instanceof Error ? e.message : "We couldn't start the consultation." });
    }
  }

  const similarHref = `${site.routes.consult}?${new URLSearchParams({
    ...(lawyer.specialties[0] ? { specialty: lawyer.specialties[0] } : {}),
    mode,
    available: "1",
  }).toString()}`;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      aria-labelledby="consult-title"
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-3xl bg-white p-0 text-ink shadow-lift backdrop:bg-ink/50"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">
              {mode === "call" ? "Phone consultation" : "Chat consultation"}
            </p>
            <h2 id="consult-title" className="mt-1 font-display text-xl font-semibold">
              {lawyer.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close"
            className="-mr-2 -mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="mt-5" aria-live="polite">
          {step.kind === "loading" ? (
            <div className="space-y-3" role="status" aria-label="Loading pricing">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-11 w-full rounded-full" />
            </div>
          ) : null}

          {step.kind === "signin" ? (
            <div>
              <p className="text-[15px] leading-relaxed text-ink-700">
                Sign in to see your wallet balance and the exact {MODE_LABEL[mode]} rate before you start. You’ll come
                straight back here afterwards.
              </p>
              <a href={loginUrl(resumeUrl)} className={buttonClass("primary", "lg", "mt-5 w-full")}>
                Sign in to continue
              </a>
            </div>
          ) : null}

          {step.kind === "quote" || step.kind === "starting" ? (
            <QuoteView
              quote={step.quote}
              mode={mode}
              busy={step.kind === "starting"}
              onStart={() => start(step.quote)}
              rechargeHref={`${site.routes.walletRecharge}?${new URLSearchParams({
                amount: String(Math.max(step.quote.minimumBalance - step.quote.walletBalance, 0)),
                next: resumeUrl,
              }).toString()}`}
            />
          ) : null}

          {step.kind === "unavailable" ? (
            <div>
              <p className="text-[15px] leading-relaxed text-ink-700">
                {lawyer.name} isn’t available for a {MODE_LABEL[mode]} right now. You haven’t been charged.
              </p>
              <Link href={similarHref} className={buttonClass("primary", "lg", "mt-5 w-full")}>
                See available lawyers in this area
              </Link>
            </div>
          ) : null}

          {step.kind === "pending" ? (
            <div>
              <p className="text-[15px] leading-relaxed text-ink-700">
                Your last payment is still being confirmed by the payment provider. Your balance updates as soon as it
                is confirmed — please don’t pay again.
              </p>
              <Button variant="secondary" size="lg" className="mt-5 w-full" onClick={() => load()}>
                Check again
              </Button>
            </div>
          ) : null}

          {step.kind === "error" ? (
            <div role="alert">
              <p className="flex items-start gap-2 text-[15px] text-ink-700">
                <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                {step.message}
              </p>
              <Button variant="secondary" size="lg" className="mt-5 w-full" onClick={() => load()}>
                Try again
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}

function QuoteView({
  quote,
  mode,
  busy,
  onStart,
  rechargeHref,
}: {
  quote: ConsultQuote;
  mode: ConsultMode;
  busy: boolean;
  onStart: () => void;
  rechargeHref: string;
}) {
  const sufficient = quote.walletBalance >= quote.minimumBalance;
  const minutes = minutesAffordable(quote.walletBalance, quote.ratePerMin);
  const discounted = quote.ratePerMin < quote.defaultRatePerMin;
  return (
    <div>
      <dl className="divide-y divide-ink-100 rounded-2xl bg-ink-50 px-4 text-[15px]">
        <div className="flex items-center justify-between py-3">
          <dt className="text-ink-600">Rate</dt>
          <dd className="font-semibold">
            {formatINR(quote.ratePerMin)}/min
            {discounted ? (
              <span className="ml-2 font-normal text-ink-400 line-through">{formatINR(quote.defaultRatePerMin)}</span>
            ) : null}
          </dd>
        </div>
        <div className="flex items-center justify-between py-3">
          <dt className="text-ink-600">Wallet balance</dt>
          <dd className="font-semibold">{formatINR(quote.walletBalance)}</dd>
        </div>
        <div className="flex items-center justify-between py-3">
          <dt className="text-ink-600">Covers about</dt>
          <dd className="font-semibold">{minutes} min</dd>
        </div>
      </dl>
      <p className="mt-3 text-sm text-ink-500">Charged per minute from your wallet. You can end the {mode} at any time.</p>
      {sufficient ? (
        <Button size="lg" className="mt-5 w-full" disabled={busy} onClick={onStart}>
          {busy ? "Connecting…" : mode === "call" ? "Start call" : "Start chat"}
        </Button>
      ) : (
        <>
          <p className="mt-4 rounded-xl bg-warn-50 px-3 py-2 text-sm text-warn-700">
            You need at least {formatINR(quote.minimumBalance)} in your wallet to start.
          </p>
          <a
            href={rechargeHref}
            onClick={() => track("consult_recharge_started", { mode, needed: quote.minimumBalance - quote.walletBalance })}
            className={buttonClass("primary", "lg", "mt-4 w-full")}
          >
            <Icon name="wallet" /> Add credits
          </a>
        </>
      )}
      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-500">
        <Icon name="lock" className="h-3.5 w-3.5" /> Payments are processed by our payment partner.
      </p>
    </div>
  );
}
