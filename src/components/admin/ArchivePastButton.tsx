"use client";

import { useState, useTransition } from "react";
import { archivePastAction } from "@/app/admin/actions";

export function ArchivePastButton() {
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className="btn btn-outline min-h-11" disabled={pending} onClick={() => start(async () => setMsg((await archivePastAction()).message))}>
        Archive past events
      </button>
      {msg && (
        <span className="text-sm font-bold text-green" role="status">
          {msg}
        </span>
      )}
    </div>
  );
}
