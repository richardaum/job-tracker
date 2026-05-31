"use client";

import { Badge, cn, DropdownMenu, DropdownMenuItem, Link, Text } from "@job-tracker/ui";
import { useMemo } from "react";

import { normalizeJobUrls } from "./job-urls.utils";

type JobUrlsProps = {
  urls: readonly string[] | null | undefined;
  linkClassName?: string;
  /** When there are no URLs, render this as secondary body text instead of nothing. */
  emptyLabel?: string;
};

export function JobUrls({ urls, linkClassName, emptyLabel }: JobUrlsProps) {
  const list = useMemo(() => normalizeJobUrls(urls), [urls]);

  if (list.length === 0) {
    if (emptyLabel) {
      return (
        <Text size="sm" color="secondary">
          {emptyLabel}
        </Text>
      );
    }
    return null;
  }

  const primary = list[0] as string;

  return (
    <div className={cn("flex items-center gap-2")}>
      <Link href={primary} variant="default" className={cn(linkClassName)} target="_blank" rel="noopener noreferrer">
        View posting
      </Link>
      {list.length > 1 ? (
        <DropdownMenu
          align="start"
          trigger={
            <button
              type="button"
              className={cn("inline-flex cursor-pointer rounded-full")}
              aria-label={`Open all URLs (${list.length})`}
            >
              <Badge>{list.length}</Badge>
            </button>
          }
        >
          <div className={cn("w-md max-w-[85vw]")}>
            {list.map((url, index) => (
              <DropdownMenuItem
                key={`${url}-${index}`}
                onSelect={() => window.open(url, "_blank", "noopener,noreferrer")}
              >
                <Text as="span" size="sm" className={cn("block truncate")} title={url}>
                  {url}
                </Text>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
