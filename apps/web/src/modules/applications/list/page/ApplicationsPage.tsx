"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import {
  Button,
  Card,
  DropdownMenu,
  IconButton,
  Link,
  Skeleton,
  Stack,
  Text,
  Toast,
  cn,
} from "@job-tracker/ui";
import {
  ArrowSquareRightIcon,
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
import { useQuickFilter } from "@/modules/applications/list/hooks/useQuickFilter";
import { ApplicationQuickEditModal } from "@/modules/applications/list/components/ApplicationQuickEditModal";
import { ApplicationTrackingPanel } from "@/modules/applications/list/components/ApplicationTrackingPanel";
import { DeleteApplicationDialog } from "@/modules/applications/list/components/DeleteApplicationDialog";
import {
  formatStage,
  StatusBadge,
} from "@/modules/applications/shared/components/StatusBadge";
import { StageTimeline } from "@/modules/applications/shared/components/StageTimeline";
import { tipTapToPlainText } from "@/modules/applications/shared/utils/tiptap";
import { CompensationRow } from "@/modules/applications/shared/utils/CompensationRow";
import { ApplicationTags } from "@/modules/applications/shared/utils/ApplicationTags";
import {
  formatCompensationLine,
  hasCompensationOnCard,
} from "@/modules/applications/shared/utils/compensationFormat";
import { QuickFilters } from "@/modules/applications/list/components/QuickFilters";

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

function ApplicationListCardSkeleton() {
  return (
    <Card padding="sm">
      <div
        className={cn(
          "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <div className={cn("flex min-w-0 flex-col gap-1")}>
          <div className={cn("flex min-w-0 flex-wrap items-center gap-2")}>
            <Skeleton
              variant="text"
              className={cn("h-5 w-[min(12rem,100%)] max-w-full")}
            />
            <Skeleton className={cn("h-6 w-20 shrink-0 rounded-full")} />
            <div className={cn("flex items-center gap-1")}>
              <Skeleton className={cn("size-6 rounded-sm")} />
              <Skeleton className={cn("size-6 rounded-sm")} />
              <Skeleton className={cn("size-6 rounded-sm")} />
            </div>
          </div>
          <div className={cn("flex flex-wrap items-center gap-2")}>
            <Skeleton variant="text" className={cn("h-4 w-28 max-w-full")} />
            <Skeleton variant="text" className={cn("h-4 w-44 max-w-full")} />
            <Skeleton variant="text" className={cn("h-4 w-24 max-w-full")} />
          </div>
          <div className={cn("space-y-1")}>
            <Skeleton variant="text" className={cn("h-4 w-full max-w-2xl")} />
            <Skeleton variant="text" className={cn("h-4 w-full max-w-lg")} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function ApplicationsListSkeleton({ count = 3 }: { count?: number } = {}) {
  return (
    <Stack gap="sm">
      {Array.from({ length: count }, (_, i) => (
        <ApplicationListCardSkeleton key={i} />
      ))}
    </Stack>
  );
}

function ApplicationsListError() {
  return (
    <Text size="sm" color="error">
      Failed to load applications. Please refresh the page.
    </Text>
  );
}

function ApplicationsListEmpty() {
  return (
    <Card variant="outlined">
      <Stack align="center" justify="center" gap="sm">
        <Text size="sm" color="secondary">
          No applications yet. Add your first one!
        </Text>
      </Stack>
    </Card>
  );
}

export default function ApplicationsPage() {
  const activeFilter = useQuickFilter();

  const { data, loading, error } = useApplicationsQuery({
    fetchPolicy: "cache-and-network",
    variables: { filter: activeFilter },
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
          <ApplicationQuickEditModal
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

      {/* Quick filters */}
      <QuickFilters />

      {/* Content */}
      <div className={cn("flex-1 overflow-auto p-4 sm:p-6")}>
        {loading && !data ? (
          <ApplicationsListSkeleton />
        ) : error ? (
          <ApplicationsListError />
        ) : applications.length === 0 ? (
          <ApplicationsListEmpty />
        ) : (
          <Stack gap="sm">
            {applications.map((app) => {
              const descriptionPreview = tipTapToPlainText(app.description);
              const compLine = formatCompensationLine({
                salaryMinCents: app.salaryMinCents,
                salaryMaxCents: app.salaryMaxCents,
                salaryCurrency: app.salaryCurrency,
                salaryPeriod: app.salaryPeriod,
              });
              const compTags = app.tags ?? [];
              const showComp = hasCompensationOnCard({
                line: compLine,
                tags: compTags,
              });

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
                        <div className={cn("flex items-center gap-1")}>
                          <CurrentStageBadge applicationId={app.id} />
                          <ApplicationQuickEditModal
                            trigger={
                              <IconButton
                                intent="ghost"
                                size="sm"
                                label={`Quick edit ${app.title}`}
                                tooltip="Quick edit"
                                className={cn(
                                  "h-6 w-6 text-text-muted/80 hover:text-text-muted",
                                )}
                                icon={
                                  <PencilSimpleIcon
                                    size={13}
                                    weight="regular"
                                  />
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
                                tooltip="Delete"
                                className={cn(
                                  "h-6 w-6 text-text-muted/80 hover:text-text-muted",
                                )}
                                icon={<TrashIcon size={13} weight="regular" />}
                              />
                            }
                            applicationId={app.id}
                            applicationTitle={app.title}
                            onSuccess={(msg) => showToast(msg, "success")}
                            onError={(msg) => showToast(msg, "error")}
                          />
                          <ApplicationTrackingPanel
                            inline
                            applicationId={app.id}
                            triggerIcon={
                              <ArrowSquareRightIcon
                                size={13}
                                weight="regular"
                              />
                            }
                            onSuccess={(msg) => showToast(msg, "success")}
                            onError={(msg) => showToast(msg, "error")}
                          />
                        </div>
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
                        {showComp ? (
                          <>
                            <span className={cn("text-text-muted")} aria-hidden>
                              ·
                            </span>
                            <span
                              className={cn(
                                "inline-flex min-w-0 max-w-full flex-wrap items-center gap-2",
                              )}
                            >
                              {compLine ? (
                                <Text
                                  as="span"
                                  size="sm"
                                  color="success"
                                  className={cn("min-w-0")}
                                >
                                  {compLine}
                                </Text>
                              ) : null}
                              <CompensationRow
                                currency={compLine ? null : app.salaryCurrency}
                                period={compLine ? null : app.salaryPeriod}
                                omitPeriodCurrency={Boolean(compLine)}
                              />
                              <ApplicationTags
                                tags={compTags}
                                maxTagChips={3}
                              />
                            </span>
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
                  </div>
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
