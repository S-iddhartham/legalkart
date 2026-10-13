"use client";

import { useEffect } from "react";
import { track, type FunnelEvent } from "@/lib/analytics";

export function TrackView({ event, props }: { event: FunnelEvent; props?: Record<string, string> }) {
  useEffect(() => {
    track(event, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
