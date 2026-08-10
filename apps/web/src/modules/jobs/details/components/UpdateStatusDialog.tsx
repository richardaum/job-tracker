"use client";

import { tryRun } from "@job-tracker/try-run";
import { Button, Checkbox, cn, Dialog, FormField, Input, Select, Stack, useControlledState } from "@job-tracker/ui";
import { useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { ReactElement, Ref } from "react";

import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";
import { generateUuid } from "@/lib/generate-uuid";

import { ApplicationStage, StageEventSource } from "@/gql/hooks";
import { useCreateJobStageEvent } from "@/modules/jobs/details/hooks/useCreateJobStageEvent";
import { formatStage } from "@/modules/jobs/shared/components/status-badge.utils";
import {
  buildScheduledAtWithBrowserTimezone,
  getDateOnlyFromDateTimeInput,
  getDateTimeInputValueFromNow,
} from "@/modules/jobs/details/utils/scheduled-at";
import {
  isInert,
  type UpdateStatusDialogRestrictedTarget,
} from "@/modules/jobs/details/components/update-status-dialog-inert";

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
  dismissible?: boolean;
  selectedStage?: ApplicationStage;
  onSelectedStageChange?: (stage: ApplicationStage | undefined) => void;
  scheduledEnabled?: boolean;
  onScheduledEnabledChange?: (enabled: boolean) => void;
  restrictInteractionTo?: UpdateStatusDialogRestrictedTarget;
  freezeSuccessToast?: boolean;
  ref?: Ref<UpdateStatusDialogHandle>;
  onContentElementChange?: (element: HTMLDivElement | null) => void;
};

export type UpdateStatusDialogHandle = {
  save: () => void;
  focusField: (field: UpdateStatusDialogRestrictedTarget) => void;
  closeToast: () => void;
};

const SUCCESS_TOAST_WELCOME_TOUR_STEP = "update-status-toast";

