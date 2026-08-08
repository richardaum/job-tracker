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
} from "@job-tracker/ui";
import { BriefcaseIcon, FilesIcon, SparkleIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/empty-state";
import { MatchVerdict } from "@/gql/hooks";
import { useMatchTabViewModel } from "@/modules/jobs/details/hooks/useMatchTabViewModel";
import { JobActionsMenuItems, JobDetailsSubTabs } from "@/modules/jobs/details/job-details-header.slots";
import { MatchClassification } from "@/modules/jobs/shared/components/MatchClassification";
import { MatchItemCard } from "@/modules/match-analyses/details/components/MatchItemCard";
import { MatchWizardDialog } from "@/modules/match-analyses/details/components/MatchWizardDialog";
import { PreferencesDialog } from "@/modules/work-preferences/components/PreferencesDialog";

export interface MatchTabContentProps {
  jobId: string;
}

/** Tab body for job match analysis: query, SSE, filters, dialogs. */
export function MatchTabContent({ jobId }: MatchTabContentProps) {
  const vm = useMatchTabViewModel(jobId);
  const router = useRouter();
  const [prefsOpen, setPrefsOpen] = useState(false);

  function emptyFilterMessage(): string {
    if (vm.matchFilterTab === MatchVerdict.Fit) return "No fits found";
    if (vm.matchFilterTab === MatchVerdict.Gap) return "No gaps found";
    if (vm.matchFilterTab === MatchVerdict.Unclear) return "No unclear requirements found";
    return "Nothing to display yet.";
  }

  const matchResumeId = vm.matchAnalysis?.resumeId ?? null;

  const matchActionsMenuItems = (
    <>
      <DropdownMenuGroup>
        <DropdownMenuLabel>Match</DropdownMenuLabel>
        <DropdownMenuItem
          disabled={vm.matchLoading || vm.isProcessing || vm.generating}
          onSelect={() => vm.setWizardOpen(true)}
          icon={<SparkleIcon size={14} weight="regular" />}
        >
          {vm.hasRenderableMatchRecord ? "Regenerate match" : "Generate match"}
        </DropdownMenuItem>
        {matchResumeId ? (
          <DropdownMenuItem
            onSelect={() => router.push(`/profile/resumes/${matchResumeId}`)}
            icon={<FilesIcon size={14} weight="regular" />}
          >
            View resume
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onSelect={() => setPrefsOpen(true)} icon={<BriefcaseIcon size={14} weight="regular" />}>
          View preferences
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
    </>
  );

  let body: ReactNode = null;

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
          detail={vm.matchAnalysis?.generationMetadata?.error ?? "Something went wrong. Try again."}
        />
        <div>
          <Button intent="primary" size="md" onClick={() => vm.setWizardOpen(true)}>
            Retry analysis
          </Button>
        </div>
      </div>
    );
  } else if (vm.isCompleted) {
    body = (
      <>
        <MatchClassification
          variant="detailed"
          classification={vm.matchAnalysis.classification ?? null}
          scoreRatio={vm.matchAnalysis.scoreRatio ?? null}
          matchCount={vm.matchAnalysis.matchCount}
          gapCount={vm.matchAnalysis.gapCount}
          unclearCount={vm.matchAnalysis.unclearCount}
        />

        {vm.filteredItems.length === 0 ? (
          <Text size="sm" color="muted">
            {emptyFilterMessage()}
          </Text>
        ) : (
          <div
            className={cn(
              "columns-1 gap-4 @sm:columns-2 @2xl:columns-3 @4xl:columns-4 @6xl:columns-5 *:break-inside-avoid *:mb-4",
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

  const matchSubTabTriggerClass = cn("data-[state=active]:bg-bg-info-subtle data-[state=active]:text-text-brand");

  const matchFilterTabs = vm.isCompleted ? (
    <JobDetailsSubTabs>
      <Tabs value={vm.matchFilterTab} onValueChange={(v) => vm.setMatchFilterTab(v as typeof vm.matchFilterTab)}>
        <TabsList className={cn("border-border-brand/40")}>
          <TabsTrigger value="all" className={matchSubTabTriggerClass}>
            All
          </TabsTrigger>
          <TabsTrigger value={MatchVerdict.Fit} className={matchSubTabTriggerClass}>
            Fits
          </TabsTrigger>
          <TabsTrigger value={MatchVerdict.Gap} className={matchSubTabTriggerClass}>
            Gaps
          </TabsTrigger>
          <TabsTrigger value={MatchVerdict.Unclear} className={matchSubTabTriggerClass}>
            Unclear
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </JobDetailsSubTabs>
  ) : null;

  return (
    <div className={cn("flex min-h-0 flex-col gap-4")}>
      {matchFilterTabs}
      <JobActionsMenuItems>{matchActionsMenuItems}</JobActionsMenuItems>
      <div className={cn("@container w-full min-w-0 flex min-h-0 flex-1 flex-col gap-4")}>{body}</div>

      <MatchWizardDialog
        open={vm.wizardOpen}
        onOpenChange={vm.setWizardOpen}
        onGenerate={vm.handleGenerate}
        generating={vm.generating}
        hasExistingMatch={vm.hasRenderableMatchRecord}
        initialResumeId={vm.matchAnalysis?.resumeId ?? null}
      />

      <PreferencesDialog open={prefsOpen} onOpenChange={setPrefsOpen} readOnly />
    </div>
  );
}
