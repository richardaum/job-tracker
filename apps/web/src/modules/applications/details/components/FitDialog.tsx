"use client";

import { tryRun } from "@job-tracker/try-run";
import { Button, cn, Dialog, FilterChip, Select, Text } from "@job-tracker/ui";
import React from "react";

import { EmptyState } from "@/components/empty-state";
import {
  FitSource,
  useApplicationFitQuery,
  useGenerateApplicationFitMutation,
  useResumesQuery,
} from "@/gql/hooks";
import { FitClassification } from "@/modules/applications/shared/components/FitClassification";
import { useToastQueue } from "@/modules/applications/shared/hooks/useToastQueue";
import { FitItemCard } from "@/modules/fit-analyses/details/components/FitItemCard";
import { PreferencesDialog } from "@/modules/work-preferences/components/PreferencesDialog";

interface FitDialogProps {
  applicationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FitDialog({
  applicationId,
  open,
  onOpenChange,
}: FitDialogProps) {
  const { enqueueToast } = useToastQueue();

  const { data: fitData, loading: fitLoading } = useApplicationFitQuery({
    variables: { applicationId },
    skip: !open,
    fetchPolicy: "cache-and-network",
  });

  const { data: resumesData, loading: resumesLoading } = useResumesQuery({
    skip: !open,
    fetchPolicy: "cache-and-network",
  });

  const [generateFit, { loading: generating }] =
    useGenerateApplicationFitMutation();

  const [selectedResumeId, setSelectedResumeId] = React.useState<string>("");
  const [sourceFilter, setSourceFilter] = React.useState<"all" | FitSource>(
    "all",
  );
  const [weightFilter, setWeightFilter] = React.useState<
    "all" | "high" | "low"
  >("all");
  const [prefsOpen, setPrefsOpen] = React.useState(false);
  const hasFit = !!fitData?.applicationFit;

  const resumeId = (selectedResumeId || resumesData?.resumes?.[0]?.id) ?? "";

  const filteredItems = React.useMemo(() => {
    const items = fitData?.applicationFit?.items ?? [];
    return items.filter((item) => {
      if (sourceFilter !== "all" && item.source !== sourceFilter) return false;
      if (weightFilter !== "all" && item.weight !== weightFilter) return false;
      return true;
    });
  }, [fitData, sourceFilter, weightFilter]);

  async function handleGenerate() {
    if (!resumeId) {
      enqueueToast({ title: "Please select a resume first.", intent: "error" });
      return;
    }
    const [error] = await tryRun(
      generateFit({
        variables: { input: { applicationId, resumeId } },
        refetchQueries: ["ApplicationFit"],
      }),
    );
    if (error) {
      const message =
        error instanceof Error
          ? error.message.replace("Bad Request Exception: ", "")
          : "Failed to generate fit analysis.";
      enqueueToast({ title: message, intent: "error" });
      return;
    }
    enqueueToast({ title: "Fit analysis generated.", intent: "success" });
  }

  const loading = fitLoading || resumesLoading;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Fit Analysis"
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
              {hasFit ? "Regenerate" : "Generate fit analysis"}
            </Button>
          </div>
        </div>
      }
    >
      {loading && !hasFit ? (
        <Text size="sm" color="muted">
          Loading...
        </Text>
      ) : !hasFit ? (
        <EmptyState
          variant="default"
          message="No analysis yet"
          detail="Select a resume and generate a fit analysis to see how your profile matches this job description."
        />
      ) : (
        <div className={cn("flex flex-col gap-4")}>
          {fitData?.applicationFit && (
            <>
              <FitClassification
                variant="detailed"
                classification={fitData.applicationFit.classification ?? null}
                scoreRatio={fitData.applicationFit.scoreRatio ?? null}
                fitCount={fitData.applicationFit.fitCount}
                gapCount={fitData.applicationFit.gapCount}
                unclearCount={fitData.applicationFit.unclearCount}
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
                  active={sourceFilter === FitSource.Resume}
                  onClick={() => {
                    setSourceFilter(FitSource.Resume);
                    setWeightFilter("all");
                  }}
                >
                  Resume
                </FilterChip>
                <FilterChip
                  active={sourceFilter === FitSource.Preference}
                  onClick={() => {
                    setSourceFilter(FitSource.Preference);
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
                  <FitItemCard
                    key={i}
                    item={item}
                    resumeId={fitData?.applicationFit?.resumeId ?? undefined}
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
