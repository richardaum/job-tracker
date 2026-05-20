"use client";

import { EMPTY_TIPTAP_DOC, normalizeTipTapDocument } from "@job-tracker/tiptap";
import React from "react";

import {
  ResumeDocument,
  ResumesDocument,
  useResumeQuery,
  useUpdateResumeMutation,
} from "@/gql/hooks";
import { deriveDetailStatus } from "@/lib/entity-detail-view-status";

export function useResumeDetailsViewModel(
  resumeId: string,
  onSaved: () => void,
) {
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
  const status = deriveDetailStatus(loading, error);

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

  async function persistResumeTitle(trimmedTitle: string) {
    if (!resume) return;
    await updateResume({
      variables: { id: resume.id, input: { title: trimmedTitle } },
    });
    commitDraft(trimmedTitle, contentDraft);
  }

  async function setResumeDefault() {
    if (!resume) return;
    await updateResume({
      variables: { id: resume.id, input: { isDefault: true } },
    });
  }

  return {
    resume,
    error,
    notFound: status === "notFound",
    status,
    titleDraft,
    contentDraft,
    setContentDraft: (content: string) => commitDraft(titleDraft, content),
    saving,
    hasChanges,
    handleSave,
    persistResumeTitle,
    setResumeDefault,
  };
}
