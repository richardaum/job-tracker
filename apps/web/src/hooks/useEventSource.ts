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

    let canceled = false;

    const notify = (parsed: T) => {
      if (!canceled) {
        onEventRef.current(parsed);
      }
    };

    const es = new EventSource(url, { withCredentials: true });

    const listener = (e: MessageEvent) => {
      const [err, parsed] = tryRun(() => JSON.parse(e.data) as T);
      if (!err) notify(parsed);
    };

    es.addEventListener(eventName, listener);

    es.onerror = () => {};

    return () => {
      canceled = true;
      es.removeEventListener(eventName, listener);
      es.onerror = null;
      es.close();
    };
  }, [url, eventName]);
}
