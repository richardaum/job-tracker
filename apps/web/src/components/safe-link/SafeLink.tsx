"use client";

import type { Route } from "next";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";

export type SafeLinkProps = ComponentProps<typeof NextLink> & { preserveQueryParams?: boolean };

export function SafeLink({ href, preserveQueryParams = true, prefetch = false, ...props }: SafeLinkProps) {
  const searchParams = useSearchParams();

  if (!preserveQueryParams || !searchParams.toString()) {
    return <NextLink href={href} prefetch={prefetch} {...props} />;
  }

  const [basePath, queryString] = href.toString().split("?");
  const merged = new URLSearchParams(queryString ?? "");
  for (const [key, value] of searchParams) {
    if (!merged.has(key)) merged.set(key, value);
  }
  const qs = merged.toString();
  const mergedHref = `${basePath}${qs ? `?${qs}` : ""}` as Route;

  return <NextLink href={mergedHref} prefetch={prefetch} {...props} />;
}
