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
  useApplicationQuery,
  useCreateApplicationWithAiMutation,
  useGenerateDraftApplicationFitMutation,
  useUpdateDraftApplicationMutation,
} from "@/gql/hooks";
import { useEventSource } from "@/hooks/useEventSource";
import { getApiBaseUrl } from "@/lib/api-endpoints";
import { useToastQueue } from "@/modules/applications/shared/hooks/useToastQueue";
import { ConvertDraftConfirmationDialog } from "@/modules/draft-applications/details/components/ConvertDraftConfirmationDialog";
import { ConvertDraftConflictDialog } from "@/modules/draft-applications/details/components/ConvertDraftConflictDialog";
import { DraftCurrentApplicationField } from "@/modules/draft-applications/details/components/DraftCurrentApplicationField";
import { DraftTitleEditDialog } from "@/modules/draft-applications/details/components/DraftTitleEditDialog";
import { useDraftApplicationDetailsViewModel } from "@/modules/draft-applications/details/hooks/useDraftApplicationDetailsViewModel";
import { useDraftAutoConversion } from "@/modules/draft-applications/details/hooks/useDraftAutoConversion";
import { DeleteDraftApplicationDialog } from "@/modules/draft-applications/list/components/DeleteDraftApplicationDialog";
import { ConversionStatusBadge } from "@/modules/draft-applications/shared/components/ConversionStatusBadge";
import { FitWizardDialog } from "@/modules/fit-analyses/details/components/FitWizardDialog";

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

export default function DraftApplicationDetailsPage({ params }: PageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const titleDialog = useDialog();
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [convertConfirmDialogOpen, setConvertConfirmDialogOpen] =
    useState(false);
  const [convertConflictDialogOpen, setConvertConflictDialogOpen] =
    useState(false);
  const [fitWizardOpen, setFitWizardOpen] = useState(false);
  const [createApplicationWithAI] = useCreateApplicationWithAiMutation();
  const [updateDraftApplication] = useUpdateDraftApplicationMutation();
  const [generateDraftFit, { loading: generatingFit }] =
    useGenerateDraftApplicationFitMutation();
  const { enqueueToast } = useToastQueue();

  const { draft, error, refetch, showInitialLoading } =
    useDraftApplicationDetailsViewModel(id);
  const sseUrl = `${getApiBaseUrl()}/draft-applications/${id}/stream`;
  useEventSource<{ draftId: string; status: string }>(
    sseUrl,
    "draft_conversion_status_changed",
    (data) => {
      if (
        (data.status === "succeeded" || data.status === "failed") &&
        refetch
      ) {
        void refetch();
      }
    },
  );
  const { data: applicationData } = useApplicationQuery({
    variables: { id: draft?.applicationId ?? "" },
    skip: !draft?.applicationId,
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

  const handleConvertToApplication = useCallback(async () => {
    if (!draft) return;

    if (draft.applicationId) {
      setConvertConflictDialogOpen(true);
      return;
    }

    const [error] = await tryRun(
      createApplicationWithAI({ variables: { draftId: draft.id } }),
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
  }, [draft, createApplicationWithAI, enqueueToast, refetch]);

  useDraftAutoConversion({
    draftLoaded: !showInitialLoading && !!draft,
    onConvert: handleConvertToApplication,
  });

  const handleSaveTitle = useCallback(
    async (nextValue: string) => {
      if (!draft) return;
      const [mutationError] = await tryRun(
        updateDraftApplication({
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
    [draft, updateDraftApplication, showToast, refetch],
  );

  const handleGenerateFit = useCallback(
    async (resumeId: string) => {
      if (!draft) return;
      const [error, result] = await tryRun(
        generateDraftFit({
          variables: { input: { draftApplicationId: draft.id, resumeId } },
        }),
      );
      if (error) {
        enqueueToast({
          title:
            error instanceof Error
              ? error.message.replace("Bad Request Exception: ", "")
              : "Failed to generate fit analysis.",
          intent: "error",
        });
        return;
      }
      enqueueToast({
        title: "Fit analysis generation started.",
        intent: "success",
      });
      void refetch();
      if (result?.data?.generateDraftApplicationFit?.id) {
        router.push(`/fits/${result.data.generateDraftApplicationFit.id}`);
      }
    },
    [draft, generateDraftFit, enqueueToast, refetch, router],
  );

  function renderOverviewBody() {
    if (!draft) return null;
    const truncatedUrl = draft.url ? truncateText(draft.url, 80) : null;
    const isUrlTruncated = truncatedUrl !== draft.url;
    const linkedApplication = applicationData?.application ?? null;
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
        <DraftCurrentApplicationField application={linkedApplication} />
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
            href="/draft-applications"
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
                    {draft.applicationId ? (
                      <DropdownMenuItem
                        onSelect={() =>
                          router.push(`/applications/${draft.applicationId}`)
                        }
                      >
                        Open application
                      </DropdownMenuItem>
                    ) : null}
                    {draft.fit?.id ? (
                      <DropdownMenuItem
                        onSelect={() => router.push(`/fits/${draft.fit!.id}`)}
                        icon={<SparkleIcon size={14} weight="regular" />}
                      >
                        Fit analysis
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onSelect={() => setFitWizardOpen(true)}
                        icon={<SparkleIcon size={14} weight="regular" />}
                      >
                        Fit analysis
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onSelect={() => {
                        setConvertConfirmDialogOpen(true);
                      }}
                    >
                      Convert to application
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
                ? draftHeadingTitle(draft.title, draft.url)
                : "Draft application"}
            </span>{" "}
            {draft ? (
              <ConversionStatusBadge
                conversionStatus={draft.conversionStatus}
                conversionError={draft.conversionError}
                showSpinner={
                  draft.conversionStatus.toLowerCase() === "processing"
                }
                className={cn("ml-2 align-middle")}
              />
            ) : null}
          </Heading>
          {draft ? (
            <span className={cn("shrink-0 pt-1 text-xs text-text-muted")}>
              {draft.convertedAt
                ? `Converted at ${formatDate(draft.convertedAt)}`
                : `Created at ${formatDate(draft.createdAt)}`}
            </span>
          ) : null}
        </div>
        {draft ? (
          <DeleteDraftApplicationDialog
            draftId={draft.id}
            draftSummary={draftHeadingTitle(draft.title, draft.url)}
            hasLinkedApplication={Boolean(draft.applicationId)}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onSuccess={(msg) => {
              showToast(msg, "success");
              router.push("/draft-applications");
            }}
            onError={(msg) => showToast(msg, "error")}
          />
        ) : null}
        <ConvertDraftConflictDialog
          open={convertConflictDialogOpen}
          draftId={draft?.id}
          previousApplicationId={draft?.applicationId ?? null}
          onOpenChange={setConvertConflictDialogOpen}
          onDeletePreviousSuccess={() => {
            enqueueToast({
              title: "Linked applications removed for this draft.",
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
          onConfirm={handleConvertToApplication}
        />
        <FitWizardDialog
          open={fitWizardOpen}
          onOpenChange={setFitWizardOpen}
          onGenerate={handleGenerateFit}
          generating={generatingFit}
          hasExistingFit={!!draft?.fit}
        />
      </div>

      <div className={cn("min-h-0 flex-1 overflow-hidden p-4 sm:p-6")}>
        {showInitialLoading ? (
          <Text size="sm" color="secondary">
            Loading draft...
          </Text>
        ) : error ? (
          <Text size="sm" color="error">
            Failed to load draft application.
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
