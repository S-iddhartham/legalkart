import { describe, expect, it } from "vitest";
import { activeFilterCount, parseSearchParams, toSearchParams } from "@/lib/consult-query";

const parse = (q: string) => parseSearchParams(new URLSearchParams(q));

describe("consult query params", () => {
  it("round-trips a full filter state", () => {
    const q = "q=rent&specialty=property&language=Hindi&mode=chat&minExperience=5&minRating=4.5&maxRate=40&available=1&sort=rating&page=2";
    expect(toSearchParams(parse(q)).toString()).toBe(q);
  });

  it("drops invalid values", () => {
    expect(parse("mode=video&sort=random&page=-3&minExperience=abc&available=yes")).toEqual(parse(""));
  });

  it("omits defaults so URLs stay canonical", () => {
    expect(toSearchParams({ sort: "relevance", page: 1 }).toString()).toBe("");
  });

  it("trims empty search text", () => {
    expect(parse("q=%20%20").q).toBeUndefined();
  });

  it("counts active filters (excluding text, sort and page)", () => {
    expect(activeFilterCount(parse("q=x&sort=rating&page=2"))).toBe(0);
    expect(activeFilterCount(parse("specialty=family&mode=call&available=1"))).toBe(3);
  });
});
