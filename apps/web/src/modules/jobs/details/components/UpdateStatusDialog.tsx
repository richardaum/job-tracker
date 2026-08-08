"use client";

import { tryRun } from "@job-tracker/try-run";
import { Button, Checkbox, cn, Dialog, FormField, Input, Select, Stack } from "@job-tracker/ui";
import { useCallback, useMemo, useState } from "react";
import type { ReactElement } from "react";

import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";

import { ApplicationStage, StageEventSource } from "@/gql/hooks";
import { useCreateJobStageEvent } from "@/modules/jobs/details/hooks/useCreateJobStageEvent";
import { formatStage } from "@/modules/jobs/shared/components/status-badge.utils";
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

type UpdateStatusDialogProps = {
  jobId: string;
  currentStage: ApplicationStage;
  trigger?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function UpdateStatusDialog({ jobId, currentStage, trigger, open, onOpenChange }: UpdateStatusDialogProps) {
  const { enqueueToast } = useToastQueue();
  const handleToast = useCallback(
    (message: string, intent: "success" | "error") => enqueueToast({ title: message, intent }),
    [enqueueToast],
  );
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<ApplicationStage | undefined>(undefined);
  const [scheduledEnabled, setScheduledEnabled] = useState(false);
  const [scheduledAtDraft, setScheduledAtDraft] = useState("");
  const [reasonDraft, setReasonDraft] = useState("");

  const [createStageEvent, { loading: stageSaving }] = useCreateJobStageEvent();
  const saving = stageSaving;
  const canSave = Boolean(selectedStage) && !saving;
  const scheduledAtValue = scheduledAtDraft.trim();
  const selectOptions = useMemo(() => stageOptions.map((option) => ({ ...option, value: option.value })), []);

  const resolvedOpen = open ?? internalOpen;

  function handleOpenChange(nextOpen: boolean) {
    if (open === undefined) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
    if (nextOpen) {
      setSelectedStage(undefined);
      setScheduledEnabled(false);
      setScheduledAtDraft("");
      setReasonDraft("");
    }
  }

  async function handleSaveStatusUpdate() {
    if (!selectedStage) return;

    const [error] = await tryRun(
      createStageEvent({
        jobId,
        toStage: selectedStage,
        scheduledAt: scheduledEnabled ? buildScheduledAtWithBrowserTimezone(scheduledAtValue) : null,
        source: StageEventSource.Manual,
        reason: reasonDraft.trim() || null,
      }),
    );
    if (error) {
      handleToast("Could not save status update.", "error");
      return;
    }
    handleOpenChange(false);
    handleToast("Status update saved.", "success");
  }

  return (
    <Dialog
      title="Update status"
      description="Set the next job stage and optionally schedule when it should take effect."
      open={resolvedOpen}
      onOpenChange={handleOpenChange}
      trigger={trigger ?? <span aria-hidden style={{ display: "none" }} />}
    >
      <Stack gap="sm">
        <FormField label="Status" htmlFor={`history-status-${jobId}`}>
          <Select
            value={selectedStage}
            onValueChange={(value) => setSelectedStage(value as ApplicationStage)}
            options={selectOptions}
            placeholder={`Current: ${formatStage(currentStage)}`}
            size="sm"
          />
        </FormField>
        <label className={cn("flex cursor-pointer items-center gap-2")}>
          <Checkbox
            id={`history-schedule-check-${jobId}`}
            checked={scheduledEnabled}
            onCheckedChange={(checked) => {
              setScheduledEnabled(checked);
              if (checked) {
                setScheduledAtDraft(getDateTimeInputValueFromNow());
              }
            }}
            disabled={saving}
          />
          <span className={cn("text-sm text-text-default")}>Custom date</span>
        </label>
        {scheduledEnabled && (
          <Stack gap="xs">
            <Input
              id={`history-scheduled-at-${jobId}`}
              type="datetime-local"
              size="sm"
              value={scheduledAtDraft}
              onChange={(event) => setScheduledAtDraft(event.target.value)}
              disabled={saving}
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
                      getDateOnlyFromDateTimeInput(scheduledAtDraft) === getDateOnlyFromDateTimeInput(optionValue) &&
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
        )}
        <FormField label="Reason (optional)" htmlFor={`history-reason-${jobId}`}>
          <Input
            id={`history-reason-${jobId}`}
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
