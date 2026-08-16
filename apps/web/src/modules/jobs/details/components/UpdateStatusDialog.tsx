"use client";

import { tryRun } from "@job-tracker/try-run";
import { Button, Checkbox, cn, Dialog, FormField, Input, Select, Stack, useControlledState } from "@job-tracker/ui";
import { useImperativeHandle, useMemo, useRef, useState } from "react";
import type { ReactElement, Ref } from "react";

import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";

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
const THREE_DAY_SCHEDULE_LABEL = "+3d";
const THREE_DAY_SCHEDULE_OFFSET = 3;

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
  onQuickScheduleOptionSelect?: (label: string) => void;
  onSaved?: () => void;
  restrictInteractionTo?: UpdateStatusDialogRestrictedTarget;
  freezeSuccessToast?: boolean;
  ref?: Ref<UpdateStatusDialogHandle>;
  onContentElementChange?: (element: HTMLDivElement | null) => void;
};

export type UpdateStatusDialogHandle = {
  save: () => void;
  focusField: (field: UpdateStatusDialogRestrictedTarget) => void;
  scheduleInThreeDays: () => void;
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
  onQuickScheduleOptionSelect,
  onSaved,
  restrictInteractionTo,
  freezeSuccessToast,
  ref,
  onContentElementChange,
}: UpdateStatusDialogProps) {
  const { enqueueToast, dismissToast } = useToastQueue();
  const lastToastIdRef = useRef<string | null>(null);
  function handleToast(
    message: string,
    intent: "success" | "error",
    options?: { lifetime?: "auto" | "manual"; welcomeTourStep?: string },
  ) {
    lastToastIdRef.current = enqueueToast({
      title: message,
      intent,
      lifetime: options?.lifetime,
      attrs: options?.welcomeTourStep ? { "data-welcome-tour-step": options.welcomeTourStep } : undefined,
    });
  }
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
  const threeDayScheduleRef = useRef<HTMLButtonElement | null>(null);

  const [createStageEvent, { loading: stageSaving }] = useCreateJobStageEvent();
  const saving = stageSaving;
  const canSave = Boolean(resolvedSelectedStage) && !saving;
  const scheduledAtValue = scheduledAtDraft.trim();
  const selectOptions = useMemo(() => stageOptions.map((option) => ({ ...option, value: option.value })), []);
  const isStatusFieldInert = isInert(restrictInteractionTo, "status");
  const isThreeDayScheduleStep = restrictInteractionTo !== undefined && !isInert(restrictInteractionTo, "schedule-3d");
  const isCustomDateFieldInert = isInert(restrictInteractionTo, "custom-date");
  const isCustomDateConfigurationInert = isCustomDateFieldInert || isThreeDayScheduleStep;
  const isReasonFieldInert = isInert(restrictInteractionTo, "reason");
  const isSaveFieldInert = isInert(restrictInteractionTo, "save");

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
      if (field === "schedule-3d") threeDayScheduleRef.current?.focus();
    },
    scheduleInThreeDays: () => {
      handleScheduledEnabledChange(true);
      setScheduledAtDraft(getDateTimeInputValueFromNow(THREE_DAY_SCHEDULE_OFFSET));
      onQuickScheduleOptionSelect?.(THREE_DAY_SCHEDULE_LABEL);
    },
    closeToast: () => {
      if (lastToastIdRef.current) dismissToast(lastToastIdRef.current);
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
    onSaved?.();
    handleToast(
      "Status update saved.",
      "success",
      freezeSuccessToast ? { lifetime: "manual", welcomeTourStep: SUCCESS_TOAST_WELCOME_TOUR_STEP } : undefined,
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
        <div inert={isStatusFieldInert} data-welcome-tour-step="update-status-applied">
          <FormField label="Status" htmlFor={`history-status-${jobId}`}>
            <Select
              value={resolvedSelectedStage}
              onValueChange={(value) => handleSelectedStageChange(value as ApplicationStage)}
              options={selectOptions}
              placeholder={`Current: ${formatStage(currentStage)}`}
              size="sm"
              tabIndex={isStatusFieldInert ? -1 : undefined}
              onTriggerElementChange={(element) => {
                statusTriggerRef.current = element;
              }}
            />
          </FormField>
        </div>
        <div inert={isCustomDateFieldInert} data-welcome-tour-step="update-status-custom-date">
          <label inert={isCustomDateConfigurationInert} className={cn("flex cursor-pointer items-center gap-2")}>
            <Checkbox
              id={`history-schedule-check-${jobId}`}
              tabIndex={isCustomDateConfigurationInert ? -1 : undefined}
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
            <Stack gap="xs" className={cn("mt-2")}>
              <div inert={isCustomDateConfigurationInert}>
                <Input
                  id={`history-scheduled-at-${jobId}`}
                  type="datetime-local"
                  size="sm"
                  value={scheduledAtDraft}
                  onChange={(event) => setScheduledAtDraft(event.target.value)}
                  tabIndex={isCustomDateConfigurationInert ? -1 : undefined}
                  disabled={saving}
                />
              </div>
              <div className={cn("flex flex-wrap gap-1")}>
                {quickScheduleOptions.map((option) => {
                  const optionValue = getDateTimeInputValueFromNow(option.offsetDays);
                  const isQuickScheduleOptionInert =
                    isCustomDateFieldInert || (isThreeDayScheduleStep && option.label !== "+3d");
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
                      onClick={() => {
                        setScheduledAtDraft(optionValue);
                        onQuickScheduleOptionSelect?.(option.label);
                      }}
                      disabled={saving}
                      tabIndex={isQuickScheduleOptionInert ? -1 : undefined}
                      inert={isQuickScheduleOptionInert}
                      onElementChange={
                        option.label === "+3d" ? (element) => (threeDayScheduleRef.current = element) : undefined
                      }
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
        <div inert={isReasonFieldInert}>
          <FormField label="Reason (optional)" htmlFor={`history-reason-${jobId}`}>
            <Input
              id={`history-reason-${jobId}`}
              type="text"
              size="sm"
              value={reasonDraft}
              onChange={(event) => setReasonDraft(event.target.value)}
              tabIndex={isReasonFieldInert ? -1 : undefined}
              disabled={saving}
              placeholder="Brief explanation for this status change"
            />
          </FormField>
        </div>
        <div inert={isSaveFieldInert} className={cn("flex justify-end")}>
          <Button
            intent="primary"
            size="md"
            onClick={() => void handleSaveStatusUpdate()}
            disabled={!canSave}
            state={saving ? "loading" : "default"}
            tabIndex={isSaveFieldInert ? -1 : undefined}
            data-welcome-tour-step="update-status-save"
          >
            Save
          </Button>
        </div>
      </Stack>
    </Dialog>
  );
}
