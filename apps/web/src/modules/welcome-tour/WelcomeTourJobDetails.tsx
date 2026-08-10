"use client";

import { ACTIONS, EVENTS } from "react-joyride";
import { useFeatureFlagEnabled } from "posthog-js/react";
import { useEffect, useRef, useState } from "react";
import type { Controls } from "react-joyride";

import { WelcomeTourTooltip } from "@/modules/welcome-tour/WelcomeTourTooltip";
import { WelcomeTourJoyride } from "@/modules/welcome-tour/WelcomeTourJoyride";
import type { UpdateStatusDialogRestrictedTarget } from "@/modules/jobs/details/components/update-status-dialog-inert";
import {
  WELCOME_TOUR_LABEL,
  WELCOME_TOUR_FEATURE_FLAG,
  pickWelcomeTourSteps,
  type WelcomeTourStepId,
} from "@/modules/welcome-tour/welcomeTourSteps";
import { useWelcomeTour } from "@/modules/welcome-tour/useWelcomeTour";

const UPDATE_STATUS_FIELD_TARGET = '[data-welcome-tour-step="update-status-applied"]';
const UPDATE_STATUS_CUSTOM_DATE_TARGET = '[data-welcome-tour-step="update-status-custom-date"]';
const UPDATE_STATUS_INTERVIEW_TARGET = '[data-welcome-tour-step="update-status-interview"]';

type WelcomeTourJobDetailsProps = {
  portalElement?: HTMLElement | null;
  onFieldActionsVisibilityChange: (visible: boolean) => void;
  onDescriptionOpen: () => void;
  onUpdateStatus: () => void;
  onUpdateStatusClose: () => void;
  onUpdateStatusSave: () => void;
  onStatusDialogRestrictInteractionToChange: (field: UpdateStatusDialogRestrictedTarget | undefined) => void;
  onFocusField: (field: UpdateStatusDialogRestrictedTarget) => void;
  onStatusDialogFreezeSuccessToastChange: (freeze: boolean) => void;
  onCloseStatusToast: () => void;
  onCloseJobCreatedToast: () => void;
  isStatusApplied?: boolean;
  isScreeningSelected?: boolean;
  isCustomDateEnabled?: boolean;
  selectedQuickScheduleOption?: string;
  statusDialogSaveCount: number;
};

