"use client";

import React from "react";
import NextLink from "next/link";
import {
  Card,
  DropdownMenu,
  IconButton,
  Link,
  Stack,
  Text,
  cn,
} from "@job-tracker/ui";
import {
  ArrowSquareRightIcon,
  CurrencyDollarIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import {
  ApplicationStage,
  type ApplicationStageEventsQuery,
  SalaryPeriod,
  useApplicationStageEventsQuery,
} from "@/gql/hooks";
import { ApplicationQuickEditModal } from "@/modules/applications/list/components/ApplicationQuickEditModal";
import { DeleteApplicationDialog } from "@/modules/applications/list/components/DeleteApplicationDialog";
import { ApplicationTrackingPanel } from "@/modules/applications/list/components/ApplicationTrackingPanel";
import { CompensationEditDialog } from "@/modules/applications/details/components/CompensationEditDialog";
import {
  StatusBadge,
  formatStage,
} from "@/modules/applications/shared/components/StatusBadge";
import { StageTimeline } from "@/modules/applications/shared/components/StageTimeline";
import { CompanyNameWithPopover } from "@/modules/applications/shared/components/CompanyNameWithPopover";
import { tipTapToPlainText } from "@/modules/applications/shared/utils/tiptap";
import { CompensationRow } from "@/modules/applications/shared/utils/CompensationRow";
import { ApplicationTags } from "@/modules/applications/shared/utils/ApplicationTags";
import {
  formatCompensationLine,
  hasCompensationOnCard,
} from "@/modules/applications/shared/utils/compensationFormat";
import { formatDateTime } from "@/modules/applications/details/utils/application-details.shared";

export interface ApplicationCardApplication {
  id: string;
  title: string;
  companyId: string;
  company: { id: string; name: string; description?: string | null };
  description?: string | null;
  url?: string | null;
  salaryMinCents?: number | null;
  salaryMaxCents?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: SalaryPeriod | null;
  tags: Array<string>;
  currentStage: ApplicationStage;
  currentStageReason?: string | null;
  currentStageAt: string;
  createdAt: string;
}

type ApplicationStageEventRow = NonNullable<
  ApplicationStageEventsQuery["applicationStageEvents"]
>[number];

interface ApplicationCardProps {
  application: ApplicationCardApplication;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

function CurrentStageBadge({
  listStage,
  listReason,
  applicationStageEvents,
  historyLoading,
  onRequestStageEvents,
}: {
  listStage: ApplicationStage;
  listReason: string | null;
  applicationStageEvents: Array<ApplicationStageEventRow>;
  historyLoading: boolean;
  onRequestStageEvents: () => void;
}) {
  const events = applicationStageEvents;
  const latestFromApi = events[0] ?? null;
  const displayStage = latestFromApi?.toStage ?? listStage;
  const displayReason = latestFromApi?.reason ?? listReason;
  const timelineItems = events.map((event) => ({
    id: event.id,
    fromStage: event.fromStage,
    toStage: event.toStage,
    reason: event.reason ?? null,
    dateLabel: formatDateTime(event.scheduledAt ?? event.createdAt),
  }));

  return (
    <DropdownMenu
      align="start"
      onOpenChange={(open) => {
        if (open) onRequestStageEvents();
      }}
      trigger={
        <button
          type="button"
          className={cn(
            "inline-flex items-center rounded-full border-0 bg-transparent p-0 leading-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-0",
          )}
          aria-label={`Open status history for ${formatStage(displayStage)}`}
        >
          <StatusBadge
            stage={displayStage}
            reason={displayReason}
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
          {historyLoading && events.length === 0 ? (
            <Text size="sm" color="secondary">
              Loading…
            </Text>
          ) : (
            <StageTimeline items={timelineItems} variant="compact" />
          )}
        </Stack>
      </div>
    </DropdownMenu>
  );
}

function CurrentStageDateText({
  listStage,
  listStatusAt,
  applicationStageEvents,
  stageEventsRequested,
}: {
  listStage: ApplicationStage;
  listStatusAt: string;
  applicationStageEvents: Array<ApplicationStageEventRow>;
  stageEventsRequested: boolean;
}) {
  if (stageEventsRequested && applicationStageEvents.length > 0) {
    const currentStageEvent = applicationStageEvents[0] ?? null;
    const currentStage = currentStageEvent?.toStage ?? ApplicationStage.New;
    const statusAt =
      currentStageEvent?.scheduledAt ??
      currentStageEvent?.createdAt ??
      listStatusAt;
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

  return (
    <Text as="span" size="sm" color="secondary">
      {formatStage(listStage)}{" "}
      {new Date(listStatusAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}
    </Text>
  );
}

export function ApplicationCard({
  application: app,
  onSuccess,
  onError,
}: ApplicationCardProps) {
  const [stageEventsRequested, setStageEventsRequested] = React.useState(false);
  const { data: stageEventsData, loading: stageEventsLoading } =
    useApplicationStageEventsQuery({
      variables: { applicationId: app.id },
      skip: !stageEventsRequested,
      fetchPolicy: "cache-first",
    });
  const applicationStageEvents = stageEventsData?.applicationStageEvents ?? [];
  const requestStageEvents = React.useCallback(() => {
    setStageEventsRequested(true);
  }, []);

  const descriptionPreview = tipTapToPlainText(app.description);
  const compLine = formatCompensationLine({
    salaryMinCents: app.salaryMinCents,
    salaryMaxCents: app.salaryMaxCents,
    salaryCurrency: app.salaryCurrency,
    salaryPeriod: app.salaryPeriod,
  });
  const compTags = app.tags ?? [];
  const showComp = hasCompensationOnCard({ line: compLine, tags: compTags });
  const compensationActionLabel = compLine
    ? `Edit compensation for ${app.title}`
    : `Add compensation for ${app.title}`;
  const compensationActionTooltip = compLine
    ? "Edit compensation"
    : "Add salary";

  return (
    <Card padding="sm">
      <div
        className={cn(
          "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <div className={cn("flex min-w-0 flex-col gap-1")}>
          <div className={cn("flex min-w-0 flex-wrap items-center gap-2")}>
            <NextLink
              href={`/applications/${app.id}`}
              className={cn(
                "text-base font-medium text-text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-0 rounded-sm",
              )}
            >
              {app.title}
            </NextLink>
            <div className={cn("flex items-center gap-1")}>
              <CurrentStageBadge
                listStage={app.currentStage}
                listReason={app.currentStageReason ?? null}
                applicationStageEvents={applicationStageEvents}
                historyLoading={stageEventsLoading}
                onRequestStageEvents={requestStageEvents}
              />
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
                    icon={<PencilSimpleIcon size={13} weight="regular" />}
                  />
                }
                application={{
                  id: app.id,
                  title: app.title,
                  company: app.company.name,
                  url: app.url,
                }}
                onSuccess={onSuccess}
                onError={onError}
              />
              <CompensationEditDialog
                trigger={
                  <IconButton
                    intent="ghost"
                    size="sm"
                    label={compensationActionLabel}
                    tooltip={compensationActionTooltip}
                    className={cn(
                      "h-6 w-6 text-text-muted/80 hover:text-text-muted",
                    )}
                    icon={<CurrencyDollarIcon size={13} weight="regular" />}
                  />
                }
                application={app}
                onSuccess={onSuccess}
                onError={onError}
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
                onSuccess={onSuccess}
                onError={onError}
              />
              <ApplicationTrackingPanel
                inline
                applicationId={app.id}
                applicationStageEvents={applicationStageEvents}
                onRequestStageEvents={requestStageEvents}
                triggerIcon={
                  <ArrowSquareRightIcon size={13} weight="regular" />
                }
                onSuccess={onSuccess}
                onError={onError}
              />
            </div>
          </div>
          <div className={cn("flex flex-wrap items-center gap-2")}>
            <CompanyNameWithPopover
              application={app}
              onSuccess={onSuccess}
              onError={onError}
            />
            <span className={cn("text-text-muted")} aria-hidden>
              ·
            </span>
            <CurrentStageDateText
              listStage={app.currentStage}
              listStatusAt={app.currentStageAt}
              applicationStageEvents={applicationStageEvents}
              stageEventsRequested={stageEventsRequested}
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
                  <ApplicationTags tags={compTags} maxTagChips={3} />
                </span>
              </>
            ) : null}
          </div>
          {descriptionPreview ? (
            <Text size="sm" color="muted" className={cn("line-clamp-2")}>
              {descriptionPreview}
            </Text>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
