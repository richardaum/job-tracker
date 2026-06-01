"use client";

import { EMPTY_TIPTAP_DOC } from "@job-tracker/tiptap";
import { Button, cn, Dialog, Input } from "@job-tracker/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ResumesDocument, useCreateResumeMutation } from "@/gql/hooks";

interface AddResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddResumeDialog({ open, onOpenChange }: AddResumeDialogProps) {
  const router = useRouter();
  const [createResume] = useCreateResumeMutation({ refetchQueries: [{ query: ResumesDocument }] });

  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  // Reset state when opening
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setTitle("");
      setCreating(false);
    }
  }

  async function handleCreate() {
    if (!title.trim()) return;
    setCreating(true);
    try {
      const { data } = await createResume({ variables: { input: { title: title.trim(), content: EMPTY_TIPTAP_DOC } } });

      if (data?.createResume) {
        onOpenChange(false);
        router.push(`/profile/resumes/${data.createResume.id}`);
      }
    } catch (err) {
      console.error("Failed to create resume:", err);
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Resume"
      description="Enter a title for your new resume. You can import content from a PDF or start writing in the next step."
      footer={
        <div className={cn("flex justify-end gap-2")}>
          <Button intent="ghost" size="md" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            intent="primary"
            size="md"
            onClick={() => void handleCreate()}
            disabled={!title.trim() || creating}
            state={creating ? "loading" : "default"}
          >
            Create
          </Button>
        </div>
      }
    >
      <div className={cn("py-2")}>
        <Input
          autoFocus
          placeholder="e.g. Senior Software Engineer - Frontend"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void handleCreate();
            }
          }}
        />
      </div>
    </Dialog>
  );
}
