"use client";

import React, { useMemo, useState } from "react";
import {
  Button,
  FormField,
  Input,
  Popover,
  Select,
  Stack,
  Text,
  cn,
} from "@job-tracker/ui";
import {
  ApplicationStage,
  ApplicationStageEventsDocument,
  useApplicationStageEventsQuery,
  useCreateApplicationStageEventMutation,
} from "@/gql/hooks";
import {
  buildScheduledAtWithBrowserTimezone,
  getDateInputValueFromToday,
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
  { label: "Today", offsetDays: 0 },
  { label: "Tomorrow", offsetDays: 1 },
  { label: "+2d", offsetDays: 2 },
  { label: "+3d", offsetDays: 3 },
] as const;

function formatStage(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

interface ApplicationTrackingPanelProps {
  applicationId: string;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function ApplicationTrackingPanel({
  applicationId,
  onSuccess,
  onError,
}: ApplicationTrackingPanelProps) {
  const { data: stageData } = useApplicationStageEventsQuery({
    variables: { applicationId },
    fetchPolicy: "cache-and-network",
  });

  const [createStageEvent, { loading: stageSaving }] =
    useCreateApplicationStageEventMutation({
      refetchQueries: [
        {
          query: ApplicationStageEventsDocument,
          variables: { applicationId },
        },
      ],
    });

  const stageEvents = useMemo(
    () => stageData?.applicationStageEvents ?? [],
    [stageData?.applicationStageEvents],
  );
  const latestEvent = stageEvents.at(-1);
  const [selectedStageDraft, setSelectedStageDraft] =
    useState<ApplicationStage | null>(null);
  const [scheduledAtDraft, setScheduledAtDraft] = useState<string | null>(null);

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
          },
        },
      });
      setScheduledAtDraft(null);
      setSelectedStageDraft(null);
      onSuccess("Status update saved.");
    } catch {
      onError("Could not save status update.");
    }
  }

  return (
    <Stack gap="sm" className={cn("mt-3 border-t border-border-subtle pt-3")}>
      <Stack direction="row" gap="xs" className={cn("flex-wrap")}>
        <Popover
          trigger={
            <Button intent="secondary" size="sm">
              Update status
            </Button>
          }
          align="start"
        >
          <div className={cn("w-80 p-1")}>
            <Stack gap="xs">
              <FormField label="Status" htmlFor={`status-${applicationId}`}>
                <Select
                  value={selectedStage}
                  onValueChange={(value) =>
                    setSelectedStageDraft(value as ApplicationStage)
                  }
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
                        type="date"
                        size="sm"
                        value={scheduledAtValue}
                        onChange={(event) =>
                          setScheduledAtDraft(event.target.value)
                        }
                        disabled={statusSaving}
                      />
                      <div className={cn("flex flex-wrap gap-1")}>
                        {quickScheduleOptions.map((option) => {
                          const optionValue = getDateInputValueFromToday(
                            option.offsetDays,
                          );
                          return (
                            <Button
                              key={option.label}
                              type="button"
                              size="sm"
                              intent={
                                scheduledAtValue === optionValue
                                  ? "secondary"
                                  : "ghost"
                              }
                              className={cn("h-7 px-2 text-xs")}
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
      </Stack>
    </Stack>
  );
}