export function UpdateStatusDialog({
  jobId,
  currentStage,
  trigger,
  open,
  onOpenChange,
  dismissible,
  selectedStage,
  onSelectedStageChange,
  scheduledEnabled,
  onScheduledEnabledChange,
  restrictInteractionTo,
  freezeSuccessToast,
  ref,
  onContentElementChange,
}: UpdateStatusDialogProps) {
  const { enqueueToast, dismissToast } = useToastQueue();
  const lastToastIdRef = useRef<string | null>(null);
  const handleToast = useCallback(
    (message: string, intent: "success" | "error", options?: { durationMs?: number; welcomeTourStep?: string }) => {
      const id = generateUuid();
      lastToastIdRef.current = id;
      enqueueToast({
        id,
        title: message,
        intent,
        durationMs: options?.durationMs,
        "data-welcome-tour-step": options?.welcomeTourStep,
      });
    },
    [enqueueToast],
  );
  const [resolvedOpen, setResolvedOpen] = useControlledState(open, false, onOpenChange);
  const [resolvedSelectedStage, handleSelectedStageChange] = useControlledState<ApplicationStage | undefined>(
    selectedStage,
    undefined,
    onSelectedStageChange,
  );
  const [resolvedScheduledEnabled, handleScheduledEnabledChange] = useControlledState(
    scheduledEnabled,
    false,
    onScheduledEnabledChange,
  );
  const [scheduledAtDraft, setScheduledAtDraft] = useState("");
  const [reasonDraft, setReasonDraft] = useState("");
  const statusTriggerRef = useRef<HTMLButtonElement | null>(null);
  const scheduleCheckboxRef = useRef<HTMLButtonElement | null>(null);

  const [createStageEvent, { loading: stageSaving }] = useCreateJobStageEvent();
  const saving = stageSaving;
  const canSave = Boolean(resolvedSelectedStage) && !saving;
  const scheduledAtValue = scheduledAtDraft.trim();
  const selectOptions = useMemo(() => stageOptions.map((option) => ({ ...option, value: option.value })), []);

  function handleOpenChange(nextOpen: boolean) {
    setResolvedOpen(nextOpen);
    if (nextOpen) {
      handleSelectedStageChange(undefined);
      handleScheduledEnabledChange(false);
      setScheduledAtDraft("");
      setReasonDraft("");
    }
  }

  useImperativeHandle(ref, () => ({
    save: () => void handleSaveStatusUpdate(),
    focusField: (field) => {
      if (field === "status") statusTriggerRef.current?.focus();
      if (field === "custom-date") scheduleCheckboxRef.current?.focus();
    },
    closeToast: () => {
      if (lastToastIdRef.current) dismissToast(lastToastIdRef.current, false);
    },
  }));

  async function handleSaveStatusUpdate() {
    if (!resolvedSelectedStage) return;

    const [error] = await tryRun(
      createStageEvent({
        jobId,
        toStage: resolvedSelectedStage,
        scheduledAt: resolvedScheduledEnabled ? buildScheduledAtWithBrowserTimezone(scheduledAtValue) : null,
        source: StageEventSource.Manual,
        reason: reasonDraft.trim() || null,
      }),
    );
    if (error) {
      handleToast("Could not save status update.", "error");
      return;
    }
    handleOpenChange(false);
    handleSelectedStageChange(undefined);
    handleToast(
      "Status update saved.",
      "success",
      freezeSuccessToast
        ? { durationMs: Number.POSITIVE_INFINITY, welcomeTourStep: SUCCESS_TOAST_WELCOME_TOUR_STEP }
        : undefined,
    );
  }

  return (
    <Dialog
      title="Update status"
      description="Set the next job stage and optionally schedule when it should take effect."
      open={resolvedOpen}
      onOpenChange={handleOpenChange}
      dismissible={dismissible}
      trigger={trigger ?? <span aria-hidden style={{ display: "none" }} />}
      onContentElementChange={onContentElementChange}
      contentClassName={cn("inset-0 m-auto h-fit translate-none")}
    >
      <Stack gap="sm">
        <div inert={isInert(restrictInteractionTo, "status")} data-welcome-tour-step="update-status-applied">
          <FormField label="Status" htmlFor={`history-status-${jobId}`}>
            <Select
              value={resolvedSelectedStage}
              onValueChange={(value) => handleSelectedStageChange(value as ApplicationStage)}
              options={selectOptions}
              placeholder={`Current: ${formatStage(currentStage)}`}
              size="sm"
              onTriggerElementChange={(element) => {
                statusTriggerRef.current = element;
              }}
            />
          </FormField>
        </div>
        <div inert={isInert(restrictInteractionTo, "custom-date")} data-welcome-tour-step="update-status-custom-date">
          <label className={cn("flex cursor-pointer items-center gap-2")}>
            <Checkbox
              id={`history-schedule-check-${jobId}`}
              checked={resolvedScheduledEnabled}
              onCheckedChange={(checked) => {
                handleScheduledEnabledChange(checked);
                if (checked) {
                  setScheduledAtDraft(getDateTimeInputValueFromNow());
                }
              }}
              disabled={saving}
              onElementChange={(element) => {
                scheduleCheckboxRef.current = element;
              }}
            />
            <span className={cn("text-sm text-text-default")}>Custom date</span>
          </label>
          {resolvedScheduledEnabled && (
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
                      data-welcome-tour-step={option.label === "+3d" ? "update-status-interview" : undefined}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </Stack>
          )}
        </div>
        <div inert={restrictInteractionTo !== undefined}>
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
        </div>
        <div inert={isInert(restrictInteractionTo, "save")} className={cn("flex justify-end")}>
          <Button
            intent="primary"
            size="md"
            onClick={() => void handleSaveStatusUpdate()}
            disabled={!canSave}
            state={saving ? "loading" : "default"}
            data-welcome-tour-step="update-status-save"
          >
            Save
          </Button>
        </div>
      </Stack>
    </Dialog>
  );
}
