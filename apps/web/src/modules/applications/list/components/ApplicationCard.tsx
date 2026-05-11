"use client";

import {
  cn,
  DropdownMenu,
  IconButton,
  ListItemCard,
  Stack,
  Text,
} from "@job-tracker/ui";
import {
  ArrowSquareRightIcon,
  CurrencyDollarIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import NextLink from "next/link";

import { ApplicationStage } from "@/gql/hooks";
import { SalaryEditDialog } from "@/modules/applications/details/components/SalaryEditDialog";
import { formatDateTime } from "@/modules/applications/details/utils/application-details.shared";
import { ApplicationQuickEditDialog } from "@/modules/applications/list/components/ApplicationQuickEditDialog";
import { ApplicationTrackingPanel } from "@/modules/applications/list/components/ApplicationTrackingPanel";
import { DeleteApplicationDialog } from "@/modules/applications/list/components/DeleteApplicationDialog";
import {
  type ApplicationCardApplication,
  type ApplicationCardStageEventRow,
  useApplicationCardViewModel,
} from "@/modules/applications/list/hooks/useApplicationCardViewModel";
import { ApplicationTags } from "@/modules/applications/shared/components/ApplicationTags";
import { CompanyNameWithPopover } from "@/modules/applications/shared/components/CompanyNameWithPopover";
import { InlineMetaDot } from "@/modules/applications/shared/components/InlineMetaDot";
import { normalizeJobUrls } from "@/modules/applications/shared/components/job-urls.utils";
import { JobUrls } from "@/modules/applications/shared/components/JobUrls";
import { SalaryPeriodTooltip } from "@/modules/applications/shared/components/SalaryPeriodTooltip";
import { SalaryView } from "@/modules/applications/shared/components/SalaryView";
import { StageTimeline } from "@/modules/applications/shared/components/StageTimeline";
import { formatStage } from "@/modules/applications/shared/components/status-badge.utils";
import { StatusBadge } from "@/modules/applications/shared/components/StatusBadge";
import { formatApplicationSourceLabel } from "@/modules/applications/shared/utils/applicationSourceLabel";

export type { ApplicationCardApplication } from "@/modules/applications/list/hooks/useApplicationCardViewModel";

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
  applicationStageEvents: Array<ApplicationCardStageEventRow>;
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
  applicationStageEvents: Array<ApplicationCardStageEventRow>;
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
  const {
    applicationStageEvents,
    stageEventsLoading,
    stageEventsRequested,
    requestStageEvents,
    descriptionPreview,
    salary,
    formattedSalary,
    tags,
    showSalary,
    salaryActionLabel,
  } = useApplicationCardViewModel(app);

  const hasJobUrls = normalizeJobUrls(app.urls).length > 0;

  return (
    <ListItemCard
      title={
        <ListItemCard.Title asChild>
          <NextLink href={`/applications/${app.id}`}>{app.title}</NextLink>
        </ListItemCard.Title>
      }
      actions={
        <ListItemCard.Actions>
          <CurrentStageBadge
            listStage={app.currentStage}
            listReason={app.currentStageReason ?? null}
            applicationStageEvents={applicationStageEvents}
            historyLoading={stageEventsLoading}
            onRequestStageEvents={requestStageEvents}
          />
          <ApplicationQuickEditDialog
            trigger={
              <IconButton
                intent="ghost"
                size="sm"
                label={`Quick edit ${app.title}`}
                tooltip="Quick edit"
                className={cn(ListItemCard.actionIconButtonClassName)}
                icon={<PencilSimpleIcon size={13} weight="regular" />}
              />
            }
            application={{
              id: app.id,
              title: app.title,
              company: app.company.name,
              urls: app.urls,
            }}
            onSuccess={onSuccess}
            onError={onError}
          />
          <SalaryEditDialog
            trigger={
              <IconButton
                intent="ghost"
                size="sm"
                label={salaryActionLabel}
                tooltip={salaryActionLabel}
                className={cn(ListItemCard.actionIconButtonClassName)}
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
                className={cn(ListItemCard.actionIconButtonClassName)}
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
            triggerIcon={<ArrowSquareRightIcon size={13} weight="regular" />}
            onSuccess={onSuccess}
            onError={onError}
          />
        </ListItemCard.Actions>
      }
      meta={
        <>
          <CompanyNameWithPopover
            application={app}
            onSuccess={onSuccess}
            onError={onError}
          />
          <InlineMetaDot />
          <CurrentStageDateText
            listStage={app.currentStage}
            listStatusAt={app.currentStageAt}
            applicationStageEvents={applicationStageEvents}
            stageEventsRequested={stageEventsRequested}
          />
          {app.source ? (
            <>
              <InlineMetaDot />
              <Text as="span" size="sm" color="secondary">
                {formatApplicationSourceLabel(app.source)}
              </Text>
            </>
          ) : null}
          {hasJobUrls ? (
            <>
              <InlineMetaDot />
              <JobUrls urls={app.urls} />
            </>
          ) : null}
          {showSalary ? (
            <>
              <InlineMetaDot />
              <span
                className={cn(
                  "inline-flex min-w-0 max-w-full flex-wrap items-center gap-2",
                )}
              >
                {formattedSalary ? (
                  <SalaryPeriodTooltip salary={salary}>
                    <SalaryView salary={formattedSalary} />
                  </SalaryPeriodTooltip>
                ) : null}
                <ApplicationTags tags={tags} maxTagChips={3} />
              </span>
            </>
          ) : null}
        </>
      }
      description={
        descriptionPreview ? (
          <Text size="sm" color="muted" className={cn("line-clamp-2")}>
            {descriptionPreview}
          </Text>
        ) : null
      }
    />
  );
}
