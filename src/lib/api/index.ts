import { createHttpApi } from "./http";
import { createPreviewApi } from "./preview";
import type { LegalKartApi } from "./types";

let instance: LegalKartApi | undefined;

/** Returns the HTTP client when an API base URL is configured, else preview data. */
export function getApi(): LegalKartApi {
  if (!instance) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    instance = base ? createHttpApi(base) : createPreviewApi();
  }
  return instance;
}

export * from "./types";
