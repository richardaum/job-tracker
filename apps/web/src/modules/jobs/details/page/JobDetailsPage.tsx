"use client";

import { tryRun } from "@job-tracker/try-run";
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Heading,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@job-tracker/ui";
import { CaretDownIcon, SparkleIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { BackToLink } from "@/components/back-to-link";
import { EntityNotFound } from "@/components/entity-not-found";
import { useGenerateJobMatchMutation } from "@/gql/hooks";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { ActivitySidePanel } from "@/modules/jobs/details/components/ActivitySidePanel";
import { DescriptionTabContent } from "@/modules/jobs/details/components/DescriptionTabContent";
import { HistoryPanelTabsContent } from "@/modules/jobs/details/components/HistoryPanel";
import { NotesPanelTabsContent } from "@/modules/jobs/details/components/NotesPanel";
import { OverviewTabContent } from "@/modules/jobs/details/components/OverviewTabContent";
import { SourceContentTabContent } from "@/modules/jobs/details/components/SourceContentTabContent";
import { UpdateStatusAction } from "@/modules/jobs/details/components/UpdateStatusAction";
import { useJobDetailsViewModel } from "@/modules/jobs/details/hooks/useJobDetailsViewModel";
import { jobDetailDisplayTitle } from "@/modules/jobs/details/utils/job-detail-title";
import { type JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";
import { DeleteJobDialog } from "@/modules/jobs/list/components/DeleteJobDialog";
import { StatusBadge } from "@/modules/jobs/shared/components/StatusBadge";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";
import { MatchWizardDialog } from "@/modules/match-analyses/details/components/MatchWizardDialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailsPage({ params }: PageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [matchWizardOpen, setMatchWizardOpen] = useState(false);
  const [generateJobMatch, { loading: generatingMatch }] =
    useGenerateJobMatchMutation();
  const { enqueueToast } = useToastQueue();

  const {
    job,
    currentStage,
    currentStageReason,
    sourcePrimaryText,
    status,
    displayTitle,
    fillButtonState,
    triggerFillAutomatically,
  } = useJobDetailsViewModel(id);
  const isDesktop = useBreakpoint("(min-width: 1024px)");

  function showToast(message: string, intent: "success" | "error") {
    enqueueToast({ title: message, intent });
  }

  const handleGenerateMatch = React.useCallback(
    async (resumeId: string) => {
      if (!job) return;
      const [error, result] = await tryRun(
        generateJobMatch({ variables: { input: { jobId: job.id, resumeId } } }),
      );
      if (error) {
        enqueueToast({
          title:
            error instanceof Error
              ? error.message.replace("Bad Request Exception: ", "")
              : "Failed to generate match analysis.",
          intent: "error",
        });
        return;
      }
      enqueueToast({
        title: "Match analysis generation started.",
        intent: "success",
      });
      if (result?.data?.generateJobMatch?.id) {
        router.push(`/matches/${result.data.generateJobMatch.id}`);
      }
    },
    [job, generateJobMatch, enqueueToast, router],
  );

  const handleEntitySuccess = (message: string) =>
    showToast(message, "success");
  const handleEntityError = (message: string) => showToast(message, "error");
  const handleDescriptionSuccess = () =>
    showToast("Description saved.", "success");
  const handleDescriptionError = () =>
    showToast("Failed to save description.", "error");

  const handleFillAutomatically = React.useCallback(async () => {
    const { error } = await triggerFillAutomatically();
    if (error) {
      enqueueToast({
        title:
          error instanceof Error
            ? error.message.replace("Bad Request Exception: ", "")
            : "Failed to start automatic fill.",
        intent: "error",
      });
      return;
    }
    enqueueToast({ title: "Automatic fill queued.", intent: "success" });
  }, [enqueueToast, triggerFillAutomatically]);

  function renderPrimaryTabTriggers({
    showSourceContent,
  }: {
    showSourceContent: boolean;
  }) {
    return (
      <>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="description">Description</TabsTrigger>
        {showSourceContent ? (
          <TabsTrigger value="source">Source content</TabsTrigger>
        ) : null}
      </>
    );
  }

  function renderPrimaryTabContents({
    currentJob,
    overviewClassName,
    descriptionClassName,
    sourceContentClassName,
    showSourceContent,
    overviewSourcePrimaryText,
  }: {
    currentJob: JobDetailsValues;
    overviewClassName: string;
    descriptionClassName: string;
    sourceContentClassName: string;
    showSourceContent: boolean;
    overviewSourcePrimaryText: string | null;
  }) {
    const html =
      showSourceContent && currentJob.htmlContent
        ? currentJob.htmlContent
        : null;
    return (
      <>
        <TabsContent value="overview" className={cn(overviewClassName)}>
          <OverviewTabContent
            job={currentJob}
            sourcePrimaryText={overviewSourcePrimaryText}
            onSuccess={handleEntitySuccess}
            onError={handleEntityError}
          />
        </TabsContent>

        <TabsContent value="description" className={cn(descriptionClassName)}>
          <DescriptionTabContent
            job={currentJob}
            onSuccess={handleDescriptionSuccess}
            onError={handleDescriptionError}
          />
        </TabsContent>

        {html !== null ? (
          <TabsContent value="source" className={cn(sourceContentClassName)}>
            <SourceContentTabContent htmlContent={html} />
          </TabsContent>
        ) : null}
      </>
    );
  }

  const actionsMenu = job ? (
    <DropdownMenu
      open={actionsMenuOpen}
      onOpenChange={setActionsMenuOpen}
      trigger={
        <Button
          intent="secondary"
          size="md"
          rightIcon={
            <CaretDownIcon
              size={12}
              weight="bold"
              className={cn(
                "transition-transform duration-200",
                actionsMenuOpen ? "rotate-180" : "rotate-0",
              )}
            />
          }
        >
          Actions
        </Button>
      }
      align="end"
    >
      <DropdownMenuItem
        onSelect={() => {
          if (job?.match?.id) {
            router.push(`/matches/${job.match.id}`);
          } else {
            setMatchWizardOpen(true);
          }
        }}
        icon={<SparkleIcon size={14} weight="regular" />}
      >
        Match analysis
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => setActionsOpen(true)}>
        Update status
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem destructive onSelect={() => setDeleteDialogOpen(true)}>
        Remove
      </DropdownMenuItem>
    </DropdownMenu>
  ) : null;

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <div
        className={cn(
          "flex flex-col gap-2 border-b border-border-subtle p-4  sm:px-6 sm:py-5",
        )}
      >
        <div className={cn("flex items-center justify-between gap-3")}>
          <BackToLink href="/jobs">Back to jobs</BackToLink>
          {job ? (
            <div
              className={cn(
                "flex shrink-0 flex-wrap items-center justify-end gap-2",
              )}
            >
              <Button
                intent="secondary"
                size="md"
                state={fillButtonState}
                onClick={() => void handleFillAutomatically()}
              >
                Fill automatically
              </Button>
              {actionsMenu}
            </div>
          ) : null}
        </div>
        <div className={cn("flex items-center gap-3")}>
          <Heading as="h1" size="2xl" className={cn("min-w-0")}>
            <span>
              {displayTitle !== null ? displayTitle : "Job details"}
            </span>{" "}
          </Heading>
          {job ? (
            <StatusBadge
              stage={currentStage}
              reason={currentStageReason}
              className={cn("align-middle whitespace-nowrap")}
            />
          ) : null}
        </div>
        {job ? (
          <>
            <UpdateStatusAction
              jobId={job.id}
              currentStage={currentStage}
              open={actionsOpen}
              onOpenChange={setActionsOpen}
              onSuccess={handleEntitySuccess}
              onError={handleEntityError}
            />
            <DeleteJobDialog
              trigger={<span aria-hidden style={{ display: "none" }} />}
              jobId={job.id}
              jobTitle={jobDetailDisplayTitle(job.title)}
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              onSuccess={() => router.push("/jobs")}
              onError={(msg) => handleEntityError(msg)}
            />
          </>
        ) : null}
      </div>

      <div className={cn("flex-1 min-h-0 overflow-hidden p-4 sm:p-6")}>
        {status === "loading" ? (
          <Text size="sm" color="secondary">
            Loading job...
          </Text>
        ) : status === "notFound" ? (
          <EntityNotFound
            resource="job"
            backHref="/jobs"
            backLabel="Back to jobs"
          />
        ) : status === "error" ? (
          <Text size="sm" color="error">
            Failed to load job details.
          </Text>
        ) : !job ? null : !isDesktop ? (
          <Tabs
            defaultValue="overview"
            className={cn("flex size-full min-h-0  flex-col")}
          >
            <TabsList className={cn("w-full shrink-0 flex-wrap")}>
              {renderPrimaryTabTriggers({
                showSourceContent: Boolean(job.htmlContent),
              })}
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {renderPrimaryTabContents({
              currentJob: job,
              overviewClassName: cn("mt-3 flex-1 min-h-0 overflow-auto px-2"),
              descriptionClassName: cn("mt-3 flex-1 min-h-0 overflow-auto"),
              sourceContentClassName: cn("mt-3 flex-1 min-h-0 overflow-hidden"),
              showSourceContent: Boolean(job.htmlContent),
              overviewSourcePrimaryText: sourcePrimaryText,
            })}

            <NotesPanelTabsContent jobId={job.id} className={cn("mt-3")} />
            <HistoryPanelTabsContent
              jobId={job.id}
              className={cn("mt-3")}
              onSuccess={handleEntitySuccess}
              onError={handleEntityError}
            />
          </Tabs>
        ) : (
          <div
            className={cn(
              "grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]",
            )}
          >
            <Tabs
              defaultValue="overview"
              className={cn("flex size-full min-h-0  flex-col")}
            >
              <TabsList>
                {renderPrimaryTabTriggers({
                  showSourceContent: Boolean(job.htmlContent),
                })}
              </TabsList>

              {renderPrimaryTabContents({
                currentJob: job,
                overviewClassName: cn("mt-3 flex-1 min-h-0 overflow-auto px-2"),
                descriptionClassName: cn("mt-3 flex-1 min-h-0 overflow-auto"),
                sourceContentClassName: cn(
                  "mt-3 flex-1 min-h-0 overflow-hidden",
                ),
                showSourceContent: Boolean(job.htmlContent),
                overviewSourcePrimaryText: sourcePrimaryText,
              })}
            </Tabs>

            <div
              className={cn(
                "min-h-0 overflow-hidden border-l border-border-subtle pl-4",
              )}
            >
              <ActivitySidePanel
                jobId={job.id}
                onSuccess={handleEntitySuccess}
                onError={handleEntityError}
              />
            </div>
          </div>
        )}
      </div>
      <MatchWizardDialog
        open={matchWizardOpen}
        onOpenChange={setMatchWizardOpen}
        onGenerate={handleGenerateMatch}
        generating={generatingMatch}
        hasExistingMatch={!!job?.match}
      />
    </div>
  );
}
