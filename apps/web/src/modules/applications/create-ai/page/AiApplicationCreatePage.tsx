"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SparkleIcon, FloppyDiskBackIcon } from "@phosphor-icons/react";
import {
  Button,
  Card,
  FormField,
  IconButton,
  Input,
  Textarea,
  Text,
  Toast,
  cn,
} from "@job-tracker/ui";
import {
  TagsInput,
  type TagWithMetadata,
} from "@/modules/applications/shared/components/TagsInput";
import { DEFAULT_FIELDS } from "./default-fields";
import {
  ApplicationsDocument,
  useCreateApplicationMutation,
  useCreateApplicationNoteMutation,
  useGenerateApplicationDraftWithAiMutation,
} from "@/gql/hooks";
import {
  formatGeneratedDraftToFormState,
  parseCreateApplicationInput,
  parseDraftNoteContents,
  toTipTapDocument,
  type AiDraftFormState,
} from "./draft-parser";
import { HoverEditableFieldRow } from "@/modules/applications/details/components/HoverEditableFieldRow";
import { CompensationEditDialog } from "@/modules/applications/details/components/CompensationEditDialog";
import { TipTapEditor } from "@/modules/applications/details/components/TipTapEditor";
import { formatCompensationLine } from "@/modules/applications/shared/utils/compensationFormat";

