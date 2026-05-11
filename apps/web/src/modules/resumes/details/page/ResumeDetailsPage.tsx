"use client";

import { tryRun } from "@job-tracker/try-run";
import { Button, cn, Heading, Input, Text } from "@job-tracker/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import {
  ResumeDocument,
  ResumesDocument,
  useDeleteResumeMutation,
  useResumeQuery,
  useUpdateResumeMutation,
} from "@/gql/hooks";
import { TipTapEditor } from "@/modules/applications/details/components/TipTapEditor";
import { useToastQueue } from "@/modules/applications/shared/hooks/useToastQueue";
import {
  EMPTY_TIPTAP_DOC,
  normalizeTipTapDocument,
} from "@/modules/applications/shared/utils/tiptap";
import { DeleteResumeDialog } from "@/modules/resumes/list/components/DeleteResumeDialog";

function useResumeEditorState(resumeId: string, onSaved: () => void) {
  const { data, loading, error } = useResumeQuery({
    variables: { id: resumeId },
    fetchPolicy: "cache-and-network",
  });
  const [updateResume] = useUpdateResumeMutation({
    refetchQueries: [
      { query: ResumesDocument },
      { query: ResumeDocument, variables: { id: resumeId } },
    ],
    awaitRefetchQueries: true,
  });

  const resume = data?.resume ?? null;

  const [draftState, setDraftState] = React.useState<{
    resumeId: string | null;
    title: string;
    content: string;
  }>({ resumeId: null, title: "", content: EMPTY_TIPTAP_DOC });

  const [saving, setSaving] = React.useState(false);

  const currentTitle = resume?.title ?? "";
  const currentContent = normalizeTipTapDocument(
    resume?.content ?? EMPTY_TIPTAP_DOC,
  );

  const titleDraft =
    draftState.resumeId === resume?.id ? draftState.title : currentTitle;
  const contentDraft =
    draftState.resumeId === resume?.id ? draftState.content : currentContent;

  const hasChanges =
    titleDraft !== currentTitle || contentDraft !== currentContent;

  function commitDraft(title: string, content: string) {
    setDraftState({ resumeId: resume?.id ?? null, title, content });
  }

  async function handleSave() {
    if (!resume) return;
    setSaving(true);
    try {
      await updateResume({
        variables: {
          id: resume.id,
          input: { title: titleDraft, content: contentDraft },
        },
      });
      setDraftState({ resumeId: null, title: "", content: EMPTY_TIPTAP_DOC });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return {
    resume,
    notFound: !loading && !error && !resume,
    showInitialLoading: loading && !data,
    titleDraft,
    setTitleDraft: (title: string) => commitDraft(title, contentDraft),
    contentDraft,
    setContentDraft: (content: string) => commitDraft(titleDraft, content),
    saving,
    hasChanges,
    handleSave,
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResumeDetailsPage({ params }: PageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const { enqueueToast } = useToastQueue();
  const [deleteResume] = useDeleteResumeMutation({
    refetchQueries: [{ query: ResumesDocument }],
    awaitRefetchQueries: true,
  });

  const {
    resume,
    notFound,
    showInitialLoading,
    titleDraft,
    setTitleDraft,
    contentDraft,
    setContentDraft,
    saving,
    hasChanges,
    handleSave,
  } = useResumeEditorState(id, () =>
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
    router.push("/resumes");
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      {/* Header */}
      <div
        className={cn(
          "flex flex-col gap-3 border-b border-border-subtle p-4 sm:px-6 sm:py-5",
        )}
      >
        <div className={cn("flex items-center justify-between gap-3")}>
          <Link
            href="/resumes"
            className={cn(
              "text-sm text-text-secondary underline-offset-2 hover:underline",
            )}
          >
            Back to resumes
          </Link>
          <div className={cn("flex items-center gap-2")}>
            <DeleteResumeDialog
              resumeId={id}
              resumeTitle={titleDraft}
              onConfirm={() => void handleDelete()}
              trigger={
                <Button intent="destructive" size="md">
                  Delete
                </Button>
              }
            />
            <Button
              intent="primary"
              size="md"
              onClick={() => void handleSave()}
              disabled={!hasChanges || saving}
              state={saving ? "loading" : "default"}
            >
              Save
            </Button>
          </div>
        </div>

        <Heading as="h1" size="2xl" className={cn("min-w-0")}>
          <Input
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            placeholder="Resume title"
            className={cn(
              "text-2xl font-bold border-none p-0 h-auto shadow-none bg-transparent",
            )}
          />
        </Heading>
      </div>

      {/* Editor */}
      <div className={cn("flex-1 min-h-0 overflow-hidden p-4 sm:p-6")}>
        {showInitialLoading ? (
          <Text size="sm" color="secondary">
            Loading resume...
          </Text>
        ) : notFound ? (
          <Text size="sm" color="secondary">
            Resume not found.
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
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
