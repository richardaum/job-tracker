"use client";

import { tryRun } from "@job-tracker/try-run";
import { Button, Checkbox, cn, FormField, IconButton, Input, Popover, Select, Stack, Text } from "@job-tracker/ui";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  ApplicationStage,
  JobStageEventsDocument,
  type JobStageEventsQuery,
  StageEventSource,
  useCreateJobStageEventMutation,
} from "@/gql/hooks";
import {
  buildScheduledAtWithBrowserTimezone,
  getDateOnlyFromDateTimeInput,
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
  { label: "Tomorrow", offsetDays: 1 },
  { label: "+2d", offsetDays: 2 },
  { label: "+3d", offsetDays: 3 },
] as const;

import { formatStage } from "@/modules/jobs/shared/components/status-badge.utils";

type JobStageEventRow = NonNullable<JobStageEventsQuery["jobStageEvents"]>[number];

interface JobTrackingPanelProps {
  jobId: string;
  jobStageEvents: Array<JobStageEventRow>;
  onRequestStageEvents: () => void;
  /** When true, only the popover trigger is rendered (e.g. inline with other row actions). */
  inline?: boolean;
  triggerIcon?: ReactNode;
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
  const [scheduledEnabled, setScheduledEnabled] = useState(false);
  const [scheduledAtDraft, setScheduledAtDraft] = useState("");
  const [reasonDraft, setReasonDraft] = useState("");

  const currentStage = latestEvent?.toStage ?? ApplicationStage.New;
  const selectedStage = selectedStageDraft ?? undefined;
  const scheduledAtValue = scheduledAtDraft;
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
            scheduledAt: scheduledEnabled ? buildScheduledAtWithBrowserTimezone(scheduledAtValue) : null,
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
    setScheduledEnabled(false);
    setScheduledAtDraft("");
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
          intent="quiet"
          size="sm"
          label="Update status"
          tooltip="Update status"
          className={cn(inline ? "size-6" : "size-7")}
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
              }}
              options={stageOptions}
              placeholder={`Current: ${formatStage(currentStage)}`}
              size="sm"
            />
          </FormField>
          {showStageControls ? (
            <>
              <label className={cn("flex cursor-pointer items-center gap-2")}>
                <Checkbox
                  id={`schedule-check-${jobId}`}
                  checked={scheduledEnabled}
                  onCheckedChange={(checked) => {
                    setScheduledEnabled(checked);
                    if (checked) {
                      setScheduledAtDraft(getDateTimeInputValueFromNow());
                    }
                  }}
                  disabled={statusSaving}
                />
                <span className={cn("text-sm text-text-default")}>Custom date</span>
              </label>
              {scheduledEnabled && (
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
                            getDateOnlyFromDateTimeInput(scheduledAtValue) ===
                              getDateOnlyFromDateTimeInput(optionValue) &&
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
              )}
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
              Select a status to define optional reason and schedule.
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
