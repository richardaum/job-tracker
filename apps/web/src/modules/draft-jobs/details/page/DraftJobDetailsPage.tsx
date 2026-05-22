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
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";

import { BackToLink } from "@/components/back-to-link";
import { EntityNotFound } from "@/components/entity-not-found";
import {
  ApplicationStage,
  useFillJobAutomaticallyMutation,
  useGenerateJobMatchMutation,
  useUpdateJobMutation,
} from "@/gql/hooks";
import { useEventSource } from "@/hooks/useEventSource";
import { getApiBaseUrl } from "@/lib/api-endpoints";
import { ConvertDraftConfirmationDialog } from "@/modules/draft-jobs/details/components/ConvertDraftConfirmationDialog";
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

function capturePrimaryUrl(urls: readonly string[]): string | null {
  const u = urls.length > 0 ? urls[0]!.trim() : "";
  return u.length > 0 ? u : null;
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
  const [matchWizardOpen, setMatchWizardOpen] = useState(false);
  const [fillJobAutomatically] = useFillJobAutomaticallyMutation();
  const [updateJob] = useUpdateJobMutation();
  const [generateJobMatch, { loading: generatingMatch }] =
    useGenerateJobMatchMutation();
  const { enqueueToast } = useToastQueue();

  const { draft, error, refetch, status, notFound, wrongStage } =
    useDraftJobDetailsViewModel(id);
  const sseUrl = `${getApiBaseUrl()}/draft-jobs/${id}/stream`;
  useEventSource<{ draftId: string; status: string }>(
    sseUrl,
    "draft_conversion_status_changed",
    (data) => {
      if (
        data.status &&
        ["SUCCEEDED", "FAILED"].includes(String(data.status).toUpperCase()) &&
        refetch
      ) {
        void refetch();
      }
    },
  );

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

    const [error] = await tryRun(
      fillJobAutomatically({ variables: { jobId: draft.id } }),
    );

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
    void refetch();
  }, [draft, fillJobAutomatically, enqueueToast, refetch]);

  useDraftAutoConversion({
    draftLoaded: status === "success" && !!draft,
    onConvert: handleConvertToJob,
  });

  const handleSaveTitle = useCallback(
    async (nextValue: string) => {
      if (!draft) return;
      const [mutationError] = await tryRun(
        updateJob({
          variables: {
            id: draft.id,
            input: { title: nextValue.trim() || null },
          },
        }),
      );
      if (mutationError) {
        showToast(
          mutationError instanceof Error
            ? mutationError.message
            : "Could not update draft title.",
          "error",
        );
        return;
      }
      showToast("Draft title updated.", "success");
      void refetch();
    },
    [draft, updateJob, showToast, refetch],
  );

  const handleGenerateMatch = useCallback(
    async (resumeId: string) => {
      if (!draft) return;
      const [error, result] = await tryRun(
        generateJobMatch({
          variables: { input: { jobId: draft.id, resumeId } },
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
      if (result?.data?.generateJobMatch?.id) {
        router.push(`/matches/${result.data.generateJobMatch.id}`);
      }
    },
    [draft, generateJobMatch, enqueueToast, refetch, router],
  );

  function renderOverviewBody() {
    if (!draft) return null;
    const sourceUrl = capturePrimaryUrl(draft.urls);
    const truncatedUrl = sourceUrl ? truncateText(sourceUrl, 80) : null;
    const isUrlTruncated = !!(
      sourceUrl &&
      truncatedUrl &&
      truncatedUrl !== sourceUrl
    );
    const linkedJob =
      draft.currentStage !== ApplicationStage.Draft ? draft : null;
    const truncatedDraftId = truncateMiddle(draft.id, 8, 4);

    return (
      <OverviewSection layout="grid">
        {sourceUrl ? (
          <FieldWithLabelAction
            label="Source URL"
            content={
              <FieldWithLabelAction.Tooltip
                content={isUrlTruncated ? sourceUrl : undefined}
                enabled={isUrlTruncated}
              >
                <a
                  href={sourceUrl}
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
              {draft.title?.trim() ? draft.title!.trim() : "Untitled page"}
            </Text>
          }
        />
        <DraftTitleEditDialog
          control={titleDialog}
          value={draft.title ?? ""}
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
          srcDoc={draft.htmlContent ?? ""}
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
          <BackToLink href="/draft-jobs">Back to drafts</BackToLink>
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
                    {draft.currentStage !== ApplicationStage.Draft ? (
                      <DropdownMenuItem
                        onSelect={() => router.push(`/jobs/${draft.id}`)}
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
              {draft
                ? draftHeadingTitle(
                    draft.title ?? "",
                    capturePrimaryUrl(draft.urls),
                  )
                : "Draft job"}
            </span>{" "}
            {draft ? (
              <ConversionStatusBadge
                conversionMetadata={draft.fillMetadata}
                showSpinner={
                  draft.fillMetadata?.status?.toLowerCase() === "processing"
                }
                className={cn("ml-2 align-middle")}
              />
            ) : null}
          </Heading>
          {draft ? (
            <span className={cn("shrink-0 pt-1 text-xs text-text-muted")}>
              {draft.fillMetadata?.timestamp
                ? `Updated at ${formatDate(draft.fillMetadata.timestamp)}`
                : `Created at ${formatDate(draft.createdAt)}`}
            </span>
          ) : null}
        </div>
        {draft ? (
          <DeleteDraftJobDialog
            draftId={draft.id}
            draftSummary={draftHeadingTitle(
              draft.title ?? "",
              capturePrimaryUrl(draft.urls),
            )}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onSuccess={(msg) => {
              showToast(msg, "success");
              router.push("/draft-jobs");
            }}
            onError={(msg) => showToast(msg, "error")}
          />
        ) : null}
        <ConvertDraftConfirmationDialog
          open={convertConfirmDialogOpen}
          draftSummary={
            draft
              ? draftHeadingTitle(
                  draft.title ?? "",
                  capturePrimaryUrl(draft.urls),
                )
              : "this draft"
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
        {status === "loading" ? (
          <Text size="sm" color="secondary">
            Loading draft...
          </Text>
        ) : notFound ? (
          <EntityNotFound
            resource="draft job"
            backHref="/draft-jobs"
            backLabel="Back to draft jobs"
          />
        ) : wrongStage ? (
          <EntityNotFound
            resource="draft job"
            backHref={`/jobs/${id}`}
            backLabel="Open job record"
          />
        ) : error && !notFound ? (
          <Text size="sm" color="error">
            Failed to load draft job.
          </Text>
        ) : !draft ? null : (
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
