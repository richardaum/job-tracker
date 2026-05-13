"use client";

import { Badge, cn } from "@job-tracker/ui";
import NextLink from "next/link";
import React from "react";

export function SourceBadge({
  source,
  resumeId,
  onPreferenceClick,
}: {
  source: string;
  resumeId?: string;
  onPreferenceClick?: () => void;
}) {
  const badge = (
    <Badge intent="default" className={cn("border-0")} interactive>
      Source: {source}
    </Badge>
  );

  if (source === "resume" && resumeId) {
    return (
      <NextLink href={`/resumes/${resumeId}`} className={cn("ml-auto")}>
        {badge}
      </NextLink>
    );
  }

  return (
    <button type="button" onClick={onPreferenceClick} className={cn("ml-auto")}>
      {badge}
    </button>
  );
}
