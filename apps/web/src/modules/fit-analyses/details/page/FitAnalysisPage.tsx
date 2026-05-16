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
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { EmptyState } from "@/components/empty-state";
import {
  AsyncMetadataStatus,
  useDeleteFitAnalysisMutation,
  useFitQuery,
  useGenerateApplicationFitMutation,
  useGenerateDraftApplicationFitMutation,
} from "@/gql/hooks";
import { useEventSource } from "@/hooks/useEventSource";
import { getApiBaseUrl } from "@/lib/api-endpoints";
import { FitClassification } from "@/modules/applications/shared/components/FitClassification";
import { useToastQueue } from "@/modules/applications/shared/hooks/useToastQueue";
import { FitItemCard } from "@/modules/fit-analyses/details/components/FitItemCard";
import { FitStatusBadge } from "@/modules/fit-analyses/details/components/FitStatusBadge";
import { FitWizardDialog } from "@/modules/fit-analyses/details/components/FitWizardDialog";
import { PreferencesDialog } from "@/modules/resumes/list/components/PreferencesDialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FitAnalysisPage({ params }: PageProps) {
  const { id: fitId } = React.use(params);
  const router = useRouter();
  const { enqueueToast } = useToastQueue();
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [prefsOpen, setPrefsOpen] = React.useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const [deleteFitAnalysis] = useDeleteFitAnalysisMutation();

  const {
    data: fitData,
    loading: fitLoading,
    refetch: refetchFit,
  } = useFitQuery({
    variables: { id: fitId },
    fetchPolicy: "cache-and-network",
  });

  const [generateApplicationFit, { loading: generatingApp }] =
    useGenerateApplicationFitMutation();
  const [generateDraftFit, { loading: generatingDraft }] =
    useGenerateDraftApplicationFitMutation();

  const [fitFilterTab, setFitFilterTab] = React.useState<
    "all" | "fit" | "gap" | "unclear"
  >("all");

  const fit = fitData?.fit;
  const status = fit?.generationMetadata?.status;
  const isProcessing = status === AsyncMetadataStatus.Processing;
  const isFailed = status === AsyncMetadataStatus.Failed;
  const isCompleted = status === AsyncMetadataStatus.Completed;
  const hasFit = !!fit && !isProcessing && !isFailed;
  const generating = generatingApp || generatingDraft;

  const belongsToApplication = !!fit?.applicationId;
  const belongsToDraft = !!fit?.draftApplicationId;

  const parentLabel = belongsToApplication ? "application" : "draft";
  const parentHref = belongsToApplication
    ? `/applications/${fit!.applicationId}`
    : belongsToDraft
      ? `/draft-applications/${fit!.draftApplicationId}`
      : "#";

  const sseUrl = `${getApiBaseUrl()}/fits/${fitId}/stream`;
  useEventSource<{ fitId: string; status: string }>(
    sseUrl,
    "fit_status_changed",
    (data) => {
      if (
        (data.status === AsyncMetadataStatus.Completed ||
          data.status === AsyncMetadataStatus.Failed) &&
        refetchFit
      ) {
        void refetchFit();
      }
    },
  );

  const filteredItems = React.useMemo(() => {
    const items = fit?.items ?? [];
    return items.filter((item) => {
      if (fitFilterTab === "fit") return item.verdict === "fit";
      if (fitFilterTab === "gap") return item.verdict === "gap";
      if (fitFilterTab === "unclear") return item.verdict === "unclear";
      return true;
    });
  }, [fit, fitFilterTab]);

  async function handleGenerate(resumeId: string) {
    if (belongsToApplication && fit.applicationId) {
      const [error] = await tryRun(
        generateApplicationFit({
          variables: { input: { applicationId: fit.applicationId, resumeId } },
          refetchQueries: ["Fit"],
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
    } else if (belongsToDraft && fit.draftApplicationId) {
      const [error] = await tryRun(
        generateDraftFit({
          variables: {
            input: { draftApplicationId: fit.draftApplicationId, resumeId },
          },
          refetchQueries: ["Fit"],
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
    } else {
      enqueueToast({
        title: "Fit is not linked to an application or draft.",
        intent: "error",
      });
    }
  }

  async function handleDelete() {
    const [error] = await tryRun(
      deleteFitAnalysis({ variables: { id: fitId } }),
    );
    if (error) {
      enqueueToast({
        title: "Could not delete the fit analysis.",
        intent: "error",
      });
      return;
    }
    router.push("/fits");
  }

  const actionsMenu = fit ? (
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
        onSelect={() => router.push(`/resumes/${fit.resumeId}`)}
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
          <Link
            href={parentHref}
            className={cn(
              "text-sm text-text-secondary underline-offset-2 hover:underline",
            )}
          >
            Back to {parentLabel}
          </Link>
          <div className={cn("flex items-center gap-2")}>
            {actionsMenu ? (
              <div className={cn("shrink-0")}>{actionsMenu}</div>
            ) : null}
            <Button
              intent="primary"
              size="md"
              onClick={() => setWizardOpen(true)}
              state={isProcessing ? "loading" : "default"}
            >
              {hasFit ? "Regenerate" : "Generate"}
            </Button>
          </div>
        </div>
        <div className={cn("flex items-center gap-3")}>
          <Heading as="h1" size="2xl" className={cn("min-w-0")}>
            <span>Fit Analysis</span>
          </Heading>
          {status ? (
            <FitStatusBadge
              status={status}
              error={fit?.generationMetadata?.error ?? null}
              className={cn("ml-3 align-middle")}
            />
          ) : null}
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
              detail={
                fit?.generationMetadata?.error ??
                "Something went wrong. Try again."
              }
            />
          ) : isCompleted ? (
            <>
              <div className={cn("flex items-start justify-between gap-4")}>
                <Tabs
                  value={fitFilterTab}
                  onValueChange={(v) =>
                    setFitFilterTab(v as typeof fitFilterTab)
                  }
                >
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="fit">Fits</TabsTrigger>
                    <TabsTrigger value="gap">Gaps</TabsTrigger>
                    <TabsTrigger value="unclear">Unclear</TabsTrigger>
                  </TabsList>
                </Tabs>

                <FitClassification
                  variant="detailed"
                  classification={fit.classification ?? null}
                  scoreRatio={fit.scoreRatio ?? null}
                  fitCount={fit.fitCount}
                  gapCount={fit.gapCount}
                  unclearCount={fit.unclearCount}
                />
              </div>

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

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete fit analysis"
        description="Are you sure you want to delete this fit analysis? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
