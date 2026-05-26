"use client";

import { tryRun } from "@job-tracker/try-run";
import { Button, cn, IconButton, ListItemCard } from "@job-tracker/ui";
import { PlayIcon } from "@phosphor-icons/react";
import React, { useState } from "react";

import type { SourceRunStatus } from "@/gql/graphql";
import {
  SourcesForSourceProfileDocument,
  SourceTemplateDocument,
  useRerunSourceTemplateMutation,
} from "@/gql/hooks";

type SourceRunSummary = {
  id: string;
  status: SourceRunStatus;
  startedAt: unknown;
};

type RunSourceTemplateButtonProps = {
  templateId: string;
  sourceProfileId: string;
  label: string;
  tooltip: string;
  variant?: "icon" | "button";
  onRunStarted?: (templateId: string, run: SourceRunSummary) => void;
};

export function RunSourceTemplateButton({
  templateId,
  sourceProfileId,
  label,
  tooltip,
  variant = "icon",
  onRunStarted,
}: RunSourceTemplateButtonProps) {
  const [running, setRunning] = useState(false);
  const [rerunSourceTemplate] = useRerunSourceTemplateMutation({
    refetchQueries: [
      ...(sourceProfileId !== ""
        ? [
            {
              query: SourcesForSourceProfileDocument,
              variables: { sourceProfileId },
            },
          ]
        : []),
      { query: SourceTemplateDocument, variables: { id: templateId } },
    ],
    awaitRefetchQueries: true,
  });

  async function handleRun() {
    setRunning(true);
    const [err, result] = await tryRun(
      rerunSourceTemplate({ variables: { templateId } }),
    );
    setRunning(false);
    if (err || !result.data?.rerunSourceTemplate) {
      return;
    }
    onRunStarted?.(templateId, result.data.rerunSourceTemplate);
  }

  if (variant === "button") {
    return (
      <Button
        intent="primary"
        size="md"
        type="button"
        state={running ? "loading" : "default"}
        onClick={() => void handleRun()}
      >
        {label}
      </Button>
    );
  }

  return (
    <IconButton
      intent="ghost"
      size="sm"
      label={label}
      tooltip={tooltip}
      disabled={running}
      className={cn(ListItemCard.actionIconButtonClassName)}
      icon={<PlayIcon size={13} weight="regular" />}
      onClick={() => void handleRun()}
    />
  );
}
