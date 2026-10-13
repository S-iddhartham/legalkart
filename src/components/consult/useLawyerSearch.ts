"use client";

import { useEffect, useRef, useState } from "react";
import { getApi } from "@/lib/api";
import type { LawyerPage, LawyerSearchParams } from "@/lib/api/types";
import { toSearchParams } from "@/lib/consult-query";

export type SearchState =
  | { status: "ready"; data: LawyerPage }
  | { status: "loading"; data: LawyerPage | null }
  | { status: "error"; data: LawyerPage | null };

/**
 * Fetches a results page whenever the params change. Each request is aborted
 * when superseded and its result is ignored unless it is still the latest, so
 * out-of-order responses can never overwrite newer results.
 */
export function useLawyerSearch(params: LawyerSearchParams, initial: { key: string; data: LawyerPage | null }) {
  const key = toSearchParams(params).toString();
  const [state, setState] = useState<SearchState>(
    initial.data ? { status: "ready", data: initial.data } : { status: "loading", data: null },
  );
  const latest = useRef(0);
  const [attempt, setAttempt] = useState(0);
  const skipFirst = useRef(initial.data != null && initial.key === key);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const id = ++latest.current;
    const ac = new AbortController();
    setState((s) => ({ status: "loading", data: s.data }));
    getApi()
      .searchLawyers(params, ac.signal)
      .then((data) => {
        if (id === latest.current) setState({ status: "ready", data });
      })
      .catch(() => {
        if (id === latest.current && !ac.signal.aborted) setState((s) => ({ status: "error", data: s.data }));
      });
    return () => ac.abort();
    // `key` is the serialised form of `params`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  return { state, retry: () => setAttempt((a) => a + 1) };
}
