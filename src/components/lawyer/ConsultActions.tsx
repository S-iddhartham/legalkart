"use client";

import { useEffect, useState } from "react";
import type { ConsultMode, Lawyer } from "@/lib/api/types";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ConsultDialog } from "./ConsultDialog";

/** Call / Chat buttons for a lawyer, opening the consult gate. */
export function ConsultActions({
  lawyer,
  autoStart,
  size = "sm",
  className = "",
}: {
  lawyer: Lawyer;
  /** Re-open the gate after returning from sign-in / recharge. */
  autoStart?: ConsultMode;
  size?: "sm" | "md";
  className?: string;
}) {
  const [mode, setMode] = useState<ConsultMode | null>(null);
  const [returnPath, setReturnPath] = useState("/");

  useEffect(() => {
    if (autoStart && lawyer.modes.includes(autoStart)) {
      setReturnPath(currentPathWithoutResume());
      setMode(autoStart);
    }
  }, [autoStart, lawyer.modes]);

  const open = (m: ConsultMode) => {
    track("consult_mode_selected", { mode: m, lawyer: lawyer.id });
    setReturnPath(currentPathWithoutResume());
    setMode(m);
  };

  const offline = lawyer.availability === "offline";

  return (
    <div className={`flex gap-2 ${className}`}>
      {lawyer.modes.includes("chat") ? (
        <Button size={size} className="flex-1" onClick={() => open("chat")} disabled={offline}>
          <Icon name="chat" className="h-4 w-4" /> Chat
        </Button>
      ) : null}
      {lawyer.modes.includes("call") ? (
        <Button
          size={size}
          variant={lawyer.modes.includes("chat") ? "secondary" : "primary"}
          className="flex-1"
          onClick={() => open("call")}
          disabled={offline}
        >
          <Icon name="phone" className="h-4 w-4" /> Call
        </Button>
      ) : null}
      {mode ? <ConsultDialog lawyer={lawyer} mode={mode} returnPath={returnPath} onClose={() => setMode(null)} /> : null}
    </div>
  );
}

/** Current URL (path + query) minus the resume markers added by ConsultDialog. */
function currentPathWithoutResume(): string {
  const url = new URL(window.location.href);
  url.searchParams.delete("start");
  url.searchParams.delete("lawyer");
  const q = url.searchParams.toString();
  return `${url.pathname}${q ? `?${q}` : ""}`;
}
