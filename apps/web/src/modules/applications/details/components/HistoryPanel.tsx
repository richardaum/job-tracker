"use client";

import React from "react";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import {
  Button,
  Dialog,
  FormField,
  IconButton,
  Input,
  Select,
  Stack,
  Text,
  cn,
} from "@job-tracker/ui";
import {
  ApplicationStage,
  ApplicationStageEventsDocument,
  useApplicationStageEventsQuery,
  useUpdateApplicationStageEventMutation,
} from "@/gql/hooks";
import {
  buildScheduledAtWithBrowserTimezone,
  getDateInputValueFromToday,
} from "@/modules/applications/details/utils/scheduled-at";
import {
  formatDate,
  formatDateTime,
} from "@/modules/applications/details/utils/application-details.shared";
import { StageTimeline } from "@/modules/applications/shared/components/StageTimeline";
import { UpdateStatusAction } from "./UpdateStatusAction";

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

function toDateInputValue(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function HistoryPanel({
  applicationId,
  fillHeight = false,
  onSuccess,
  onError,
}: {
  applicationId: string;
  fillHeight?: boolean;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}) {
  const [editingEventId, setEditingEventId] = React.useState<string | null>(
    null,
  );
  const [selectedStage, setSelectedStage] = React.useState<
    ApplicationStage | undefined
  >();
  const [scheduledAtDraft, setScheduledAtDraft] = React.useState("");

  const { data: eventsData } = useApplicationStageEventsQuery({
    variables: { applicationId },
    fetchPolicy: "cache-and-network",
  });
  const [updateStageEvent, { loading: updatingStageEvent }] =
    useUpdateApplicationStageEventMutation({
      refetchQueries: [
        {
          query: ApplicationStageEventsDocument,
          variables: { applicationId },
        },
      ],
    });

  const stageEvents = eventsData?.applicationStageEvents ?? [];
  const currentStage = stageEvents[0]?.toStage ?? ApplicationStage.New;
  const editingEvent = stageEvents.find((event) => event.id === editingEventId);
  const canSaveEdit = Boolean(
    editingEvent && selectedStage && !updatingStageEvent,
  );

  function openEditDialog(eventId: string) {
    const event = stageEvents.find((candidate) => candidate.id === eventId);
    if (!event) return;
    setEditingEventId(event.id);
    setSelectedStage(event.toStage);
    setScheduledAtDraft(toDateInputValue(event.scheduledAt));
  }

  function closeEditDialog() {
    setEditingEventId(null);
    setSelectedStage(undefined);
    setScheduledAtDraft("");
  }

  async function handleSaveEdit() {
    if (!editingEventId || !selectedStage) return;

    try {
      await updateStageEvent({
        variables: {
          id: editingEventId,
          input: {
            toStage: selectedStage,
            scheduledAt: buildScheduledAtWithBrowserTimezone(
              scheduledAtDraft.trim(),
            ),
          },
        },
      });
      closeEditDialog();
      onSuccess?.("History item updated.");
    } catch {
      onError?.("Could not update history item.");
    }
  }

  return (
    <>
      <div
        className={cn(
          "overflow-auto pr-1",
          fillHeight ? "h-full min-h-0" : "max-h-[65vh]",
        )}
      >
        <div className={cn("mb-2")}>
          <UpdateStatusAction
            applicationId={applicationId}
            currentStage={currentStage}
            onSuccess={onSuccess}
            onError={onError}
            trigger={
              <Button intent="secondary" size="sm" className={cn("w-full")}>
                Update status
              </Button>
            }
          />
          <div className={cn("mt-2 border-t border-border-subtle")} />
        </div>

        {stageEvents.length === 0 ? (
          <Text size="sm" color="muted">
            No stage events yet.
          </Text>
        ) : (
          <StageTimeline
            items={stageEvents.map((event) => ({
              id: event.id,
              fromStage: event.fromStage,
              toStage: event.toStage,
              dateLabel: event.scheduledAt
                ? formatDate(event.scheduledAt)
                : formatDateTime(event.createdAt),
            }))}
            renderItemAction={(item) => (
              <IconButton
                intent="ghost"
                size="sm"
                label="Edit history item"
                tooltip="Edit history item"
                icon={<PencilSimpleIcon size={14} weight="regular" />}
                className={cn("h-6 w-6 text-text-muted")}
                onClick={() => openEditDialog(item.id)}
                disabled={updatingStageEvent}
              />
            )}
          />
        )}
      </div>
      <Dialog
        title="Edit history item"
        open={Boolean(editingEvent)}
        onOpenChange={(open) => {
          if (!open) closeEditDialog();
        }}
        trigger={<span aria-hidden style={{ display: "none" }} />}
      >
        <Stack gap="sm">
          <FormField
            label="Status"
            htmlFor={`edit-history-status-${applicationId}`}
          >
            <Select
              value={selectedStage}
              onValueChange={(value) =>
                setSelectedStage(value as ApplicationStage)
              }
              options={stageOptions}
              size="sm"
            />
          </FormField>
          <FormField
            label="Scheduled at (optional)"
            htmlFor={`edit-history-scheduled-at-${applicationId}`}
          >
            <Stack gap="xs">
              <Input
                id={`edit-history-scheduled-at-${applicationId}`}
                type="date"
                size="sm"
                value={scheduledAtDraft}
                onChange={(event) => setScheduledAtDraft(event.target.value)}
                disabled={updatingStageEvent}
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
                      intent="outlined"
                      className={cn(
                        "h-7 px-2 text-xs",
                        scheduledAtDraft === optionValue &&
                          "border-border-brand bg-bg-brand-subtle text-text-brand hover:bg-bg-brand-subtle",
                      )}
                      onClick={() => setScheduledAtDraft(optionValue)}
                      disabled={updatingStageEvent}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </Stack>
          </FormField>
          <div className={cn("flex justify-end")}>
            <Button
              intent="primary"
              size="sm"
              onClick={() => void handleSaveEdit()}
              disabled={!canSaveEdit}
              state={updatingStageEvent ? "loading" : "default"}
            >
              Save
            </Button>
          </div>
        </Stack>
      </Dialog>
    </>
  );
}
