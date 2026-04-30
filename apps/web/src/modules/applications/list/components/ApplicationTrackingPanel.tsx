"use client";

import React, { useMemo, useState } from "react";
import {
  Button,
  FormField,
  IconButton,
  Input,
  Popover,
  Select,
  Stack,
  Text,
  cn,
} from "@job-tracker/ui";
import {
  ApplicationStage,
  type ApplicationStageEventsQuery,
  ApplicationStageEventsDocument,
  useCreateApplicationStageEventMutation,
} from "@/gql/hooks";
import {
  buildScheduledAtWithBrowserTimezone,
  getDateTimeInputValueFromNow,
} from "@/modules/applications/details/utils/scheduled-at";

const stageOptions: Array<{ value: ApplicationStage; label: string }> = [
  { value: ApplicationStage.New, label: "New" },
  { value: ApplicationStage.Applied, label: "Applied" },
  { value: ApplicationStage.RecruiterScreen, label: "Recruiter Screen" },
  { value: ApplicationStage.Technical, label: "Technical" },
  { value: ApplicationStage.Offer, label: "Offer" },
  { value: ApplicationStage.Rejected, label: "Rejected" },
];

const quickScheduleOptions = [
  { label: "Now", offsetDays: 0 },
  { label: "Tomorrow", offsetDays: 1 },
  { label: "+2d", offsetDays: 2 },
  { label: "+3d", offsetDays: 3 },
] as const;

type ApplicationStageEventRow = NonNullable<
  ApplicationStageEventsQuery["applicationStageEvents"]
>[number];

function formatStage(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

interface ApplicationTrackingPanelProps {
  applicationId: string;
  applicationStageEvents: Array<ApplicationStageEventRow>;
  onRequestStageEvents: () => void;
  /** When true, only the popover trigger is rendered (e.g. inline with other row actions). */
  inline?: boolean;
  triggerIcon?: React.ReactNode;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function ApplicationTrackingPanel({
  applicationId,
  applicationStageEvents: stageEvents,
  onRequestStageEvents,
  inline = false,
  triggerIcon,
  onSuccess,
  onError,
}: ApplicationTrackingPanelProps) {
  const [createStageEvent, { loading: stageSaving }] =
    useCreateApplicationStageEventMutation({
      refetchQueries: [
        { query: ApplicationStageEventsDocument, variables: { applicationId } },
      ],
    });

  const latestEvent = useMemo(() => stageEvents[0] ?? null, [stageEvents]);
  const [selectedStageDraft, setSelectedStageDraft] =
    useState<ApplicationStage | null>(null);
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
    try {
      await createStageEvent({
        variables: {
          input: {
            applicationId,
            toStage: selectedStageDraft,
            scheduledAt: buildScheduledAtWithBrowserTimezone(scheduledAtValue),
            source: "manual",
            reason: reasonDraft.trim() || null,
          },
        },
      });
      setScheduledAtDraft(null);
      setSelectedStageDraft(null);
      setReasonDraft("");
      onSuccess("Status update saved.");
    } catch {
      onError("Could not save status update.");
    }
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
          className={cn(
            "text-text-muted/80 hover:text-text-muted",
            inline ? "h-6 w-6" : "h-7 w-7",
          )}
          icon={triggerIcon}
        />
      }
      align="start"
    >
      <div className={cn("w-80 p-1")}>
        <Stack gap="xs">
          <FormField label="Status" htmlFor={`status-${applicationId}`}>
            <Select
              value={selectedStage}
              onValueChange={(value) => {
                setSelectedStageDraft(value as ApplicationStage);
                setScheduledAtDraft(
                  (current) => current ?? getDateTimeInputValueFromNow(),
                );
              }}
              options={stageOptions}
              placeholder={`Current: ${formatStage(currentStage)}`}
              size="sm"
            />
          </FormField>
          {showStageControls ? (
            <>
              <FormField
                label="Scheduled at (optional)"
                htmlFor={`scheduled-at-${applicationId}`}
              >
                <Stack gap="xs">
                  <Input
                    id={`scheduled-at-${applicationId}`}
                    type="datetime-local"
                    size="sm"
                    value={scheduledAtValue}
                    onChange={(event) =>
                      setScheduledAtDraft(event.target.value)
                    }
                    disabled={statusSaving}
                  />
                  <div className={cn("flex flex-wrap gap-1")}>
                    {quickScheduleOptions.map((option) => {
                      const optionValue = getDateTimeInputValueFromNow(
                        option.offsetDays,
                      );
                      return (
                        <Button
                          key={option.label}
                          type="button"
                          size="sm"
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
              <FormField
                label="Reason (optional)"
                htmlFor={`stage-reason-${applicationId}`}
              >
                <Input
                  id={`stage-reason-${applicationId}`}
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
            size="sm"
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
