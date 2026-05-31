"use client";

import { tryRun } from "@job-tracker/try-run";
import {
  Button,
  cn,
  FormField,
  IconButton,
  Input,
  Popover,
  Select,
  Stack,
  Text,
} from "@job-tracker/ui";
import React, { useMemo, useState } from "react";

import {
  ApplicationStage,
  JobStageEventsDocument,
  type JobStageEventsQuery,
  StageEventSource,
  useCreateJobStageEventMutation,
} from "@/gql/hooks";
import {
  buildScheduledAtWithBrowserTimezone,
  getDateTimeInputValueFromNow,
} from "@/modules/jobs/details/utils/scheduled-at";

const stageOptions: Array<{ value: ApplicationStage; label: string }> = [
  { value: ApplicationStage.Draft, label: "Draft" },
  { value: ApplicationStage.New, label: "New" },
  { value: ApplicationStage.Duplicated, label: "Duplicated" },
  { value: ApplicationStage.Applied, label: "Applied" },
  { value: ApplicationStage.RecruiterScreen, label: "Recruiter Screen" },
  { value: ApplicationStage.Technical, label: "Technical" },
  { value: ApplicationStage.CulturalFit, label: "Cultural Fit" },
  { value: ApplicationStage.Offer, label: "Offer" },
  { value: ApplicationStage.Rejected, label: "Rejected" },
];

const quickScheduleOptions = [
  { label: "Now", offsetDays: 0 },
  { label: "Tomorrow", offsetDays: 1 },
  { label: "+2d", offsetDays: 2 },
  { label: "+3d", offsetDays: 3 },
] as const;

type JobStageEventRow = NonNullable<JobStageEventsQuery["jobStageEvents"]>[number];

function formatStage(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

interface JobTrackingPanelProps {
  jobId: string;
  jobStageEvents: Array<JobStageEventRow>;
  onRequestStageEvents: () => void;
  /** When true, only the popover trigger is rendered (e.g. inline with other row actions). */
  inline?: boolean;
  triggerIcon?: React.ReactNode;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function JobTrackingPanel({
  jobId,
  jobStageEvents: stageEvents,
  onRequestStageEvents,
  inline = false,
  triggerIcon,
  onSuccess,
  onError,
}: JobTrackingPanelProps) {
  const [createStageEvent, { loading: stageSaving }] = useCreateJobStageEventMutation({
    refetchQueries: [{ query: JobStageEventsDocument, variables: { jobId } }],
  });

  const latestEvent = useMemo(() => stageEvents[0] ?? null, [stageEvents]);
  const [selectedStageDraft, setSelectedStageDraft] = useState<ApplicationStage | null>(null);
  const [scheduledAtDraft, setScheduledAtDraft] = useState<string | null>(null);
  const [reasonDraft, setReasonDraft] = useState("");

  const currentStage = latestEvent?.toStage ?? ApplicationStage.New;
  const selectedStage = selectedStageDraft ?? undefined;
  const scheduledAtValue = scheduledAtDraft ?? "";
  const canSaveStageUpdate = selectedStageDraft !== null;
  const statusSaving = stageSaving;
  const showStageControls = selectedStageDraft !== null;

  async function handleSaveStageUpdate() {
    if (!selectedStageDraft) return;
    const [error] = await tryRun(
      createStageEvent({
        variables: {
          input: {
            jobId,
            toStage: selectedStageDraft,
            scheduledAt: buildScheduledAtWithBrowserTimezone(scheduledAtValue),
            source: StageEventSource.Manual,
            reason: reasonDraft.trim() || null,
          },
        },
      }),
    );
    if (error) {
      onError("Could not save status update.");
      return;
    }
    setScheduledAtDraft(null);
    setSelectedStageDraft(null);
    setReasonDraft("");
    onSuccess("Status update saved.");
  }

  const popover = (
    <Popover
      onOpenChange={(open) => {
        if (open) onRequestStageEvents();
      }}
      trigger={
        <IconButton
          intent="ghost"
          size="sm"
          label="Update status"
          tooltip="Update status"
          className={cn("text-text-muted/80 hover:text-text-muted", inline ? "size-6 " : "size-7 ")}
          icon={triggerIcon}
        />
      }
      align="start"
    >
      <div className={cn("w-80 p-1")}>
        <Stack gap="xs">
          <FormField label="Status" htmlFor={`status-${jobId}`}>
            <Select
              value={selectedStage}
              onValueChange={(value) => {
                setSelectedStageDraft(value as ApplicationStage);
                setScheduledAtDraft((current) => current ?? getDateTimeInputValueFromNow());
              }}
              options={stageOptions}
              placeholder={`Current: ${formatStage(currentStage)}`}
              size="sm"
            />
          </FormField>
          {showStageControls ? (
            <>
              <FormField label="Scheduled at (optional)" htmlFor={`scheduled-at-${jobId}`}>
                <Stack gap="xs">
                  <Input
                    id={`scheduled-at-${jobId}`}
                    type="datetime-local"
                    size="sm"
                    value={scheduledAtValue}
                    onChange={(event) => setScheduledAtDraft(event.target.value)}
                    disabled={statusSaving}
                  />
                  <div className={cn("flex flex-wrap gap-1")}>
                    {quickScheduleOptions.map((option) => {
                      const optionValue = getDateTimeInputValueFromNow(option.offsetDays);
                      return (
                        <Button
                          key={option.label}
                          type="button"
                          size="md"
                          intent="outlined"
                          className={cn(
                            "h-7 px-2 text-xs",
                            scheduledAtValue === optionValue &&
                              "border-border-brand bg-bg-brand-subtle text-text-brand hover:bg-bg-brand-subtle",
                          )}
                          onClick={() => setScheduledAtDraft(optionValue)}
                          disabled={statusSaving}
                        >
                          {option.label}
                        </Button>
                      );
                    })}
                  </div>
                </Stack>
              </FormField>
              <FormField label="Reason (optional)" htmlFor={`stage-reason-${jobId}`}>
                <Input
                  id={`stage-reason-${jobId}`}
                  type="text"
                  size="sm"
                  value={reasonDraft}
                  onChange={(event) => setReasonDraft(event.target.value)}
                  disabled={statusSaving}
                  placeholder="Brief explanation for status change"
                />
              </FormField>
            </>
          ) : (
            <Text size="xs" color="muted">
              Select a status to define optional schedule and one note.
            </Text>
          )}
          <Button
            intent="secondary"
            size="md"
            onClick={handleSaveStageUpdate}
            disabled={!canSaveStageUpdate}
            state={statusSaving ? "loading" : "default"}
          >
            Save
          </Button>
        </Stack>
      </div>
    </Popover>
  );

  if (inline) {
    return popover;
  }

  return (
    <Stack gap="sm" className={cn("mt-3 border-t border-border-subtle pt-3")}>
      <Stack direction="row" gap="xs" className={cn("flex-wrap")}>
        {popover}
      </Stack>
    </Stack>
  );
}
