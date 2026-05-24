"use client";

import { useEffect, useRef } from "react";

import { subscribeEventSource } from "@/hooks/event-source-pool";

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

    const unsubscribe = subscribeEventSource(url, eventName, (data) => {
      if (!canceled) {
        onEventRef.current(data as T);
      }
    });

    return () => {
      canceled = true;
      unsubscribe();
    };
  }, [url, eventName]);
}
