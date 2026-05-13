"use client";

import { tryRun } from "@job-tracker/try-run";
import {
  Button,
  cn,
  Heading,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
} from "@job-tracker/ui";
import Link from "next/link";
import React from "react";

import { EmptyState } from "@/components/empty-state";
import {
  FitAnalysisStatus,
  useApplicationFitQuery,
  useGenerateApplicationFitMutation,
} from "@/gql/hooks";
import { FitItemCard } from "@/modules/applications/details/components/FitItemCard";
import { FitStatusBadge } from "@/modules/applications/details/components/FitStatusBadge";
import { FitWizardDialog } from "@/modules/applications/details/components/FitWizardDialog";
import { ScoreBadge } from "@/modules/applications/details/components/ScoreBadge";
import { useToastQueue } from "@/modules/applications/shared/hooks/useToastQueue";
import { PreferencesDialog } from "@/modules/resumes/list/components/PreferencesDialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FitAnalysisPage({ params }: PageProps) {
  const { id } = React.use(params);
  const { enqueueToast } = useToastQueue();
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [prefsOpen, setPrefsOpen] = React.useState(false);

  const {
    data: fitData,
    loading: fitLoading,
    startPolling,
    stopPolling,
  } = useApplicationFitQuery({
    variables: { applicationId: id },
    fetchPolicy: "cache-and-network",
  });

  const [generateFit, { loading: generating }] =
    useGenerateApplicationFitMutation();

  const [fitFilterTab, setFitFilterTab] = React.useState<
    "all" | "resume" | "preference" | "high" | "low"
  >("all");

  const fit = fitData?.applicationFit;
  const status = fit?.status;
  const isProcessing = status === FitAnalysisStatus.Processing;
  const isFailed = status === FitAnalysisStatus.Failed;
  const isCompleted = status === FitAnalysisStatus.Completed;
  const hasFit = !!fit && !isProcessing && !isFailed;

  React.useEffect(() => {
    if (isProcessing) {
      startPolling(3000);
      return () => stopPolling();
    }
    stopPolling();
  }, [isProcessing, startPolling, stopPolling]);

  const filteredItems = React.useMemo(() => {
    const items = fit?.items ?? [];
    return items.filter((item) => {
      if (fitFilterTab === "resume") return item.source === "resume";
      if (fitFilterTab === "preference") return item.source === "preference";
      if (fitFilterTab === "high") return item.weight === "high";
      if (fitFilterTab === "low") return item.weight === "low";
      return true;
    });
  }, [fit, fitFilterTab]);

  async function handleGenerate(resumeId: string) {
    const [error] = await tryRun(
      generateFit({
        variables: { input: { applicationId: id, resumeId } },
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
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <div
        className={cn(
          "flex flex-col gap-2 border-b border-border-subtle p-4 sm:px-6 sm:py-5 shrink-0",
        )}
      >
        <div className={cn("flex items-center justify-between gap-3")}>
          <Link
            href={`/applications/${id}`}
            className={cn(
              "text-sm text-text-secondary underline-offset-2 hover:underline",
            )}
          >
            Back to application
          </Link>
          <Button
            intent="primary"
            size="md"
            onClick={() => setWizardOpen(true)}
            state={isProcessing ? "loading" : "default"}
          >
            {hasFit ? "Regenerate" : "Generate"}
          </Button>
        </div>
        <div className={cn("flex items-start gap-3")}>
          <Heading as="h1" size="2xl" className={cn("min-w-0 flex-1")}>
            <span>Fit Analysis</span>
            {status ? (
              <FitStatusBadge
                status={status}
                error={fit?.error}
                className={cn("ml-3 align-middle")}
              />
            ) : null}
          </Heading>
        </div>
      </div>

      <div className={cn("flex-1 min-h-0 overflow-auto p-4 sm:p-6")}>
        <div className={cn("flex w-full flex-col gap-4")}>
          {fitLoading && !fit ? (
            <Text size="sm" color="muted">
              Loading...
            </Text>
          ) : !fit ? (
            <EmptyState
              variant="default"
              message="No analysis yet"
              detail="Click Generate to see how your profile matches this job description."
            />
          ) : isProcessing ? (
            <EmptyState
              variant="default"
              message="Analyzing your fit..."
              detail="This usually takes a few seconds. The results will appear automatically."
            />
          ) : isFailed ? (
            <EmptyState
              variant="default"
              message="Analysis failed"
              detail={fit?.error ?? "Something went wrong. Try again."}
            />
          ) : isCompleted ? (
            <>
              <ScoreBadge
                classification={fit.classification ?? null}
                scoreRatio={fit.scoreRatio ?? null}
                fitCount={fit.fitCount}
                gapCount={fit.gapCount}
                unclearCount={fit.unclearCount}
              />

              <Tabs
                value={fitFilterTab}
                onValueChange={(v) => setFitFilterTab(v as typeof fitFilterTab)}
              >
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="resume">Resume</TabsTrigger>
                  <TabsTrigger value="preference">Pref</TabsTrigger>
                  <TabsTrigger value="high">High</TabsTrigger>
                  <TabsTrigger value="low">Low</TabsTrigger>
                </TabsList>
              </Tabs>

              <div
                className={cn(
                  "columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 *:break-inside-avoid *:mb-4",
                )}
              >
                {filteredItems.map((item, i) => (
                  <FitItemCard
                    key={i}
                    item={item}
                    resumeId={fit?.resumeId ?? undefined}
                    onPreferenceClick={() => setPrefsOpen(true)}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      <FitWizardDialog
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onGenerate={handleGenerate}
        generating={generating}
        hasExistingFit={hasFit}
      />

      <PreferencesDialog
        open={prefsOpen}
        onOpenChange={setPrefsOpen}
        readOnly
      />
    </div>
  );
}