export function WelcomeTourJobDetails({
  portalElement,
  onFieldActionsVisibilityChange,
  onDescriptionOpen,
  onUpdateStatus,
  onUpdateStatusClose,
  onUpdateStatusSave,
  onStatusDialogRestrictInteractionToChange,
  onFocusField,
  onStatusDialogFreezeSuccessToastChange,
  onCloseStatusToast,
  onCloseJobCreatedToast,
  isStatusApplied = false,
  isScreeningSelected = false,
  isCustomDateEnabled = false,
  selectedQuickScheduleOption,
  statusDialogSaveCount,
}: WelcomeTourJobDetailsProps) {
  const welcomeTourEnabled = useFeatureFlagEnabled(WELCOME_TOUR_FEATURE_FLAG);
  const { activePhase } = useWelcomeTour();
  const tourControlsRef = useRef<Controls | null>(null);
  const isCustomDateStepActiveRef = useRef(false);
  const wasCustomDateEnabledRef = useRef(isCustomDateEnabled);
  const isInterviewStepActiveRef = useRef(false);
  const previousQuickScheduleOptionRef = useRef(selectedQuickScheduleOption);
  const [isScheduledSaveStepActive, setIsScheduledSaveStepActive] = useState(false);
  const [hasScheduledStatusBeenSaved, setHasScheduledStatusBeenSaved] = useState(false);
  const previousStatusDialogSaveCountRef = useRef(statusDialogSaveCount);

  useEffect(() => {
    const wasCustomDateEnabled = wasCustomDateEnabledRef.current;
    wasCustomDateEnabledRef.current = isCustomDateEnabled;

    if (
      activePhase !== "update-status" ||
      !isCustomDateStepActiveRef.current ||
      wasCustomDateEnabled ||
      !isCustomDateEnabled
    ) {
      return;
    }

    isCustomDateStepActiveRef.current = false;
    tourControlsRef.current?.next();
  }, [activePhase, isCustomDateEnabled]);

  useEffect(() => {
    const previousQuickScheduleOption = previousQuickScheduleOptionRef.current;
    previousQuickScheduleOptionRef.current = selectedQuickScheduleOption;

    if (
      activePhase !== "update-status" ||
      !isInterviewStepActiveRef.current ||
      previousQuickScheduleOption === "+3d" ||
      selectedQuickScheduleOption !== "+3d"
    ) {
      return;
    }

    isInterviewStepActiveRef.current = false;
    tourControlsRef.current?.next();
  }, [activePhase, selectedQuickScheduleOption]);

  useEffect(() => {
    const previousStatusDialogSaveCount = previousStatusDialogSaveCountRef.current;
    previousStatusDialogSaveCountRef.current = statusDialogSaveCount;

    if (
      activePhase !== "update-status" ||
      !isScheduledSaveStepActive ||
      statusDialogSaveCount === previousStatusDialogSaveCount
    ) {
      return;
    }

    setHasScheduledStatusBeenSaved(true);
  }, [activePhase, isScheduledSaveStepActive, statusDialogSaveCount]);

  useEffect(() => {
    if (activePhase !== "update-status" || !isScheduledSaveStepActive || !hasScheduledStatusBeenSaved) {
      return;
    }

    tourControlsRef.current?.next();
  }, [activePhase, hasScheduledStatusBeenSaved, isScheduledSaveStepActive]);

  if (welcomeTourEnabled !== true || (activePhase !== "job-details" && activePhase !== "update-status")) return null;

  const stepIds: WelcomeTourStepId[] =
    activePhase === "update-status"
      ? [
          "update-status-button",
          "update-status-applied",
          "update-status-save",
          "update-status-toast",
          "update-status-reopen",
          "update-status-screening",
          "update-status-custom-date",
          "update-status-interview",
          "update-status-scheduled-save",
        ]
      : [
          "job-created-toast",
          "job-detail-title",
          "job-status",
          "job-company",
          "job-field-actions",
          "job-description-tab",
        ];
  const steps = pickWelcomeTourSteps(stepIds, WELCOME_TOUR_LABEL, {
    "job-created-toast": {
      after: ({ action }) => {
        if (action === ACTIONS.NEXT) onCloseJobCreatedToast();
      },
    },
    "job-field-actions": {
      before: async () => onFieldActionsVisibilityChange(true),
      after: () => onFieldActionsVisibilityChange(false),
    },
    "update-status-button": {
      after: ({ action }) => {
        if (action === ACTIONS.NEXT) onUpdateStatus();
      },
    },
    "update-status-applied": {
      disablePrimary: !isStatusApplied,
      before: async () => onStatusDialogRestrictInteractionToChange("status"),
      after: ({ action }) => {
        onStatusDialogRestrictInteractionToChange(undefined);
        if (action === ACTIONS.PREV) onUpdateStatusClose();
      },
    },
    "update-status-save": {
      before: async () => {
        onStatusDialogRestrictInteractionToChange("save");
        onStatusDialogFreezeSuccessToastChange(true);
      },
      after: ({ action }) => {
        onStatusDialogRestrictInteractionToChange(undefined);
        if (action === ACTIONS.NEXT) onUpdateStatusSave();
      },
    },
    "update-status-toast": {
      after: () => {
        onStatusDialogFreezeSuccessToastChange(false);
        onCloseStatusToast();
      },
    },
    "update-status-reopen": {
      after: ({ action }) => {
        if (action === ACTIONS.NEXT) onUpdateStatus();
      },
    },
    "update-status-screening": {
      disablePrimary: !isScreeningSelected,
      before: async () => onStatusDialogRestrictInteractionToChange("status"),
      after: () => onStatusDialogRestrictInteractionToChange(undefined),
    },
    "update-status-custom-date": {
      disablePrimary: !isCustomDateEnabled,
      before: async () => onStatusDialogRestrictInteractionToChange("custom-date"),
      after: () => onStatusDialogRestrictInteractionToChange(undefined),
    },
    "update-status-interview": {
      before: async () => onStatusDialogRestrictInteractionToChange("schedule-3d"),
      after: () => onStatusDialogRestrictInteractionToChange(undefined),
    },
    "update-status-scheduled-save": {
      before: async () => {
        setIsScheduledSaveStepActive(true);
        setHasScheduledStatusBeenSaved(false);
        onStatusDialogRestrictInteractionToChange("save");
      },
      after: ({ action }) => {
        onStatusDialogRestrictInteractionToChange(undefined);
        if (action === ACTIONS.NEXT && !hasScheduledStatusBeenSaved) onUpdateStatusSave();
      },
    },
  });

  return (
    <WelcomeTourJoyride
      run
      continuous
      steps={steps}
      portalElement={portalElement ?? undefined}
      onSegmentComplete={activePhase === "job-details" ? onDescriptionOpen : undefined}
      onEvent={(event, controls) => {
        tourControlsRef.current = controls;
        if (event.type === EVENTS.TOUR_END) {
          onCloseJobCreatedToast();
          return;
        }
        if (event.type !== EVENTS.TOOLTIP) return;
        isCustomDateStepActiveRef.current = event.step.target === UPDATE_STATUS_CUSTOM_DATE_TARGET;
        isInterviewStepActiveRef.current = event.step.target === UPDATE_STATUS_INTERVIEW_TARGET;
        if (event.step.target === UPDATE_STATUS_FIELD_TARGET) {
          onFocusField("status");
        }
        if (event.step.target === UPDATE_STATUS_CUSTOM_DATE_TARGET) {
          onFocusField("custom-date");
        }
        if (event.step.target === UPDATE_STATUS_INTERVIEW_TARGET) {
          onFocusField("schedule-3d");
        }
      }}
      locale={{ last: "Got it" }}
      options={{
        buttons: ["primary"],
        skipBeacon: true,
        overlayColor: "var(--semantic-color-overlay-backdrop)",
        overlayClickAction: false,
        dismissKeyAction: false,
        spotlightPadding: 8,
        spotlightRadius: 10,
      }}
      floatingOptions={{ hideArrow: true }}
      styles={{
        floater: { pointerEvents: "auto", zIndex: 1000 },
        overlay: { position: portalElement ? "fixed" : "absolute" },
      }}
      tooltipComponent={WelcomeTourTooltip}
    />
  );
}
