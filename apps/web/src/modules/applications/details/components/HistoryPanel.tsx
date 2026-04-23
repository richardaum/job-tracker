"use client";

import React from "react";
import { ArrowRightIcon, PencilSimpleIcon } from "@phosphor-icons/react";
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
  formatStage,
  getStageTimelineDotColor,
} from "@/modules/applications/details/utils/application-details.shared";
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
          <div className={cn("space-y-3")}>
            {stageEvents.map((event, index) => (
              <div key={event.id} className={cn("flex gap-3")}>
                <div
                  className={cn(
                    "relative flex w-4 shrink-0 items-center justify-center",
                  )}
                >
                  {index > 0 ? (
                    <span
                      className={cn(
                        "absolute bottom-[calc(50%+16px)] left-1/2 top-0 w-px -translate-x-1/2 bg-border-subtle",
                      )}
                    />
                  ) : null}
                  <span
                    className={cn(
                      "block h-2.5 w-2.5 shrink-0 rounded-full bg-current",
                      getStageTimelineDotColor(event.toStage),
                    )}
                  />
                  {index < stageEvents.length - 1 ? (
                    <span
                      className={cn(
                        "absolute -bottom-3 left-1/2 top-[calc(50%+16px)] w-px -translate-x-1/2 bg-border-subtle",
                      )}
                    />
                  ) : null}
                </div>
                <div
                  className={cn(
                    "flex-1 rounded-md border border-border-subtle bg-bg-surface-hover px-3 py-2",
                  )}
                >
                  <div className={cn("inline-flex items-center gap-1.5")}>
                    <Text size="sm" weight="medium">
                      {event.fromStage ? (
                        <span className={cn("inline-flex items-center gap-1")}>
                          <span>{formatStage(event.fromStage)}</span>
                          <ArrowRightIcon size={12} weight="bold" />
                          <span>{formatStage(event.toStage)}</span>
                        </span>
                      ) : (
                        formatStage(event.toStage)
                      )}
                    </Text>
                    <IconButton
                      intent="ghost"
                      size="sm"
                      label="Edit history item"
                      icon={<PencilSimpleIcon size={14} weight="regular" />}
                      className={cn("h-6 w-6 text-text-muted")}
                      onClick={() => openEditDialog(event.id)}
                      disabled={updatingStageEvent}
                    />
                  </div>
                  <Text size="xs" color="muted" className={cn("mt-1")}>
                    {event.scheduledAt
                      ? formatDate(event.scheduledAt)
                      : formatDateTime(event.createdAt)}
                  </Text>
                </div>
              </div>
            ))}
          </div>
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
                      intent={
                        scheduledAtDraft === optionValue ? "secondary" : "ghost"
                      }
                      className={cn("h-7 px-2 text-xs")}
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
