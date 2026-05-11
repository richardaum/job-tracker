"use client";

import { Button, cn, Heading, Input, Text } from "@job-tracker/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { TipTapEditor } from "@/modules/applications/details/components/TipTapEditor";
import { useToastQueue } from "@/modules/applications/shared/hooks/useToastQueue";
import {
  EMPTY_TIPTAP_DOC,
  normalizeTipTapDocument,
} from "@/modules/applications/shared/utils/tiptap";
/* MOCK DATA: replace with real ViewModel when T-176/180 ready */
import { useMockResume } from "@/modules/resumes/list/hooks/useMockResumes";

/* MOCK DATA: replace with real mutations + Apollo refetchQueries (T-180) */
function useResumeEditorState(resumeId: string, onSaved: () => void) {
  const { resume, notFound, showInitialLoading } = useMockResume(resumeId);

  const [draftState, setDraftState] = React.useState<{
    resumeId: string | null;
    title: string;
    content: string;
  }>({ resumeId: null, title: "", content: EMPTY_TIPTAP_DOC });

  const [saving, setSaving] = React.useState(false);

  const currentTitle = resume?.title ?? "";
  const currentContent = normalizeTipTapDocument(resume?.content);

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
    /* MOCK DATA: replace with real updateResume mutation */
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    setSaving(false);
    onSaved();
  }

  return {
    resume,
    notFound,
    showInitialLoading,
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

  /* MOCK DATA: replace with real delete mutation + confirmation dialog */
  function _handleDelete() {
    const ok = window.confirm(`Delete "${titleDraft}"?`);
    if (ok) {
      router.push("/resumes");
    }
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
            <Button
              intent="primary"
              size="md"
              onClick={() => void handleSave()}
              disabled={!hasChanges || saving}
              state={saving ? "loading" : "default"}
            >
              Save
            </Button>
            {/* MOCK DATA: Actions dropdown (delete) when T-180 ready */}
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
