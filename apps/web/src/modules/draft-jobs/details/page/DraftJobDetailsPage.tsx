"use client";

import { tryRun } from "@job-tracker/try-run";
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuItem,
  FieldWithLabelAction,
  Heading,
  IconButton,
  OverviewSection,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  useDialog,
} from "@job-tracker/ui";
import {
  CaretDownIcon,
  CopyIcon,
  PencilSimpleIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";

import {
  DraftJobConversionStatus,
  useCreateJobWithAiMutation,
  useGenerateDraftJobMatchMutation,
  useJobQuery,
  useUpdateDraftJobMutation,
} from "@/gql/hooks";
import { useEventSource } from "@/hooks/useEventSource";
import { getApiBaseUrl } from "@/lib/api-endpoints";
import { ConvertDraftConfirmationDialog } from "@/modules/draft-jobs/details/components/ConvertDraftConfirmationDialog";
import { ConvertDraftConflictDialog } from "@/modules/draft-jobs/details/components/ConvertDraftConflictDialog";
import { DraftCurrentJobField } from "@/modules/draft-jobs/details/components/DraftCurrentJobField";
import { DraftTitleEditDialog } from "@/modules/draft-jobs/details/components/DraftTitleEditDialog";
import { useDraftAutoConversion } from "@/modules/draft-jobs/details/hooks/useDraftAutoConversion";
import { useDraftJobDetailsViewModel } from "@/modules/draft-jobs/details/hooks/useDraftJobDetailsViewModel";
import { DeleteDraftJobDialog } from "@/modules/draft-jobs/list/components/DeleteDraftJobDialog";
import { ConversionStatusBadge } from "@/modules/draft-jobs/shared/components/ConversionStatusBadge";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";
import { MatchWizardDialog } from "@/modules/match-analyses/details/components/MatchWizardDialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

function draftPrimaryTitle(url: string | null | undefined): string {
  if (!url) return "Untitled draft";
  const [err, title] = tryRun(() => {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname === "/" ? "" : u.pathname;
    const combined = `${host}${path}`;
    return combined.length > 120 ? `${combined.slice(0, 117)}…` : combined;
  });
  if (!err) {
    return title;
  }
  return url.length > 120 ? `${url.slice(0, 117)}…` : url;
}

function draftHeadingTitle(
  title: string,
  url: string | null | undefined,
): string {
  const trimmedTitle = title.trim();
  if (trimmedTitle.length > 0) {
    return trimmedTitle;
  }

  return draftPrimaryTitle(url);
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(date: string): string {
  return dateFormatter.format(new Date(date));
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1)}…`;
}

function truncateMiddle(
  value: string,
  prefixLength: number,
  suffixLength: number,
) {
  if (value.length <= prefixLength + suffixLength + 1) {
    return value;
  }
  return `${value.slice(0, prefixLength)}…${value.slice(-suffixLength)}`;
}

export default function DraftJobDetailsPage({ params }: PageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const titleDialog = useDialog();
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [convertConfirmDialogOpen, setConvertConfirmDialogOpen] =
    useState(false);
  const [convertConflictDialogOpen, setConvertConflictDialogOpen] =
    useState(false);
  const [matchWizardOpen, setMatchWizardOpen] = useState(false);
  const [createJobWithAI] = useCreateJobWithAiMutation();
  const [updateDraftJob] = useUpdateDraftJobMutation();
  const [generateDraftMatch, { loading: generatingMatch }] =
    useGenerateDraftJobMatchMutation();
  const { enqueueToast } = useToastQueue();

  const { draft, error, refetch, showInitialLoading } =
    useDraftJobDetailsViewModel(id);
  const sseUrl = `${getApiBaseUrl()}/draft-jobs/${id}/stream`;
  useEventSource<{ draftId: string; status: DraftJobConversionStatus }>(
    sseUrl,
    "draft_conversion_status_changed",
    (data) => {
      if (
        (data.status === DraftJobConversionStatus.Succeeded ||
          data.status === DraftJobConversionStatus.Failed) &&
        refetch
      ) {
        void refetch();
      }
    },
  );
  const { data: jobData } = useJobQuery({
    variables: { id: draft?.jobId ?? "" },
    skip: !draft?.jobId,
    fetchPolicy: "cache-first",
  });

  const showToast = useCallback(
    (message: string, intent: "success" | "error") => {
      enqueueToast({ title: message, intent });
    },
    [enqueueToast],
  );

  const handleCopyDraftId = useCallback(
    async (draftId: string) => {
      const [error] = await tryRun(navigator.clipboard.writeText(draftId));
      if (error) {
        showToast("Could not copy draft ID.", "error");
        return;
      }
      showToast("Draft ID copied.", "success");
    },
    [showToast],
  );

  const handleConvertToJob = useCallback(async () => {
    if (!draft) return;

    if (draft.jobId) {
      setConvertConflictDialogOpen(true);
      return;
    }

    const [error] = await tryRun(
      createJobWithAI({ variables: { draftId: draft.id } }),
    );

    if (error) {
      enqueueToast({
        title: error.message || "Failed to start draft conversion.",
        intent: "error",
      });
      return;
    }

    enqueueToast({
      title: "Conversion started in background.",
      intent: "success",
    });
    void refetch();
  }, [draft, createJobWithAI, enqueueToast, refetch]);

  useDraftAutoConversion({
    draftLoaded: !showInitialLoading && !!draft,
    onConvert: handleConvertToJob,
  });

  const handleSaveTitle = useCallback(
    async (nextValue: string) => {
      if (!draft) return;
      const [mutationError] = await tryRun(
        updateDraftJob({
          variables: { id: draft.id, input: { title: nextValue } },
        }),
      );
      if (mutationError) {
        showToast(
          mutationError.message || "Could not update draft title.",
          "error",
        );
        return;
      }
      showToast("Draft title updated.", "success");
      void refetch();
    },
    [draft, updateDraftJob, showToast, refetch],
  );

  const handleGenerateMatch = useCallback(
    async (resumeId: string) => {
      if (!draft) return;
      const [error, result] = await tryRun(
        generateDraftMatch({
          variables: { input: { draftJobId: draft.id, resumeId } },
        }),
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
      void refetch();
      if (result?.data?.generateDraftJobMatch?.id) {
        router.push(`/matches/${result.data.generateDraftJobMatch.id}`);
      }
    },
    [draft, generateDraftMatch, enqueueToast, refetch, router],
  );

  function renderOverviewBody() {
    if (!draft) return null;
    const truncatedUrl = draft.url ? truncateText(draft.url, 80) : null;
    const isUrlTruncated = truncatedUrl !== draft.url;
    const linkedJob = jobData?.job ?? null;
    const truncatedDraftId = truncateMiddle(draft.id, 8, 4);

    return (
      <OverviewSection layout="grid">
        {draft.url ? (
          <FieldWithLabelAction
            label="Source URL"
            content={
              <FieldWithLabelAction.Tooltip
                content={isUrlTruncated ? draft.url : undefined}
                enabled={isUrlTruncated}
              >
                <a
                  href={draft.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "block max-w-88 truncate text-sm text-text-brand underline-offset-2 hover:underline",
                  )}
                >
                  {truncatedUrl}
                </a>
              </FieldWithLabelAction.Tooltip>
            }
          />
        ) : (
          <FieldWithLabelAction
            label="Source URL"
            content={
              <Text size="sm" color="muted">
                Not provided
              </Text>
            }
          />
        )}
        <FieldWithLabelAction
          label="Draft id"
          actions={
            <IconButton
              size="sm"
              intent="ghost"
              label="Copy draft id"
              tooltip="Copy draft id"
              icon={<CopyIcon size={14} weight="bold" />}
              className={cn(
                "size-7 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
              )}
              onClick={() => {
                void handleCopyDraftId(draft.id);
              }}
            />
          }
          content={
            <span className={cn("block max-w-full truncate font-mono text-sm")}>
              {truncatedDraftId}
            </span>
          }
        />
        <FieldWithLabelAction
          label="Page title"
          actions={
            <FieldWithLabelAction.IconActionButton
              label="Edit page title"
              icon={<PencilSimpleIcon size={14} weight="regular" />}
              onClick={titleDialog.open}
            />
          }
          content={
            <Text size="sm" className={cn("wrap-break-word")}>
              {draft.title.trim() || "Untitled page"}
            </Text>
          }
        />
        <DraftTitleEditDialog
          control={titleDialog}
          value={draft.title}
          onSave={handleSaveTitle}
        />
        <DraftCurrentJobField job={linkedJob} />
      </OverviewSection>
    );
  }

  function renderCapturedBody() {
    if (!draft) return null;
    return (
      <div
        className={cn(
          "flex size-full min-h-0  flex-col overflow-hidden rounded-md border border-border-subtle bg-bg-surface",
        )}
      >
        <iframe
          title="Captured posting HTML"
          srcDoc={draft.htmlContent}
          sandbox=""
          className={cn("h-full min-h-0 flex-1 border-0")}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <div
        className={cn(
          "flex flex-col gap-2 border-b border-border-subtle p-4  sm:px-6 sm:py-5",
        )}
      >
        <div className={cn("flex items-center justify-between gap-3")}>
          <Link
            href="/draft-jobs"
            className={cn(
              "text-sm text-text-secondary underline-offset-2 hover:underline",
            )}
          >
            Back to drafts
          </Link>
          <div
            className={cn(
              "flex shrink-0 flex-wrap items-center justify-end gap-2",
            )}
          >
            {draft ? (
              <>
                {draft ? (
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
                    {draft.jobId ? (
                      <DropdownMenuItem
                        onSelect={() => router.push(`/jobs/${draft.jobId}`)}
                      >
                        Open job
                      </DropdownMenuItem>
                    ) : null}
                    {draft.match?.id ? (
                      <DropdownMenuItem
                        onSelect={() =>
                          router.push(`/matches/${draft.match!.id}`)
                        }
                        icon={<SparkleIcon size={14} weight="regular" />}
                      >
                        Match analysis
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onSelect={() => setMatchWizardOpen(true)}
                        icon={<SparkleIcon size={14} weight="regular" />}
                      >
                        Match analysis
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onSelect={() => {
                        setConvertConfirmDialogOpen(true);
                      }}
                    >
                      Convert to job
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      destructive
                      onSelect={() => setDeleteDialogOpen(true)}
                    >
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenu>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
        <div className={cn("flex items-start justify-between gap-3")}>
          <Heading as="h1" size="2xl" className={cn("min-w-0 flex-1 truncate")}>
            <span>
              {draft ? draftHeadingTitle(draft.title, draft.url) : "Draft job"}
            </span>{" "}
            {draft ? (
              <ConversionStatusBadge
                conversionMetadata={draft.conversionMetadata}
                showSpinner={
                  draft.conversionMetadata?.status?.toLowerCase() ===
                  "processing"
                }
                className={cn("ml-2 align-middle")}
              />
            ) : null}
          </Heading>
          {draft ? (
            <span className={cn("shrink-0 pt-1 text-xs text-text-muted")}>
              {draft.conversionMetadata?.timestamp
                ? `Converted at ${formatDate(draft.conversionMetadata.timestamp)}`
                : `Created at ${formatDate(draft.createdAt)}`}
            </span>
          ) : null}
        </div>
        {draft ? (
          <DeleteDraftJobDialog
            draftId={draft.id}
            draftSummary={draftHeadingTitle(draft.title, draft.url)}
            hasLinkedJob={Boolean(draft.jobId)}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onSuccess={(msg) => {
              showToast(msg, "success");
              router.push("/draft-jobs");
            }}
            onError={(msg) => showToast(msg, "error")}
          />
        ) : null}
        <ConvertDraftConflictDialog
          open={convertConflictDialogOpen}
          draftId={draft?.id}
          previousJobId={draft?.jobId ?? null}
          onOpenChange={setConvertConflictDialogOpen}
          onDeletePreviousSuccess={() => {
            enqueueToast({
              title: "Linked jobs removed for this draft.",
              intent: "success",
            });
          }}
          onConversionSuccess={() => {
            enqueueToast({
              title: "Conversion started in background.",
              intent: "success",
            });
            void refetch();
          }}
          onError={(message) => {
            enqueueToast({ title: message, intent: "error" });
          }}
        />
        <ConvertDraftConfirmationDialog
          open={convertConfirmDialogOpen}
          draftSummary={
            draft ? draftHeadingTitle(draft.title, draft.url) : "this draft"
          }
          onOpenChange={setConvertConfirmDialogOpen}
          onConfirm={handleConvertToJob}
        />
        <MatchWizardDialog
          open={matchWizardOpen}
          onOpenChange={setMatchWizardOpen}
          onGenerate={handleGenerateMatch}
          generating={generatingMatch}
          hasExistingMatch={!!draft?.match}
        />
      </div>

      <div className={cn("min-h-0 flex-1 overflow-hidden p-4 sm:p-6")}>
        {showInitialLoading ? (
          <Text size="sm" color="secondary">
            Loading draft...
          </Text>
        ) : error ? (
          <Text size="sm" color="error">
            Failed to load draft job.
          </Text>
        ) : !draft ? (
          <Text size="sm" color="secondary">
            Draft not found.
          </Text>
        ) : (
          <Tabs
            defaultValue="overview"
            className={cn("flex size-full min-h-0  flex-col")}
          >
            <TabsList className={cn("w-full shrink-0 flex-wrap")}>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="captured">Captured</TabsTrigger>
            </TabsList>

            <TabsContent
              value="overview"
              className={cn("mt-3 flex-1 min-h-0 overflow-auto px-2")}
            >
              {renderOverviewBody()}
            </TabsContent>

            <TabsContent
              value="captured"
              className={cn("mt-3 flex-1 min-h-0 overflow-hidden")}
            >
              {renderCapturedBody()}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
