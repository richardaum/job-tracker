"use client";

import { tryRun } from "@job-tracker/try-run";
import { useEffect, useRef } from "react";

export function useEventSource<T = unknown>(
  url: string | null,
  eventName: string,
  onEvent: (data: T) => void,
) {
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    if (!url) return;

    const es = new EventSource(url, { withCredentials: true });

    es.addEventListener(eventName, (e) => {
      const [err, parsed] = tryRun(() => JSON.parse(e.data) as T);
      if (!err) onEventRef.current(parsed);
    });

    es.onerror = () => {};

    return () => es.close();
  }, [url, eventName]);
}
