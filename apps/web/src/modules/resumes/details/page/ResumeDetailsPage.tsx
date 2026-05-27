"use client";

import { EMPTY_TIPTAP_DOC } from "@job-tracker/tiptap";
import { tryRun } from "@job-tracker/try-run";
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Heading,
  Text,
  useDialog,
} from "@job-tracker/ui";
import {
  CaretDownIcon,
  PencilSimpleIcon,
  StarIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { BackToLink } from "@/components/back-to-link";
import { DetailPageHeader } from "@/components/detail-page-header";
import { EntityNotFound } from "@/components/entity-not-found";
import { ResumesDocument, useDeleteResumeMutation } from "@/gql/hooks";
import { TipTapEditor } from "@/modules/jobs/details/components/TipTapEditor";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";
import { ResumeTitleEditDialog } from "@/modules/resumes/details/components/ResumeTitleEditDialog";
import { useResumeDetailsViewModel } from "@/modules/resumes/details/hooks/useResumeDetailsViewModel";
import { DeleteResumeDialog } from "@/modules/resumes/list/components/DeleteResumeDialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResumeDetailsPage({ params }: PageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const { enqueueToast } = useToastQueue();
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const titleDialog = useDialog();

  const [deleteResume] = useDeleteResumeMutation({
    refetchQueries: [{ query: ResumesDocument }],
    awaitRefetchQueries: true,
  });

  const {
    resume,
    error,
    notFound,
    status,
    titleDraft,
    contentDraft,
    setContentDraft,
    saving,
    hasChanges,
    handleSave,
    persistResumeTitle,
    setResumeDefault,
  } = useResumeDetailsViewModel(id, () =>
    enqueueToast({ title: "Resume saved.", intent: "success" }),
  );

  async function handleDelete() {
    if (!resume) return;
    const [err] = await tryRun(deleteResume({ variables: { id: resume.id } }));
    if (err) {
      enqueueToast({
        title: `Failed to delete "${titleDraft}".`,
        intent: "error",
      });
      return;
    }
    enqueueToast({ title: `"${titleDraft}" deleted.`, intent: "success" });
    router.push("/profile/resumes");
  }

  async function handlePersistTitle(nextTitle: string) {
    const [err] = await tryRun(persistResumeTitle(nextTitle));
    if (err) {
      enqueueToast({
        title: err.message ?? "Failed to update title.",
        intent: "error",
      });
      return;
    }
    enqueueToast({ title: "Resume title updated.", intent: "success" });
  }

  async function handleSetAsDefault() {
    const [err] = await tryRun(setResumeDefault());
    if (err) {
      enqueueToast({
        title: err.message ?? "Failed to update default resume.",
        intent: "error",
      });
      return;
    }
    enqueueToast({ title: "Default resume updated.", intent: "success" });
  }

  const actionsMenu = resume ? (
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
        onSelect={() => queueMicrotask(() => titleDialog.open())}
        icon={<PencilSimpleIcon size={14} weight="regular" />}
      >
        Update title
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={resume.isDefault}
        onSelect={() => void handleSetAsDefault()}
        icon={<StarIcon size={14} weight="regular" />}
      >
        Set as default
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        destructive
        onSelect={() => setDeleteDialogOpen(true)}
        icon={<TrashIcon size={14} weight="regular" />}
      >
        Delete
      </DropdownMenuItem>
    </DropdownMenu>
  ) : null;

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <DetailPageHeader
        reserveClassName={cn("pe-52 sm:pe-60")}
        stackClassName="gap-3"
        trailing={
          resume ? (
            <>
              {actionsMenu}
              <Button
                intent="primary"
                size="md"
                onClick={() => void handleSave()}
                disabled={!hasChanges || saving}
                state={saving ? "loading" : "default"}
              >
                Save
              </Button>
            </>
          ) : undefined
        }
      >
        <BackToLink href="/profile/resumes">Back to resumes</BackToLink>

        <div className={cn("flex min-w-0 flex-wrap items-center gap-2")}>
          <Heading
            as="h1"
            size="2xl"
            className={cn(
              "min-w-0 flex-1 truncate",
              resume ? "" : cn("text-text-secondary"),
            )}
          >
            {resume?.title ?? "Resume"}
          </Heading>
          {resume?.isDefault ? (
            <span
              className={cn("inline-flex shrink-0 items-center gap-1")}
              aria-label="Default resume"
            >
              <StarIcon
                size={20}
                weight="fill"
                className={cn("text-yellow-500")}
              />
            </span>
          ) : null}
        </div>
      </DetailPageHeader>

      <DeleteResumeDialog
        resumeId={id}
        resumeTitle={resume?.title ?? titleDraft}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => void handleDelete()}
        trigger={<span aria-hidden style={{ display: "none" }} />}
      />

      {resume ? (
        <ResumeTitleEditDialog
          control={titleDialog}
          value={resume.title}
          onSave={(nextTitle) => handlePersistTitle(nextTitle)}
        />
      ) : null}

      <div className={cn("flex-1 min-h-0 overflow-hidden p-4 sm:p-6")}>
        {status === "loading" ? (
          <Text size="sm" color="secondary">
            Loading resume...
          </Text>
        ) : notFound ? (
          <EntityNotFound
            resource="resume"
            backHref="/profile/resumes"
            backLabel="Back to resumes"
          />
        ) : error && !notFound ? (
          <Text size="sm" color="error">
            Failed to load resume details.
          </Text>
        ) : !resume ? null : (
          <div className={cn("flex h-full min-h-0 flex-col gap-3")}>
            <div className={cn("flex-1 min-h-0")}>
              <TipTapEditor
                id="resume-content-editor"
                value={contentDraft}
                onChange={(nextValue) =>
                  setContentDraft(nextValue || EMPTY_TIPTAP_DOC)
                }
                onHardEnter={() => void handleSave()}
                placeholder="Write your resume content here..."
                disabled={saving}
                fillHeight
                enableImport
                pdfExportConfig={{ getFileName: () => `resume` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
