"use client";

import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

function mergeSearchParams(target: string, source: URLSearchParams) {
  const [basePath, queryString] = target.split("?");
  const merged = new URLSearchParams(queryString ?? "");
  for (const [key, value] of source) {
    if (!merged.has(key)) merged.set(key, value);
  }
  const qs = merged.toString();
  return `${basePath}${qs ? `?${qs}` : ""}` as Route;
}

export function useSafeRouter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const push = useCallback(
    (path: string) => {
      router.push(mergeSearchParams(path, searchParams));
    },
    [router, searchParams],
  );

  const replace = useCallback(
    (path: string) => {
      router.replace(mergeSearchParams(path, searchParams));
    },
    [router, searchParams],
  );

  return { push, replace };
}
