"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import {
  Button,
  Card,
  DropdownMenu,
  Heading,
  IconButton,
  Link,
  Skeleton,
  Stack,
  Text,
  Toast,
  cn,
} from "@job-tracker/ui";
import {
  BellIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import {
  ApplicationStage,
  useApplicationStageEventsQuery,
  useApplicationsQuery,
} from "@/gql/hooks";
import { ApplicationFormDialog } from "@/modules/applications/list/components/ApplicationFormDialog";
import { ApplicationTrackingPanel } from "@/modules/applications/list/components/ApplicationTrackingPanel";
import { DeleteApplicationDialog } from "@/modules/applications/list/components/DeleteApplicationDialog";
import {
  formatStage,
  StatusBadge,
} from "@/modules/applications/shared/components/StatusBadge";
import { StageTimeline } from "@/modules/applications/shared/components/StageTimeline";
import { tipTapToPlainText } from "@/modules/applications/shared/utils/tiptap";

interface ToastState {
  open: boolean;
  message: string;
  intent: "success" | "error";
}

function CurrentStageBadge({ applicationId }: { applicationId: string }) {
  const { data } = useApplicationStageEventsQuery({
    variables: { applicationId },
    fetchPolicy: "cache-first",
  });
  const events = data?.applicationStageEvents ?? [];
  const latestStage = events[0]?.toStage ?? ApplicationStage.New;
  const timelineItems = events.map((event) => ({
    id: event.id,
    fromStage: event.fromStage,
    toStage: event.toStage,
    dateLabel: new Date(event.scheduledAt ?? event.createdAt).toLocaleString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    ),
  }));

  return (
    <DropdownMenu
      align="start"
      trigger={
        <button
          type="button"
          className={cn(
            "inline-flex items-center rounded-full border-0 bg-transparent p-0 leading-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-0",
          )}
          aria-label={`Open status history for ${formatStage(latestStage)}`}
        >
          <StatusBadge
            stage={latestStage}
            className={cn("transition-all hover:brightness-95")}
          />
        </button>
      }
    >
      <div className={cn("w-72 p-1.5")}>
        <Stack gap="sm">
          <Text size="sm" weight="semibold">
            Status history
          </Text>
          <StageTimeline items={timelineItems} variant="compact" />
        </Stack>
      </div>
    </DropdownMenu>
  );
}

