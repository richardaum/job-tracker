"use client";

import {
  Button,
  cn,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
  Tooltip,
} from "@job-tracker/ui";
import { BriefcaseIcon, NotePencilIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";

import { EmptyState } from "@/components/empty-state";
import { MatchVerdict } from "@/gql/hooks";
import { useMatchTabViewModel } from "@/modules/jobs/details/hooks/useMatchTabViewModel";
import {
  JobActionsMenuItems,
  JobHeaderActions,
} from "@/modules/jobs/details/job-details-header.slots";
import { MatchClassification } from "@/modules/jobs/shared/components/MatchClassification";
import { MatchItemCard } from "@/modules/match-analyses/details/components/MatchItemCard";
import { MatchStatusBadge } from "@/modules/match-analyses/details/components/MatchStatusBadge";
import { MatchWizardDialog } from "@/modules/match-analyses/details/components/MatchWizardDialog";
import { PreferencesDialog } from "@/modules/work-preferences/components/PreferencesDialog";

export interface MatchTabContentProps {
  jobId: string;
}

/** Tab body for job match analysis: query, SSE, filters, dialogs. */
export function MatchTabContent({ jobId }: MatchTabContentProps) {
  const vm = useMatchTabViewModel(jobId);
  const router = useRouter();
  const [prefsOpen, setPrefsOpen] = React.useState(false);

  function emptyFilterMessage(): string {
    if (vm.matchFilterTab === MatchVerdict.Fit) return "No fits found";
    if (vm.matchFilterTab === MatchVerdict.Gap) return "No gaps found";
    if (vm.matchFilterTab === MatchVerdict.Unclear)
      return "No unclear requirements found";
    return "Nothing to display yet.";
  }

  const showGenerateInHeader =
    !vm.matchLoading || vm.matchAnalysis != null || vm.matchError != null;

  const generateTooltip = vm.hasRenderableMatchRecord
    ? "Run the match analysis again with your resume and preferences."
    : "Compare this job to a resume to see fits, gaps, and unclear areas.";

  const generateButton = showGenerateInHeader ? (
    <Tooltip content={generateTooltip} side="bottom" align="end">
      <Button
        intent="primary"
        size="md"
        onClick={() => vm.setWizardOpen(true)}
        state={vm.isProcessing || vm.generating ? "loading" : "default"}
      >
        {vm.hasRenderableMatchRecord ? "Regenerate" : "Generate"}
      </Button>
    </Tooltip>
  ) : null;

  const matchResumeId = vm.matchAnalysis?.resumeId ?? null;

  const matchActionsMenuItems = useMemo(
    () => (
      <>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Match</DropdownMenuLabel>
          {matchResumeId ? (
            <DropdownMenuItem
              onSelect={() => router.push(`/resumes/${matchResumeId}`)}
              icon={<NotePencilIcon size={14} weight="regular" />}
            >
              View resume
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            onSelect={() => setPrefsOpen(true)}
            icon={<BriefcaseIcon size={14} weight="regular" />}
          >
            View preferences
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
      </>
    ),
    [matchResumeId, router],
  );

  const toolbar = (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-4",
      )}
    >
      <div className={cn("flex flex-wrap items-center gap-3 min-w-0")}>
        {vm.status ? (
          <MatchStatusBadge
            status={vm.status}
            error={vm.matchAnalysis?.generationMetadata?.error ?? null}
            className={cn("shrink-0")}
          />
        ) : null}
      </div>
    </div>
  );

  let body: React.ReactNode = null;

  if (vm.matchLoading && !vm.matchAnalysis) {
    body = (
      <Text size="sm" color="muted">
        Loading...
      </Text>
    );
  } else if (vm.matchError) {
    body = (
      <Text size="sm" color="error">
        Failed to load match analysis.
      </Text>
    );
  } else if (!vm.matchAnalysis) {
    body = (
      <EmptyState
        variant="actionHint"
        headline="No match analysis yet"
        description="Generate a fit analysis against your resume for this role."
        actionLabel="Generate match"
        onAction={() => vm.setWizardOpen(true)}
      />
    );
  } else if (vm.isProcessing) {
    body = (
      <EmptyState
        variant="default"
        message="Analyzing your match…"
        detail="This usually takes a few seconds. The results will appear automatically."
      />
    );
  } else if (vm.isFailed) {
    body = (
      <div className={cn("flex flex-col gap-4")}>
        <EmptyState
          variant="default"
          message="Analysis failed"
          detail={
            vm.matchAnalysis?.generationMetadata?.error ??
            "Something went wrong. Try again."
          }
        />
        <div>
          <Button
            intent="primary"
            size="md"
            onClick={() => vm.setWizardOpen(true)}
          >
            Retry analysis
          </Button>
        </div>
      </div>
    );
  } else if (vm.isCompleted) {
    body = (
      <>
        <div
          className={cn(
            "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
          )}
        >
          <Tabs
            value={vm.matchFilterTab}
            onValueChange={(v) =>
              vm.setMatchFilterTab(v as typeof vm.matchFilterTab)
            }
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value={MatchVerdict.Fit}>Fits</TabsTrigger>
              <TabsTrigger value={MatchVerdict.Gap}>Gaps</TabsTrigger>
              <TabsTrigger value={MatchVerdict.Unclear}>Unclear</TabsTrigger>
            </TabsList>
          </Tabs>

          <MatchClassification
            variant="detailed"
            classification={vm.matchAnalysis.classification ?? null}
            scoreRatio={vm.matchAnalysis.scoreRatio ?? null}
            matchCount={vm.matchAnalysis.matchCount}
            gapCount={vm.matchAnalysis.gapCount}
            unclearCount={vm.matchAnalysis.unclearCount}
          />
        </div>

        {vm.filteredItems.length === 0 ? (
          <Text size="sm" color="muted">
            {emptyFilterMessage()}
          </Text>
        ) : (
          <div
            className={cn(
              "columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 *:break-inside-avoid *:mb-4",
            )}
          >
            {vm.filteredItems.map((item, i) => (
              <MatchItemCard
                key={`${vm.matchAnalysis!.id}-${i}`}
                item={item}
                resumeId={vm.matchAnalysis!.resumeId ?? undefined}
                onPreferenceClick={() => setPrefsOpen(true)}
              />
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <div className={cn("flex min-h-0 flex-col gap-4")}>
      {generateButton ? (
        <JobHeaderActions>{generateButton}</JobHeaderActions>
      ) : null}
      <JobActionsMenuItems>{matchActionsMenuItems}</JobActionsMenuItems>
      {vm.matchAnalysis && vm.status ? toolbar : null}
      <div className={cn("flex min-h-0 flex-1 flex-col gap-4")}>{body}</div>

      <MatchWizardDialog
        open={vm.wizardOpen}
        onOpenChange={vm.setWizardOpen}
        onGenerate={vm.handleGenerate}
        generating={vm.generating}
        hasExistingMatch={vm.hasRenderableMatchRecord}
        initialResumeId={vm.matchAnalysis?.resumeId ?? null}
      />

      <PreferencesDialog
        open={prefsOpen}
        onOpenChange={setPrefsOpen}
        readOnly
      />
    </div>
  );
}