export default function AiApplicationCreatePage() {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [fields, setFields] = useState<TagWithMetadata[]>(DEFAULT_FIELDS);
  const [requestStatus, setRequestStatus] = useState<"idle" | "error">("idle");
  const [createdApplicationId, setCreatedApplicationId] = useState<
    string | null
  >(null);
  const [draft, setDraft] = useState<AiDraftFormState | null>(null);
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    intent: "success" | "error";
  }>({
    open: false,
    message: "",
    intent: "success",
  });

  const refetchQueries = [{ query: ApplicationsDocument }];
  const [generateDraftWithAi, { loading: generating }] =
    useGenerateApplicationDraftWithAiMutation();
  const [createApplication, { loading: creating }] =
    useCreateApplicationMutation({ refetchQueries });
  const [createApplicationNote] = useCreateApplicationNoteMutation();
  const loading = generating || creating;

  function showToast(message: string, intent: "success" | "error") {
    setToast({ open: true, message, intent });
  }

  function handlePromptChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setPrompt(e.target.value);
    if (error) setError(undefined);
  }

  async function runDraftGeneration(customPrompt?: string) {
    try {
      const result = await generateDraftWithAi({
        variables: {
          input: {
            prompt: (customPrompt ?? prompt).trim(),
            fields:
              fields.length > 0
                ? fields.map((field) => ({
                    label: field.label,
                    metadata: field.metadata ?? null,
                  }))
                : null,
          },
        },
      });
      const generated = result.data?.generateApplicationDraftWithAI;
      if (!generated) throw new Error("No draft generated.");
      setDraft(formatGeneratedDraftToFormState(generated));
      setRequestStatus("idle");
      showToast("Draft generated. Review and confirm.", "success");
    } catch {
      setRequestStatus("error");
      showToast("Something went wrong. Please try again.", "error");
    }
  }

  async function handleGenerate(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please enter a prompt or paste a job description.");
      return;
    }
    setCreatedApplicationId(null);
    await runDraftGeneration();
  }

  async function handleReworkField(field: string) {
    if (!draft) return;
    const reworkPrompt = [
      prompt,
      "",
      `Current draft snapshot: ${JSON.stringify(draft)}`,
      `Rework only the field "${field}". Keep all other fields consistent with the current draft.`,
    ].join("\n");
    await runDraftGeneration(reworkPrompt);
  }

  async function handleCreateApplication() {
    if (!draft) return;
    if (!draft.title.trim() || !draft.company.trim()) {
      showToast("Title and company are required.", "error");
      return;
    }

    try {
      const created = await createApplication({
        variables: {
          input: parseCreateApplicationInput(draft),
        },
      });

      const applicationId = created.data?.createApplication.id;
      if (!applicationId) throw new Error("Failed to create application");

      const notes = parseDraftNoteContents(draft);

      for (const note of notes) {
        await createApplicationNote({
          variables: {
            input: {
              applicationId,
              content: toTipTapDocument(note),
            },
          },
        });
      }

      setCreatedApplicationId(applicationId);
      showToast("Application created from reviewed draft.", "success");
    } catch {
      showToast(
        "Failed to create application. Check the draft fields.",
        "error",
      );
    }
  }

  const compensationLine = draft
    ? formatCompensationLine({
        salaryMinCents: draft.salaryMinCents.trim()
          ? Number.parseInt(draft.salaryMinCents.trim(), 10)
          : null,
        salaryMaxCents: draft.salaryMaxCents.trim()
          ? Number.parseInt(draft.salaryMaxCents.trim(), 10)
          : null,
        salaryCurrency: draft.salaryCurrency.trim() || null,
        salaryPeriod: draft.salaryPeriod === "none" ? null : draft.salaryPeriod,
      })
    : null;

  return (
    <div className={cn("flex h-full flex-col")}>
      <div className={cn("border-b border-border-subtle px-4 py-4 sm:px-6")}>
        <div className={cn("flex items-start justify-between gap-3")}>
          <div>
            <Text size="lg" weight="semibold">
              New application with AI
            </Text>
            <Text size="sm" color="secondary" className={cn("mt-1")}>
              The easiest way to create an application.
            </Text>
          </div>
          <Button
            form="ai-application-form"
            type="submit"
            intent="primary"
            size="sm"
            state={loading ? "loading" : "default"}
            disabled={loading}
          >
            <SparkleIcon size={16} weight="bold" className={cn("mr-2")} />
            Generate draft
          </Button>
        </div>
      </div>

      <div className={cn("flex-1 overflow-auto p-4 sm:p-6")}>
        <div className={cn("grid grid-cols-1 gap-4 lg:grid-cols-2")}>
          <form id="ai-application-form" onSubmit={handleGenerate}>
            <FormField
              label="Job description or pasted job ad text"
              htmlFor="app-prompt"
              required
              error={error}
            >
              <Textarea
                id="app-prompt"
                value={prompt}
                onChange={handlePromptChange}
                placeholder="Paste the job description or any copied text from the job ad page. It does not need to be perfect."
                rows={14}
                state={error ? "error" : "default"}
                disabled={loading}
                className="resize-y min-h-[260px]"
              />
            </FormField>

            <div className="mt-4">
              <span className="text-sm text-text-secondary mb-2 block">
                Extraction fields
              </span>
              <TagsInput
                id="prompt-tags"
                value={fields}
                onChange={setFields}
                disabled={loading}
              />
            </div>
          </form>

          <div className="space-y-3">
            <Card variant="outlined" padding="sm">
              <Text size="sm" weight="medium">
                AI draft review
              </Text>
              {draft ? (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <HoverEditableFieldRow
                      label="title"
                      editControl={
                        <IconButton
                          intent="ghost"
                          size="sm"
                          label="Rework title"
                          tooltip="Rework title with AI"
                          icon={<SparkleIcon size={14} weight="regular" />}
                          className={cn(
                            "h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
                          )}
                          onClick={() => handleReworkField("title")}
                          disabled={loading}
                        />
                      }
                      content={
                        <Input
                          id="draft-title"
                          value={draft.title}
                          onChange={(event) =>
                            setDraft((prev) =>
                              prev
                                ? { ...prev, title: event.target.value }
                                : prev,
                            )
                          }
                          disabled={loading}
                        />
                      }
                    />
                    <HoverEditableFieldRow
                      label="company"
                      editControl={
                        <IconButton
                          intent="ghost"
                          size="sm"
                          label="Rework company"
                          tooltip="Rework company with AI"
                          icon={<SparkleIcon size={14} weight="regular" />}
                          className={cn(
                            "h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
                          )}
                          onClick={() => handleReworkField("company")}
                          disabled={loading}
                        />
                      }
                      content={
                        <Input
                          id="draft-company"
                          value={draft.company}
                          onChange={(event) =>
                            setDraft((prev) =>
                              prev
                                ? { ...prev, company: event.target.value }
                                : prev,
                            )
                          }
                          disabled={loading}
                        />
                      }
                    />
                  </div>

                  <HoverEditableFieldRow
                    label="description"
                    editControl={
                      <IconButton
                        intent="ghost"
                        size="sm"
                        label="Rework description"
                        tooltip="Rework description with AI"
                        icon={<SparkleIcon size={14} weight="regular" />}
                        className={cn(
                          "h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
                        )}
                        onClick={() => handleReworkField("description")}
                        disabled={loading}
                      />
                    }
                    content={
                      <TipTapEditor
                        id="draft-description"
                        value={draft.description}
                        onChange={(nextValue) =>
                          setDraft((prev) =>
                            prev ? { ...prev, description: nextValue } : prev,
                          )
                        }
                        disabled={loading}
                        placeholder="Job description…"
                      />
                    }
                  />

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <HoverEditableFieldRow
                      label="url"
                      editControl={
                        <IconButton
                          intent="ghost"
                          size="sm"
                          label="Rework url"
                          tooltip="Rework url with AI"
                          icon={<SparkleIcon size={14} weight="regular" />}
                          className={cn(
                            "h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
                          )}
                          onClick={() => handleReworkField("url")}
                          disabled={loading}
                        />
                      }
                      content={
                        <Input
                          id="draft-url"
                          value={draft.url}
                          onChange={(event) =>
                            setDraft((prev) =>
                              prev
                                ? { ...prev, url: event.target.value }
                                : prev,
                            )
                          }
                          disabled={loading}
                        />
                      }
                    />
                    <HoverEditableFieldRow
                      label="compensation"
                      editControl={
                        <div className={cn("flex items-center gap-1")}>
                          <IconButton
                            intent="ghost"
                            size="sm"
                            label="Rework compensation"
                            tooltip="Rework compensation with AI"
                            icon={<SparkleIcon size={14} weight="regular" />}
                            className={cn(
                              "h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
                            )}
                            onClick={() =>
                              handleReworkField(
                                "salaryMinCents, salaryMaxCents, salaryCurrency, salaryPeriod",
                              )
                            }
                            disabled={loading}
                          />
                          <Button
                            type="button"
                            size="sm"
                            intent="outlined"
                            className={cn(
                              "h-7 px-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
                            )}
                            onClick={() => setSalaryDialogOpen(true)}
                            disabled={loading}
                          >
                            Edit
                          </Button>
                        </div>
                      }
                      content={
                        <Text size="sm" color="secondary">
                          {compensationLine ?? "Not set"}
                        </Text>
                      }
                    />
                  </div>

                  <HoverEditableFieldRow
                    label="tags (comma-separated)"
                    editControl={
                      <IconButton
                        intent="ghost"
                        size="sm"
                        label="Rework tags"
                        tooltip="Rework tags with AI"
                        icon={<SparkleIcon size={14} weight="regular" />}
                        className={cn(
                          "h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
                        )}
                        onClick={() => handleReworkField("tags")}
                        disabled={loading}
                      />
                    }
                    content={
                      <Textarea
                        id="draft-tags"
                        rows={2}
                        value={draft.tagsText}
                        onChange={(event) =>
                          setDraft((prev) =>
                            prev
                              ? { ...prev, tagsText: event.target.value }
                              : prev,
                          )
                        }
                        disabled={loading}
                      />
                    }
                  />

                  <HoverEditableFieldRow
                    label="noteContents (one line per note)"
                    editControl={
                      <IconButton
                        intent="ghost"
                        size="sm"
                        label="Rework noteContents"
                        tooltip="Rework noteContents with AI"
                        icon={<SparkleIcon size={14} weight="regular" />}
                        className={cn(
                          "h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
                        )}
                        onClick={() => handleReworkField("noteContents")}
                        disabled={loading}
                      />
                    }
                    content={
                      <Textarea
                        id="draft-notes"
                        rows={4}
                        value={draft.noteContentsText}
                        onChange={(event) =>
                          setDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  noteContentsText: event.target.value,
                                }
                              : prev,
                          )
                        }
                        disabled={loading}
                      />
                    }
                  />
                </div>
              ) : (
                <Text size="xs" color="muted">
                  Generate a draft first, then review and edit before creating.
                </Text>
              )}
            </Card>

            {requestStatus === "error" ? (
              <Text size="sm" color="error">
                Request failed. Update prompt/fields and try again.
              </Text>
            ) : null}
            {draft ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  intent="primary"
                  size="sm"
                  onClick={handleCreateApplication}
                  disabled={loading}
                  state={creating ? "loading" : "default"}
                >
                  <FloppyDiskBackIcon size={16} className={cn("mr-2")} />
                  Confirm and create application
                </Button>
              </div>
            ) : null}
            {createdApplicationId ? (
              <Button
                intent="primary"
                size="sm"
                onClick={() => {
                  router.push(`/applications/${createdApplicationId}`);
                }}
              >
                Open created application
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {draft ? (
        <CompensationEditDialog
          mode="draft"
          open={salaryDialogOpen}
          onOpenChange={setSalaryDialogOpen}
          compensation={{
            salaryMinCents: draft.salaryMinCents.trim()
              ? Number.parseInt(draft.salaryMinCents.trim(), 10)
              : null,
            salaryMaxCents: draft.salaryMaxCents.trim()
              ? Number.parseInt(draft.salaryMaxCents.trim(), 10)
              : null,
            salaryCurrency: draft.salaryCurrency,
            salaryPeriod:
              draft.salaryPeriod === "none" ? null : draft.salaryPeriod,
          }}
          onCompensationSave={(next) => {
            setDraft((prev) =>
              prev
                ? {
                    ...prev,
                    salaryMinCents:
                      next.salaryMinCents != null
                        ? String(next.salaryMinCents)
                        : "",
                    salaryMaxCents:
                      next.salaryMaxCents != null
                        ? String(next.salaryMaxCents)
                        : "",
                    salaryCurrency: next.salaryCurrency ?? "",
                    salaryPeriod: next.salaryPeriod ?? "none",
                  }
                : null,
            );
          }}
          disabled={loading}
        />
      ) : null}

      <Toast
        trigger={<span aria-hidden style={{ display: "none" }} />}
        open={toast.open}
        onOpenChange={(open) => setToast((prev) => ({ ...prev, open }))}
        title={toast.message}
        intent={toast.intent}
      />
    </div>
  );
}
