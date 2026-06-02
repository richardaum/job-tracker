"use client";

import { cn, DropdownMenu, IconButton, ListItemCard, Stack, Text } from "@job-tracker/ui";
import { ArrowSquareRightIcon, CurrencyDollarIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import NextLink from "next/link";

import { ApplicationStage } from "@/gql/hooks";
import { SalaryEditDialog } from "@/modules/jobs/details/components/SalaryEditDialog";
import { jobDetailDisplayTitle } from "@/modules/jobs/details/utils/job-detail-title";
import { formatDateTime } from "@/modules/jobs/details/utils/job-details.shared";
import { DeleteJobDialog } from "@/modules/jobs/list/components/DeleteJobDialog";
import { JobQuickEditDialog } from "@/modules/jobs/list/components/JobQuickEditDialog";
import { JobTrackingPanel } from "@/modules/jobs/list/components/JobTrackingPanel";
import {
  type JobCardJob,
  type JobCardStageEventRow,
  useJobCardViewModel,
} from "@/modules/jobs/list/hooks/useJobCardViewModel";
import { CompanyNameWithPopover } from "@/modules/jobs/shared/components/CompanyNameWithPopover";
import { InlineMetaDot } from "@/modules/jobs/shared/components/InlineMetaDot";
import { normalizeJobUrls } from "@/modules/jobs/shared/components/job-urls.utils";
import { JobTags } from "@/modules/jobs/shared/components/JobTags";
import { JobUrls } from "@/modules/jobs/shared/components/JobUrls";
import { MatchClassification } from "@/modules/jobs/shared/components/MatchClassification";
import { SalaryPeriodTooltip } from "@/modules/jobs/shared/components/SalaryPeriodTooltip";
import { SalaryView } from "@/modules/jobs/shared/components/SalaryView";
import { StageTimeline } from "@/modules/jobs/shared/components/StageTimeline";
import { formatStage } from "@/modules/jobs/shared/components/status-badge.utils";
import { StatusBadge } from "@/modules/jobs/shared/components/StatusBadge";
import { formatJobSourceLabel } from "@/modules/jobs/shared/utils/jobSourceLabel";

interface JobCardProps {
  job: JobCardJob;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

type CurrentStageBadgeProps = {
  listStage: ApplicationStage;
  listReason: string | null;
  jobStageEvents: Array<JobCardStageEventRow>;
  historyLoading: boolean;
  onRequestStageEvents: () => void;
};

function CurrentStageBadge({
  listStage,
  listReason,
  jobStageEvents,
  historyLoading,
  onRequestStageEvents,
}: CurrentStageBadgeProps) {
  const events = jobStageEvents;
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

type CurrentStageDateTextProps = {
  listStage: ApplicationStage;
  listStatusAt: string;
  jobStageEvents: Array<JobCardStageEventRow>;
  stageEventsRequested: boolean;
};

function CurrentStageDateText({
  listStage,
  listStatusAt,
  jobStageEvents,
  stageEventsRequested,
}: CurrentStageDateTextProps) {
  if (stageEventsRequested && jobStageEvents.length > 0) {
    const currentStageEvent = jobStageEvents[0] ?? null;
    const currentStage = currentStageEvent?.toStage ?? ApplicationStage.New;
    const statusAt = currentStageEvent?.scheduledAt ?? currentStageEvent?.createdAt ?? listStatusAt;
    return (
      <Text as="span" size="sm" color="secondary">
        {formatStage(currentStage)}{" "}
        {new Date(statusAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
      </Text>
    );
  }

  return (
    <Text as="span" size="sm" color="secondary">
      {formatStage(listStage)}{" "}
      {new Date(listStatusAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
    </Text>
  );
}

export function JobCard({ job: app, onSuccess, onError }: JobCardProps) {
  const {
    jobStageEvents,
    stageEventsLoading,
    stageEventsRequested,
    requestStageEvents,
    descriptionPreview,
    salary,
    formattedSalary,
    tags,
    showSalary,
    salaryActionLabel,
  } = useJobCardViewModel(app);

  const hasJobUrls = normalizeJobUrls(app.urls).length > 0;
  const displayTitle = jobDetailDisplayTitle(app.title);
  const displayCompanyMeta = Boolean(app.company?.name?.trim());

  return (
    <ListItemCard
      title={
        <ListItemCard.Title asChild>
          <NextLink href={`/jobs/${app.id}`}>{displayTitle}</NextLink>
        </ListItemCard.Title>
      }
      actions={
        <ListItemCard.Actions>
          {app.match?.scoreRatio != null && (
            <MatchClassification
              variant="badge"
              matchId={app.match.id}
              jobId={app.id}
              classification={app.match.classification ?? null}
              scoreRatio={app.match.scoreRatio}
              matchCount={app.match.matchCount}
              gapCount={app.match.gapCount}
              unclearCount={app.match.unclearCount}
            />
          )}
          <CurrentStageBadge
            listStage={app.currentStage}
            listReason={app.currentStageReason ?? null}
            jobStageEvents={jobStageEvents}
            historyLoading={stageEventsLoading}
            onRequestStageEvents={requestStageEvents}
          />
          <JobQuickEditDialog
            trigger={
              <IconButton
                intent="ghost"
                size="sm"
                label={`Quick edit ${displayTitle}`}
                tooltip="Quick edit"
                className={cn(ListItemCard.actionIconButtonClassName)}
                icon={<PencilSimpleIcon size={13} weight="regular" />}
              />
            }
            job={{
              id: app.id,
              title: app.title ?? "",
              company: app.company?.name ?? "",
              urls: app.urls,
              location: app.location,
              workRegion: app.workRegion,
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
            job={app}
            onSuccess={onSuccess}
            onError={onError}
          />
          <JobTrackingPanel
            inline
            jobId={app.id}
            jobStageEvents={jobStageEvents}
            onRequestStageEvents={requestStageEvents}
            triggerIcon={<ArrowSquareRightIcon size={13} weight="regular" />}
            onSuccess={onSuccess}
            onError={onError}
          />
          <DeleteJobDialog
            trigger={
              <IconButton
                intent="ghost"
                size="sm"
                label={`Delete ${displayTitle}`}
                tooltip="Delete"
                className={cn(ListItemCard.actionIconButtonClassName)}
                icon={<TrashIcon size={13} weight="regular" />}
              />
            }
            jobId={app.id}
            jobTitle={displayTitle}
          />
        </ListItemCard.Actions>
      }
      meta={
        <>
          {displayCompanyMeta ? (
            <>
              <span className={cn("contents")} data-testid="job-card-company-meta">
                <CompanyNameWithPopover job={app} onSuccess={onSuccess} onError={onError} />
              </span>
              <InlineMetaDot />
            </>
          ) : null}
          <CurrentStageDateText
            listStage={app.currentStage}
            listStatusAt={app.currentStageAt}
            jobStageEvents={jobStageEvents}
            stageEventsRequested={stageEventsRequested}
          />
          {app.source ? (
            <>
              <InlineMetaDot />
              <Text as="span" size="sm" color="secondary">
                {formatJobSourceLabel(app.source)}
              </Text>
            </>
          ) : null}
          {app.location ? (
            <>
              <InlineMetaDot />
              <Text as="span" size="sm" color="secondary">
                {app.location}
              </Text>
            </>
          ) : null}
          {app.workRegion ? (
            <>
              <InlineMetaDot />
              <Text as="span" size="sm" color="secondary">
                {app.workRegion}
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
              <span className={cn("inline-flex min-w-0 max-w-full flex-wrap items-center gap-2")}>
                {formattedSalary ? (
                  <SalaryPeriodTooltip salary={salary}>
                    <SalaryView salary={formattedSalary} />
                  </SalaryPeriodTooltip>
                ) : null}
                <JobTags tags={tags} maxTagChips={3} />
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
