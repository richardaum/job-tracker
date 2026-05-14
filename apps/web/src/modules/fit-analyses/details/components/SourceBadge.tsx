"use client";

import { cn, IconButton } from "@job-tracker/ui";
import { BriefcaseIcon, FilesIcon } from "@phosphor-icons/react";
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
  if (source === "resume" && resumeId) {
    return (
      <NextLink href={`/resumes/${resumeId}`}>
        <IconButton
          icon={<FilesIcon size={16} weight="regular" />}
          label="View resume"
          tooltip="View resume"
          size="sm"
          intent="ghost"
          className={cn("size-7")}
        />
      </NextLink>
    );
  }

  return (
    <div>
      <IconButton
        icon={<BriefcaseIcon size={16} weight="regular" />}
        label="Work Preferences"
        tooltip="Work Preferences"
        size="sm"
        intent="ghost"
        className={cn("size-7")}
        onClick={onPreferenceClick}
      />
    </div>
  );
}