function CurrentStageDateText({
  applicationId,
  fallbackCreatedAt,
}: {
  applicationId: string;
  fallbackCreatedAt: string;
}) {
  const { data } = useApplicationStageEventsQuery({
    variables: { applicationId },
    fetchPolicy: "cache-first",
  });
  const events = data?.applicationStageEvents ?? [];
  const currentStageEvent = events[0] ?? null;
  const currentStage = currentStageEvent?.toStage ?? ApplicationStage.New;
  const statusAt =
    currentStageEvent?.scheduledAt ??
    currentStageEvent?.createdAt ??
    fallbackCreatedAt;
  return (
    <Text as="span" size="sm" color="secondary">
      {formatStage(currentStage)}{" "}
      {new Date(statusAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}
    </Text>
  );
}

export default function ApplicationsPage() {
  const { data, loading, error } = useApplicationsQuery({
    fetchPolicy: "cache-and-network",
  });

  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    intent: "success",
  });

  function showToast(message: string, intent: "success" | "error") {
    setToast({ open: true, message, intent });
  }

  const applications = data?.applications ?? [];

  return (
    <div className={cn("flex h-full flex-col")}>
      {/* Page header */}
      <div
        className={cn(
          "flex flex-col gap-4 border-b border-border-subtle px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5",
        )}
      >
        <div className={cn("min-w-0")}>
          <Heading as="h1" size="2xl">
            Applications
          </Heading>
          <Text size="sm" color="secondary" className={cn("mt-1")}>
            Track and manage your job applications
          </Text>
        </div>

        <div
          className={cn(
            "flex items-center justify-between gap-3 sm:justify-end sm:gap-4",
          )}
        >
          <IconButton
            intent="ghost"
            size="sm"
            label="Notifications"
            icon={<BellIcon size={18} />}
          />
        </div>
      </div>

      {/* Action bar */}
      <div
        className={cn(
          "flex flex-col gap-3 border-b border-border-subtle px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        )}
      >
        <div
          className={cn(
            "flex w-full items-center gap-2 rounded-md border border-border-subtle bg-bg-surface-hover px-3 py-2 sm:max-w-sm",
          )}
        >
          <MagnifyingGlassIcon
            size={14}
            weight="regular"
            className={cn("shrink-0 text-text-muted")}
          />
          <Text
            as="span"
            size="sm"
            color="muted"
            className={cn("min-w-0 flex-1")}
          >
            Search applications...
          </Text>
          <span
            className={cn(
              "rounded border border-border-subtle px-1.5 py-0.5 text-xs text-text-muted",
            )}
          >
            ⌘/
          </span>
        </div>

        <div className={cn("w-full sm:w-auto")}>
          <ApplicationFormDialog
            trigger={
              <Button
                intent="primary"
                size="sm"
                leftIcon={<PlusIcon size={16} weight="bold" />}
                className={cn("w-full sm:w-auto")}
              >
                New application
              </Button>
            }
            onSuccess={(msg) => showToast(msg, "success")}
            onError={(msg) => showToast(msg, "error")}
          />
        </div>
      </div>

      {/* Content */}
      <div className={cn("flex-1 overflow-auto p-4 sm:p-6")}>
        {loading && !data ? (
          <Stack gap="sm">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} padding="xs">
                <Stack gap="xs">
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                </Stack>
              </Card>
            ))}
          </Stack>
        ) : error ? (
          <Text size="sm" color="error">
            Failed to load applications. Please refresh the page.
          </Text>
        ) : applications.length === 0 ? (
          <Card variant="outlined">
            <Stack align="center" justify="center" gap="sm">
              <Text size="sm" color="secondary">
                No applications yet. Add your first one!
              </Text>
            </Stack>
          </Card>
        ) : (
          <Stack gap="sm">
            {applications.map((app) => {
              const descriptionPreview = tipTapToPlainText(app.description);

              return (
                <Card key={app.id} padding="sm">
                  <div
                    className={cn(
                      "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
                    )}
                  >
                    <div className={cn("flex min-w-0 flex-col gap-1")}>
                      <div
                        className={cn(
                          "flex min-w-0 flex-wrap items-center gap-2",
                        )}
                      >
                        <NextLink
                          href={`/applications/${app.id}`}
                          className={cn(
                            "text-base font-medium text-text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-0 rounded-sm",
                          )}
                        >
                          {app.title}
                        </NextLink>
                        <CurrentStageBadge applicationId={app.id} />
                      </div>
                      <div className={cn("flex flex-wrap items-center gap-2")}>
                        <Text as="span" size="sm" color="secondary">
                          {app.company}
                        </Text>
                        <span className={cn("text-text-muted")} aria-hidden>
                          ·
                        </span>
                        <CurrentStageDateText
                          applicationId={app.id}
                          fallbackCreatedAt={app.createdAt}
                        />
                        {app.url ? (
                          <>
                            <span className={cn("text-text-muted")} aria-hidden>
                              ·
                            </span>
                            <Link href={app.url} variant="default">
                              View posting
                            </Link>
                          </>
                        ) : null}
                      </div>
                      {descriptionPreview ? (
                        <Text
                          size="sm"
                          color="muted"
                          className={cn("line-clamp-2")}
                        >
                          {descriptionPreview}
                        </Text>
                      ) : null}
                    </div>

                    <div
                      className={cn(
                        "flex items-center gap-2 self-end sm:self-auto",
                      )}
                    >
                      <ApplicationFormDialog
                        trigger={
                          <IconButton
                            intent="ghost"
                            size="sm"
                            label={`Edit ${app.title}`}
                            icon={
                              <PencilSimpleIcon size={16} weight="regular" />
                            }
                          />
                        }
                        application={{
                          id: app.id,
                          title: app.title,
                          company: app.company,
                          url: app.url,
                        }}
                        onSuccess={(msg) => showToast(msg, "success")}
                        onError={(msg) => showToast(msg, "error")}
                      />
                      <DeleteApplicationDialog
                        trigger={
                          <IconButton
                            intent="ghost"
                            size="sm"
                            label={`Delete ${app.title}`}
                            icon={<TrashIcon size={16} weight="regular" />}
                          />
                        }
                        applicationId={app.id}
                        applicationTitle={app.title}
                        onSuccess={(msg) => showToast(msg, "success")}
                        onError={(msg) => showToast(msg, "error")}
                      />
                    </div>
                  </div>
                  <ApplicationTrackingPanel
                    applicationId={app.id}
                    onSuccess={(msg) => showToast(msg, "success")}
                    onError={(msg) => showToast(msg, "error")}
                  />
                </Card>
              );
            })}
          </Stack>
        )}
      </div>

      <Toast
        trigger={<span aria-hidden style={{ display: "none" }} />}
        open={toast.open}
        onOpenChange={(open) => setToast((t) => ({ ...t, open }))}
        title={toast.message}
        intent={toast.intent}
      />
    </div>
  );
}
