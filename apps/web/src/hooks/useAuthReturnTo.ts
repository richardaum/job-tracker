"use client";

import type { Route } from "next";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

function sanitizeReturnTo(value: string | null): Route {
  if (!value || !value.startsWith("/")) {
    return "/";
  }

  if (value.startsWith("//")) {
    return "/";
  }

  return value as Route;
}

export function useAuthReturnTo() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useMemo(() => {
    const query = searchParams.toString();
    const currentPathWithQuery = query ? `${pathname}?${query}` : pathname;
    const loginRedirectUrl =
      `/login?returnTo=${encodeURIComponent(currentPathWithQuery)}` as Route;
    const safeReturnTo = sanitizeReturnTo(searchParams.get("returnTo"));

    return { loginRedirectUrl, safeReturnTo };
  }, [pathname, searchParams]);
}
