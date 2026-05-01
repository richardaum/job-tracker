"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

function sanitizeReturnTo(value: string | null): string {
  if (!value || !value.startsWith("/")) {
    return "/";
  }

  if (value.startsWith("//")) {
    return "/";
  }

  return value;
}

export function useAuthReturnTo() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useMemo(() => {
    const query = searchParams.toString();
    const currentPathWithQuery = query ? `${pathname}?${query}` : pathname;
    const loginRedirectUrl = `/login?returnTo=${encodeURIComponent(
      currentPathWithQuery,
    )}`;
    const safeReturnTo = sanitizeReturnTo(searchParams.get("returnTo"));

    return { loginRedirectUrl, safeReturnTo };
  }, [pathname, searchParams]);
}
