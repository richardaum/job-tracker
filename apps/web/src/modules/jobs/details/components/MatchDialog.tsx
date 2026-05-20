"use client";

import { tryRun } from "@job-tracker/try-run";
import { Button, cn, Dialog, FilterChip, Select, Text } from "@job-tracker/ui";
import React from "react";

import { EmptyState } from "@/components/empty-state";
import {
  useGenerateJobMatchMutation,
  useJobMatchQuery,
  useResumesQuery,
} from "@/gql/hooks";
import { MatchClassification } from "@/modules/jobs/shared/components/MatchClassification";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";
import { MatchItemCard } from "@/modules/match-analyses/details/components/MatchItemCard";
import { PreferencesDialog } from "@/modules/work-preferences/components/PreferencesDialog";

interface MatchDialogProps {
  jobId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MatchDialog({ jobId, open, onOpenChange }: MatchDialogProps) {
  const { enqueueToast } = useToastQueue();

  const { data: matchData, loading: matchLoading } = useJobMatchQuery({
    variables: { jobId },
    skip: !open,
    fetchPolicy: "cache-and-network",
  });

  const { data: resumesData, loading: resumesLoading } = useResumesQuery({
    skip: !open,
    fetchPolicy: "cache-and-network",
  });

  const [generateMatch, { loading: generating }] =
    useGenerateJobMatchMutation();

  const [selectedResumeId, setSelectedResumeId] = React.useState<string>("");
  const [sourceFilter, setSourceFilter] = React.useState<
    "all" | "resume" | "preference"
  >("all");
  const [weightFilter, setWeightFilter] = React.useState<
    "all" | "high" | "low"
  >("all");
  const [prefsOpen, setPrefsOpen] = React.useState(false);
  const hasMatch = !!matchData?.jobMatch;

  const resumeId = (selectedResumeId || resumesData?.resumes?.[0]?.id) ?? "";

  const filteredItems = React.useMemo(() => {
    const items = matchData?.jobMatch?.items ?? [];
    return items.filter((item) => {
      if (sourceFilter !== "all" && item.source !== sourceFilter) return false;
      if (weightFilter !== "all" && item.weight !== weightFilter) return false;
      return true;
    });
  }, [matchData, sourceFilter, weightFilter]);

  async function handleGenerate() {
    if (!resumeId) {
      enqueueToast({ title: "Please select a resume first.", intent: "error" });
      return;
    }
    const [error] = await tryRun(
      generateMatch({
        variables: { input: { jobId, resumeId } },
        refetchQueries: ["JobMatch"],
      }),
    );
    if (error) {
      const message =
        error instanceof Error
          ? error.message.replace("Bad Request Exception: ", "")
          : "Failed to generate match analysis.";
      enqueueToast({ title: message, intent: "error" });
      return;
    }
    enqueueToast({ title: "Match analysis generated.", intent: "success" });
  }

  const loading = matchLoading || resumesLoading;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Match Analysis"
      size="2xl"
      childrenClassName="overflow-auto"
      footer={
        <div className={cn("flex items-center justify-between gap-2")}>
          <div className={cn("flex items-center gap-2")}>
            {resumesData?.resumes && (
              <Select
                value={resumeId}
                onValueChange={(v) => setSelectedResumeId(v)}
                placeholder="Select a resume"
                options={resumesData.resumes.map((r) => ({
                  label: r.title,
                  value: r.id,
                }))}
              />
            )}
          </div>
          <div className={cn("flex items-center gap-2")}>
            <Button
              intent="ghost"
              size="md"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              intent="primary"
              size="md"
              onClick={() => void handleGenerate()}
              state={generating ? "loading" : "default"}
              disabled={!resumeId}
            >
              {hasMatch ? "Regenerate" : "Generate match analysis"}
            </Button>
          </div>
        </div>
      }
    >
      {loading && !hasMatch ? (
        <Text size="sm" color="muted">
          Loading...
        </Text>
      ) : !hasMatch ? (
        <EmptyState
          variant="default"
          message="No analysis yet"
          detail="Select a resume and generate a match analysis to see how your profile matches this job description."
        />
      ) : (
        <div className={cn("flex flex-col gap-4")}>
          {matchData?.jobMatch && (
            <>
              <MatchClassification
                variant="detailed"
                classification={matchData.jobMatch.classification ?? null}
                scoreRatio={matchData.jobMatch.scoreRatio ?? null}
                matchCount={matchData.jobMatch.matchCount}
                gapCount={matchData.jobMatch.gapCount}
                unclearCount={matchData.jobMatch.unclearCount}
              />

              <div className={cn("flex flex-wrap items-center gap-1.5")}>
                <FilterChip
                  active={sourceFilter === "all" && weightFilter === "all"}
                  onClick={() => {
                    setSourceFilter("all");
                    setWeightFilter("all");
                  }}
                >
                  All
                </FilterChip>
                <FilterChip
                  active={sourceFilter === "resume"}
                  onClick={() => {
                    setSourceFilter("resume");
                    setWeightFilter("all");
                  }}
                >
                  Resume
                </FilterChip>
                <FilterChip
                  active={sourceFilter === "preference"}
                  onClick={() => {
                    setSourceFilter("preference");
                    setWeightFilter("all");
                  }}
                >
                  Pref
                </FilterChip>
                <FilterChip
                  active={weightFilter === "high"}
                  onClick={() => {
                    setWeightFilter("high");
                    setSourceFilter("all");
                  }}
                >
                  High
                </FilterChip>
                <FilterChip
                  active={weightFilter === "low"}
                  onClick={() => {
                    setWeightFilter("low");
                    setSourceFilter("all");
                  }}
                >
                  Low
                </FilterChip>
              </div>

              <div className={cn("flex flex-col gap-2")}>
                {filteredItems.map((item, i) => (
                  <MatchItemCard
                    key={i}
                    item={item}
                    resumeId={matchData?.jobMatch?.resumeId ?? undefined}
                    onPreferenceClick={() => setPrefsOpen(true)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <PreferencesDialog
        open={prefsOpen}
        onOpenChange={setPrefsOpen}
        readOnly
      />
    </Dialog>
  );
}
