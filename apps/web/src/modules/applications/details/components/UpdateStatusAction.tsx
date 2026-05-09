"use client";

import { tryRun } from "@job-tracker/try-run";
import {
  Button,
  cn,
  Dialog,
  FormField,
  Input,
  Select,
  Stack,
} from "@job-tracker/ui";
import React, { useMemo, useState } from "react";

import {
  ApplicationStage,
  ApplicationStageEventsDocument,
  useCreateApplicationStageEventMutation,
} from "@/gql/hooks";
import { formatStage } from "@/modules/applications/details/utils/application-details.shared";
import {
  buildScheduledAtWithBrowserTimezone,
  getDateTimeInputValueFromNow,
} from "@/modules/applications/details/utils/scheduled-at";

const stageOptions: Array<{ value: ApplicationStage; label: string }> = [
  { value: ApplicationStage.New, label: "New" },
  { value: ApplicationStage.Duplicated, label: "Duplicated" },
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

export function UpdateStatusAction({
  applicationId,
  currentStage,
  trigger,
  open,
  onOpenChange,
  onSuccess,
  onError,
}: {
  applicationId: string;
  currentStage: ApplicationStage;
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<
    ApplicationStage | undefined
  >(undefined);
  const [scheduledAtDraft, setScheduledAtDraft] = useState("");
  const [reasonDraft, setReasonDraft] = useState("");

  const [createStageEvent, { loading: stageSaving }] =
    useCreateApplicationStageEventMutation({
      refetchQueries: [
        { query: ApplicationStageEventsDocument, variables: { applicationId } },
      ],
    });
  const saving = stageSaving;
  const canSave = Boolean(selectedStage) && !saving;
  const scheduledAtValue = scheduledAtDraft.trim();
  const selectOptions = useMemo(
    () => stageOptions.map((option) => ({ ...option, value: option.value })),
    [],
  );

  const resolvedOpen = open ?? internalOpen;

  function handleOpenChange(nextOpen: boolean) {
    if (open === undefined) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
    if (nextOpen) {
      setSelectedStage(undefined);
      setScheduledAtDraft(
        (current) => current || getDateTimeInputValueFromNow(),
      );
      setReasonDraft("");
    }
  }

  async function handleSaveStatusUpdate() {
    if (!selectedStage) return;

    const [error] = await tryRun(
      createStageEvent({
        variables: {
          input: {
            applicationId,
            toStage: selectedStage,
            scheduledAt: buildScheduledAtWithBrowserTimezone(scheduledAtValue),
            source: "manual",
            reason: reasonDraft.trim() || null,
          },
        },
      }),
    );
    if (error) {
      onError?.("Could not save status update.");
      return;
    }
    handleOpenChange(false);
    onSuccess?.("Status update saved.");
  }

  return (
    <Dialog
      title="Update status"
      description="Set the next application stage and optionally schedule when it should take effect."
      open={resolvedOpen}
      onOpenChange={handleOpenChange}
      trigger={trigger ?? <span aria-hidden style={{ display: "none" }} />}
    >
      <Stack gap="sm">
        <FormField label="Status" htmlFor={`history-status-${applicationId}`}>
          <Select
            value={selectedStage}
            onValueChange={(value) =>
              setSelectedStage(value as ApplicationStage)
            }
            options={selectOptions}
            placeholder={`Current: ${formatStage(currentStage)}`}
            size="sm"
          />
        </FormField>
        <FormField
          label="Scheduled at (optional)"
          htmlFor={`history-scheduled-at-${applicationId}`}
        >
          <Stack gap="xs">
            <Input
              id={`history-scheduled-at-${applicationId}`}
              type="datetime-local"
              size="sm"
              value={scheduledAtDraft}
              onChange={(event) => setScheduledAtDraft(event.target.value)}
              disabled={saving}
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
                    size="md"
                    intent="outlined"
                    className={cn(
                      "h-7 px-2 text-xs",
                      scheduledAtDraft === optionValue &&
                        "border-border-brand bg-bg-brand-subtle text-text-brand hover:bg-bg-brand-subtle",
                    )}
                    onClick={() => setScheduledAtDraft(optionValue)}
                    disabled={saving}
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
          htmlFor={`history-reason-${applicationId}`}
        >
          <Input
            id={`history-reason-${applicationId}`}
            type="text"
            size="sm"
            value={reasonDraft}
            onChange={(event) => setReasonDraft(event.target.value)}
            disabled={saving}
            placeholder="Brief explanation for this status change"
          />
        </FormField>
        <div className={cn("flex justify-end")}>
          <Button
            intent="primary"
            size="md"
            onClick={() => void handleSaveStatusUpdate()}
            disabled={!canSave}
            state={saving ? "loading" : "default"}
          >
            Save
          </Button>
        </div>
      </Stack>
    </Dialog>
  );
}
