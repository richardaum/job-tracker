"use client";

import type { Route } from "next";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";

export type SafeLinkProps = ComponentProps<typeof NextLink> & {
  /** When true, merge all current query params. When an array, merge only those keys. */
  preserveQueryParams?: boolean | readonly string[];
};

function toHrefString(href: ComponentProps<typeof NextLink>["href"]): string {
  if (typeof href === "string") return href;
  if (href instanceof URL) return href.toString();
  const { pathname = "", search = "" } = href;
  return `${pathname}${search}`;
}

function mergeQueryParams(
  href: ComponentProps<typeof NextLink>["href"],
  searchParams: URLSearchParams,
  preserveQueryParams: true | readonly string[],
): Route {
  const [basePath, queryString] = toHrefString(href).split("?");
  const merged = new URLSearchParams(queryString ?? "");
  const keys = preserveQueryParams === true ? [...searchParams.keys()] : preserveQueryParams;

  for (const key of keys) {
    const value = searchParams.get(key);
    if (value !== null && !merged.has(key)) merged.set(key, value);
  }

  const qs = merged.toString();
  return `${basePath}${qs ? `?${qs}` : ""}` as Route;
}

export function SafeLink({ href, preserveQueryParams = true, prefetch = false, ...props }: SafeLinkProps) {
  const searchParams = useSearchParams();

  if (preserveQueryParams === false || !searchParams.toString()) {
    return <NextLink href={href} prefetch={prefetch} {...props} />;
  }

  return <NextLink href={mergeQueryParams(href, searchParams, preserveQueryParams)} prefetch={prefetch} {...props} />;
}
