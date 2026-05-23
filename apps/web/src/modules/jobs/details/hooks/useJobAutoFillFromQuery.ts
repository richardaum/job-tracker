"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

interface UseJobAutoFillFromQueryOptions {
  /** Fire only after the job record is loaded (prevents premature mutation). */
  jobReady: boolean;
  /** Typically `triggerFillAutomatically` / UI handler including toasts. */
  onFill: () => void | Promise<void>;
}

/**
 * Mirrors legacy `/draft-jobs/:id?autoConvert=true`: one-shot automatic fill once the
 * detail screen has fully loaded.
 */
export function useJobAutoFillFromQuery({
  jobReady,
  onFill,
}: UseJobAutoFillFromQueryOptions) {
  const searchParams = useSearchParams();
  const attemptedRef = useRef(false);

  useEffect(() => {
    const autoConvert = searchParams.get("autoConvert") === "true";

    if (autoConvert && jobReady && !attemptedRef.current) {
      attemptedRef.current = true;

      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("autoConvert");
      const qs = newParams.toString();
      const path = window.location.pathname + (qs ? `?${qs}` : "");
      window.history.replaceState(null, "", path);

      void onFill();
    }
  }, [searchParams, jobReady, onFill]);
}
