"use client";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { to } from "@job-tracker/async";
import {
  Button,
  cn,
  ConfirmDialog,
  Dialog,
  FormField,
  IconButton,
  Input,
  Select,
  Stack,
  TabsContent,
} from "@job-tracker/ui";
import {
  ChatCircleTextIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import React from "react";

import { EmptyState } from "@/components/empty-state";
import {
  ApplicationStage,
  ApplicationStageEventsDocument,
  useApplicationStageEventsQuery,
  useUpdateApplicationStageEventMutation,
} from "@/gql/hooks";
import { formatDateTime } from "@/modules/applications/details/utils/application-details.shared";
import {
  buildScheduledAtWithBrowserTimezone,
  getDateTimeInputValueFromIso,
  getDateTimeInputValueFromNow,
} from "@/modules/applications/details/utils/scheduled-at";
import { StageTimeline } from "@/modules/applications/shared/components/StageTimeline";

import { UpdateStatusAction } from "./UpdateStatusAction";

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

const DeleteApplicationStageEventDocument = gql`
  mutation DeleteApplicationStageEvent($id: ID!) {
    deleteApplicationStageEvent(id: $id)
  }
`;

export function HistoryPanel({
  applicationId,
  onSuccess,
  onError,
}: {
  applicationId: string;
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
  const [reasonDraft, setReasonDraft] = React.useState("");

  const { data: eventsData } = useApplicationStageEventsQuery({
    variables: { applicationId },
    fetchPolicy: "cache-and-network",
  });
  const [updateStageEvent, { loading: updatingStageEvent }] =
    useUpdateApplicationStageEventMutation({
      refetchQueries: [
        { query: ApplicationStageEventsDocument, variables: { applicationId } },
      ],
    });
  const [deleteStageEvent, { loading: deletingStageEvent }] = useMutation(
    DeleteApplicationStageEventDocument,
    {
      refetchQueries: [
        { query: ApplicationStageEventsDocument, variables: { applicationId } },
      ],
    },
  );

  const stageEvents = eventsData?.applicationStageEvents ?? [];
  const currentStage = stageEvents[0]?.toStage ?? ApplicationStage.New;
  const editingEvent = stageEvents.find((event) => event.id === editingEventId);
  const isMutatingStageEvent = updatingStageEvent || deletingStageEvent;
  const canSaveEdit = Boolean(
    editingEvent && selectedStage && !isMutatingStageEvent,
  );

  function openEditDialog(eventId: string) {
    const event = stageEvents.find((candidate) => candidate.id === eventId);
    if (!event) return;
    const fallbackIsoValue = event.scheduledAt ?? event.createdAt ?? null;
    const nextScheduledAtDraft =
      getDateTimeInputValueFromIso(fallbackIsoValue) ||
      getDateTimeInputValueFromNow();
    setEditingEventId(event.id);
    setSelectedStage(event.toStage);
    setScheduledAtDraft(nextScheduledAtDraft);
    setReasonDraft(event.reason ?? "");
  }

  function closeEditDialog() {
    setEditingEventId(null);
    setSelectedStage(undefined);
    setScheduledAtDraft("");
    setReasonDraft("");
  }

  async function handleSaveEdit() {
    if (!editingEventId || !selectedStage) return;

    const [error] = await to(
      updateStageEvent({
        variables: {
          id: editingEventId,
          input: {
            toStage: selectedStage,
            scheduledAt: buildScheduledAtWithBrowserTimezone(
              scheduledAtDraft.trim(),
            ),
            reason: reasonDraft.trim() || null,
          },
        },
      }),
    );
    if (error) {
      onError?.("Could not update history item.");
      return;
    }
    closeEditDialog();
    onSuccess?.("History item updated.");
  }

  async function handleDeleteEvent(eventId: string) {
    if (isMutatingStageEvent) return;

    const [error] = await to(deleteStageEvent({ variables: { id: eventId } }));
    if (error) {
      onError?.("Could not remove history item.");
      throw new Error("Could not remove history item.");
    }
    if (editingEventId === eventId) {
      closeEditDialog();
    }
    onSuccess?.("History item removed.");
  }

  return (
    <>
      <div className={cn("h-full min-h-0 overflow-auto pr-1")}>
        <div className={cn("mb-2")}>
          <UpdateStatusAction
            applicationId={applicationId}
            currentStage={currentStage}
            onSuccess={onSuccess}
            onError={onError}
            trigger={
              <Button intent="secondary" size="md" className={cn("w-full")}>
                Update status
              </Button>
            }
          />
          <div className={cn("mt-2 border-t border-border-subtle")} />
        </div>

        {stageEvents.length === 0 ? (
          <EmptyState variant="panel" message="No stage events yet." />
        ) : (
          <StageTimeline
            items={stageEvents.map((event) => ({
              id: event.id,
              fromStage: event.fromStage,
              toStage: event.toStage,
              reason: event.reason ?? null,
              dateLabel: event.scheduledAt
                ? formatDateTime(event.scheduledAt)
                : formatDateTime(event.createdAt),
            }))}
            renderItemAction={(item) => (
              <div className={cn("flex items-center")}>
                {item.reason ? (
                  <IconButton
                    intent="ghost"
                    size="sm"
                    label="History reason"
                    tooltip={item.reason}
                    icon={<ChatCircleTextIcon size={14} weight="regular" />}
                    className={cn("size-6  text-text-muted")}
                  />
                ) : null}
                <IconButton
                  intent="ghost"
                  size="sm"
                  label="Edit history item"
                  tooltip="Edit history item"
                  icon={<PencilSimpleIcon size={14} weight="regular" />}
                  className={cn("size-6  text-text-muted")}
                  onClick={() => openEditDialog(item.id)}
                  disabled={isMutatingStageEvent}
                />
                <ConfirmDialog
                  title="Delete history event?"
                  description="This action cannot be undone."
                  confirmLabel="Delete"
                  onConfirm={() => handleDeleteEvent(item.id)}
                  trigger={
                    <IconButton
                      intent="ghost"
                      size="sm"
                      label="Delete history item"
                      tooltip="Delete history item"
                      icon={<TrashIcon size={14} weight="regular" />}
                      className={cn("size-6  text-text-muted")}
                      disabled={isMutatingStageEvent}
                    />
                  }
                />
              </div>
            )}
          />
        )}
      </div>
      <Dialog
        title="Edit history item"
        description="Adjust the stage event details, including status, schedule, and reason."
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
                type="datetime-local"
                size="sm"
                value={scheduledAtDraft}
                onChange={(event) => setScheduledAtDraft(event.target.value)}
                disabled={isMutatingStageEvent}
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
                      disabled={isMutatingStageEvent}
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
            htmlFor={`edit-history-reason-${applicationId}`}
          >
            <Input
              id={`edit-history-reason-${applicationId}`}
              type="text"
              size="sm"
              value={reasonDraft}
              onChange={(event) => setReasonDraft(event.target.value)}
              disabled={isMutatingStageEvent}
              placeholder="Brief explanation for status change"
            />
          </FormField>
          <div className={cn("flex justify-end")}>
            <Button
              intent="primary"
              size="md"
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

export function HistoryPanelTabsContent({
  applicationId,
  className,
  onSuccess,
  onError,
}: {
  applicationId: string;
  className?: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}) {
  return (
    <TabsContent
      value="history"
      className={cn("flex-1 min-h-0 overflow-hidden", className)}
    >
      <HistoryPanel
        applicationId={applicationId}
        onSuccess={onSuccess}
        onError={onError}
      />
    </TabsContent>
  );
}
