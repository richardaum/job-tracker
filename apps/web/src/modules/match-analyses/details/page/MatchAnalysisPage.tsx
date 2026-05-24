"use client";

import { tryRun } from "@job-tracker/try-run";
import {
  Button,
  cn,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuItem,
  Heading,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
} from "@job-tracker/ui";
import {
  BriefcaseIcon,
  CaretDownIcon,
  NotePencilIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import React from "react";

import { BackToLink } from "@/components/back-to-link";
import { EmptyState } from "@/components/empty-state";
import { EntityNotFound } from "@/components/entity-not-found";
import {
  AsyncMetadataStatus,
  MatchVerdict,
  useDeleteMatchAnalysisMutation,
  useGenerateJobMatchMutation,
  useMatchQuery,
} from "@/gql/hooks";
import { useEventSource } from "@/hooks/useEventSource";
import { getApiBaseUrl } from "@/lib/api-endpoints";
import { hasGraphQLCode } from "@/lib/graphql-entity-errors";
import { MatchClassification } from "@/modules/jobs/shared/components/MatchClassification";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";
import { MatchItemCard } from "@/modules/match-analyses/details/components/MatchItemCard";
import { MatchStatusBadge } from "@/modules/match-analyses/details/components/MatchStatusBadge";
import { MatchWizardDialog } from "@/modules/match-analyses/details/components/MatchWizardDialog";
import { PreferencesDialog } from "@/modules/work-preferences/components/PreferencesDialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

type MatchAnalysisLike = { jobId?: string | null; job?: { id: string } | null };

function resolveParentLink(
  match: MatchAnalysisLike | null | undefined,
  notFound: boolean,
) {
  if (notFound) return { parentLabel: "matches", parentHref: "/matches" };
  const jobId = match?.job?.id ?? match?.jobId;
  if (jobId) return { parentLabel: "job", parentHref: `/jobs/${jobId}` };
  return { parentLabel: "matches", parentHref: "/matches" };
}

export default function MatchAnalysisPage({ params }: PageProps) {
  const { id: matchId } = React.use(params);
  const router = useRouter();
  const { enqueueToast } = useToastQueue();
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [prefsOpen, setPrefsOpen] = React.useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const [deleteMatchAnalysis] = useDeleteMatchAnalysisMutation();

  const {
    data: matchData,
    loading: matchLoading,
    error,
    refetch: refetchMatch,
  } = useMatchQuery({
    variables: { id: matchId },
    fetchPolicy: "cache-and-network",
  });

  const [generateJobMatch, { loading: generating }] =
    useGenerateJobMatchMutation();

  const [matchFilterTab, setMatchFilterTab] = React.useState<
    "all" | MatchVerdict
  >("all");

  const matchAnalysis = matchData?.match;
  const status = matchAnalysis?.generationMetadata?.status;
  const isProcessing = status === AsyncMetadataStatus.Processing;
  const isFailed = status === AsyncMetadataStatus.Failed;
  const isCompleted = status === AsyncMetadataStatus.Completed;
  const hasMatch = !!matchAnalysis && !isProcessing && !isFailed;

  const notFound = hasGraphQLCode(error, "NOT_FOUND");
  const { parentLabel, parentHref } = resolveParentLink(
    matchAnalysis,
    notFound,
  );

  const sseUrl = `${getApiBaseUrl()}/matches/${matchId}/stream`;
  useEventSource<{ matchId: string; status: string }>(
    sseUrl,
    "match_status_changed",
    (data) => {
      if (
        data.status === AsyncMetadataStatus.Completed ||
        data.status === AsyncMetadataStatus.Failed
      ) {
        void refetchMatch();
      }
    },
  );

  const filteredItems = React.useMemo(() => {
    const items = matchAnalysis?.items ?? [];
    return items.filter((item) => {
      if (matchFilterTab === MatchVerdict.Fit)
        return item.verdict === MatchVerdict.Fit;
      if (matchFilterTab === MatchVerdict.Gap)
        return item.verdict === MatchVerdict.Gap;
      if (matchFilterTab === MatchVerdict.Unclear)
        return item.verdict === MatchVerdict.Unclear;
      return true;
    });
  }, [matchAnalysis, matchFilterTab]);

  async function handleGenerate(resumeId: string) {
    const jobPk = matchAnalysis?.job?.id ?? matchAnalysis?.jobId;
    if (!jobPk) {
      enqueueToast({ title: "Match is not linked to a job.", intent: "error" });
      return;
    }
    const [error] = await tryRun(
      generateJobMatch({
        variables: { input: { jobId: jobPk, resumeId } },
        refetchQueries: ["Match"],
      }),
    );
    if (error) {
      const message =
        error instanceof Error
          ? error.message.replace("Bad Request Exception: ", "")
          : "Failed to generate match analysis.";
      enqueueToast({ title: message, intent: "error" });
    }
  }

  async function handleDelete() {
    const [error] = await tryRun(
      deleteMatchAnalysis({ variables: { id: matchId } }),
    );
    if (error) {
      enqueueToast({
        title: "Could not delete the match analysis.",
        intent: "error",
      });
      return;
    }
    router.push("/matches");
  }

  const actionsMenu = matchAnalysis ? (
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
        onSelect={() => router.push(`/resumes/${matchAnalysis.resumeId}`)}
        icon={<NotePencilIcon size={14} weight="regular" />}
      >
        View resume
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={() => setPrefsOpen(true)}
        icon={<BriefcaseIcon size={14} weight="regular" />}
      >
        Work Preferences
      </DropdownMenuItem>
      <DropdownMenuItem
        destructive
        onSelect={() => setDeleteDialogOpen(true)}
        icon={<TrashIcon size={14} weight="regular" />}
      >
        Remove
      </DropdownMenuItem>
    </DropdownMenu>
  ) : null;

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <div
        className={cn(
          "flex flex-col gap-2 border-b border-border-subtle p-4 sm:px-6 sm:py-5 shrink-0",
        )}
      >
        <div className={cn("flex items-center justify-between gap-3")}>
          <BackToLink href={parentHref}>Back to {parentLabel}</BackToLink>
          <div className={cn("flex items-center gap-2")}>
            {actionsMenu ? (
              <div className={cn("shrink-0")}>{actionsMenu}</div>
            ) : null}
            {!notFound && (
              <Button
                intent="primary"
                size="md"
                onClick={() => setWizardOpen(true)}
                state={isProcessing ? "loading" : "default"}
              >
                {hasMatch ? "Regenerate" : "Generate"}
              </Button>
            )}
          </div>
        </div>
        <div className={cn("flex items-center gap-3")}>
          <Heading as="h1" size="2xl" className={cn("min-w-0")}>
            <span>Match Analysis</span>
          </Heading>
          {status ? (
            <MatchStatusBadge
              status={status}
              error={matchAnalysis?.generationMetadata?.error ?? null}
              className={cn("ml-3 align-middle")}
            />
          ) : null}
        </div>
      </div>

      <div className={cn("flex-1 min-h-0 overflow-auto p-4 sm:p-6")}>
        <div className={cn("flex w-full flex-col gap-4")}>
          {matchLoading && !matchAnalysis ? (
            <Text size="sm" color="muted">
              Loading...
            </Text>
          ) : notFound ? (
            <EntityNotFound
              resource="match analysis"
              backHref="/matches"
              backLabel="Back to matches"
            />
          ) : error ? (
            <Text size="sm" color="error">
              Failed to load match analysis.
            </Text>
          ) : !matchAnalysis ? (
            <EmptyState
              variant="default"
              message="No analysis yet"
              detail="Click Generate to see how your profile matches this job description."
            />
          ) : isProcessing ? (
            <EmptyState
              variant="default"
              message="Analyzing your match..."
              detail="This usually takes a few seconds. The results will appear automatically."
            />
          ) : isFailed ? (
            <EmptyState
              variant="default"
              message="Analysis failed"
              detail={
                matchAnalysis?.generationMetadata?.error ??
                "Something went wrong. Try again."
              }
            />
          ) : isCompleted ? (
            <>
              <div className={cn("flex items-start justify-between gap-4")}>
                <Tabs
                  value={matchFilterTab}
                  onValueChange={(v) =>
                    setMatchFilterTab(v as typeof matchFilterTab)
                  }
                >
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value={MatchVerdict.Fit}>Fits</TabsTrigger>
                    <TabsTrigger value={MatchVerdict.Gap}>Gaps</TabsTrigger>
                    <TabsTrigger value={MatchVerdict.Unclear}>
                      Unclear
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <MatchClassification
                  variant="detailed"
                  classification={matchAnalysis.classification ?? null}
                  scoreRatio={matchAnalysis.scoreRatio ?? null}
                  matchCount={matchAnalysis.matchCount}
                  gapCount={matchAnalysis.gapCount}
                  unclearCount={matchAnalysis.unclearCount}
                />
              </div>

              <div
                className={cn(
                  "columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 *:break-inside-avoid *:mb-4",
                )}
              >
                {filteredItems.map((item, i) => (
                  <MatchItemCard
                    key={i}
                    item={item}
                    resumeId={matchAnalysis?.resumeId ?? undefined}
                    onPreferenceClick={() => setPrefsOpen(true)}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      <MatchWizardDialog
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onGenerate={handleGenerate}
        generating={generating}
        hasExistingMatch={hasMatch}
      />

      <PreferencesDialog
        open={prefsOpen}
        onOpenChange={setPrefsOpen}
        readOnly
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete match analysis"
        description="Are you sure you want to delete this match analysis? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
