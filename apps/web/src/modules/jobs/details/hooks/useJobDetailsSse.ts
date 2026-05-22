"use client";

import { tryRun } from "@job-tracker/try-run";
import { useEffect, useRef } from "react";

import { AsyncMetadataStatus } from "@/gql/hooks";
import { getApiBaseUrl } from "@/lib/api-endpoints";

type FillSsePayload = { jobId: string; status: string };

/**
 * Single EventSource per job detail page: listens for summary + automatic fill SSE.
 */
export function useJobDetailsSse(jobId: string, onRefetch: () => void) {
  const onRefetchRef = useRef(onRefetch);

  useEffect(() => {
    onRefetchRef.current = onRefetch;
  });

  useEffect(() => {
    if (!jobId) return;

    const url = `${getApiBaseUrl()}/jobs/${jobId}/stream`;
    const es = new EventSource(url, { withCredentials: true });

    es.addEventListener("summary_status_changed", () => {
      onRefetchRef.current();
    });

    es.addEventListener("fill_status_changed", (evt) => {
      const raw =
        evt instanceof MessageEvent && typeof evt.data === "string"
          ? evt.data
          : undefined;
      if (raw === undefined) return;
      const [parseErr, data] = tryRun(() => JSON.parse(raw) as FillSsePayload);
      if (parseErr || !data) return;
      if (
        data.status === AsyncMetadataStatus.Completed ||
        data.status === AsyncMetadataStatus.Failed
      ) {
        onRefetchRef.current();
      }
    });

    es.onerror = () => {};

    return () => es.close();
  }, [jobId]);
}
