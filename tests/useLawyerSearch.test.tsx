import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { LawyerPage, LawyerSearchParams } from "@/lib/api/types";

const pending: { params: LawyerSearchParams; resolve: (p: LawyerPage) => void; signal?: AbortSignal }[] = [];

vi.mock("@/lib/api", () => ({
  getApi: () => ({
    searchLawyers: (params: LawyerSearchParams, signal?: AbortSignal) =>
      new Promise<LawyerPage>((resolve) => pending.push({ params, resolve, signal })),
  }),
}));

const { useLawyerSearch } = await import("@/components/consult/useLawyerSearch");
const page = (tag: string): LawyerPage => ({ items: [], total: tag.length, page: 1, pageSize: 9 });

afterEach(() => {
  pending.length = 0;
});

describe("useLawyerSearch", () => {
  it("ignores an older response that resolves after a newer one", async () => {
    const { result, rerender } = renderHook(({ p }) => useLawyerSearch(p, { key: "", data: null }), {
      initialProps: { p: { q: "a" } as LawyerSearchParams },
    });
    rerender({ p: { q: "ab" } });
    await waitFor(() => expect(pending.length).toBe(2));
    expect(pending[0]!.signal?.aborted).toBe(true);

    act(() => pending[1]!.resolve(page("newer")));
    await waitFor(() => expect(result.current.state.status).toBe("ready"));
    act(() => pending[0]!.resolve(page("old")));
    await new Promise((r) => setTimeout(r, 0));
    expect(result.current.state.data?.total).toBe("newer".length);
  });

  it("uses server-rendered data without refetching", () => {
    const data = page("ssr");
    const { result } = renderHook(() => useLawyerSearch({ q: "x" }, { key: "q=x", data }));
    expect(result.current.state).toEqual({ status: "ready", data });
    expect(pending.length).toBe(0);
  });
});
