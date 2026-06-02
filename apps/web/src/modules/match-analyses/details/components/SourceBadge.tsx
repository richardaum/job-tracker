"use client";

import { cn, IconButton } from "@job-tracker/ui";
import { BriefcaseIcon, FilesIcon } from "@phosphor-icons/react";
import type { Route } from "next";
import { SafeLink } from "@/components/safe-link";

import { MatchSource } from "@/gql/hooks";

type SourceBadgeProps = { source: MatchSource; resumeId?: string; onPreferenceClick?: () => void };

export function SourceBadge({ source, resumeId, onPreferenceClick }: SourceBadgeProps) {
  if (source === MatchSource.Resume && resumeId) {
    return (
      <SafeLink href={`/profile/resumes/${resumeId}` as Route}>
        <IconButton
          icon={<FilesIcon size={16} weight="regular" />}
          label="View resume"
          tooltip="View resume"
          size="sm"
          intent="ghost"
          className={cn("size-7")}
        />
      </SafeLink>
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
