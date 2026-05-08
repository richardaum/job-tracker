"use client";

import {
  Button,
  Card,
  cn,
  FieldWithLabelAction,
  FormField,
  IconButton,
  Input,
  Text,
  Textarea,
} from "@job-tracker/ui";
import { FloppyDiskBackIcon, SparkleIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import {
  ApplicationsDocument,
  ApplicationStage,
  useCreateApplicationMutation,
  useCreateApplicationNoteMutation,
  useCreateApplicationStageEventMutation,
  useGenerateApplicationDraftWithAiLazyQuery,
} from "@/gql/hooks";
import { SalaryEditDialog } from "@/modules/applications/details/components/SalaryEditDialog";
import { TipTapEditor } from "@/modules/applications/details/components/TipTapEditor";
import {
  TagsInput,
  type TagWithMetadata,
} from "@/modules/applications/shared/components/TagsInput";
import { useToastQueue } from "@/modules/applications/shared/hooks/useToastQueue";
import { formatSalary } from "@/modules/applications/shared/utils/salaryFormat";
import {
  EMPTY_TIPTAP_DOC,
  tipTapToPlainText,
} from "@/modules/applications/shared/utils/tiptap";

import { DEFAULT_FIELDS } from "./default-fields";
import {
  type AiDraftFormState,
  formatGeneratedDraftToFormState,
  parseCreateApplicationInput,
  parseDraftNoteContents,
  toTipTapDocument,
} from "./draft-parser";

export default function AiApplicationCreatePage() {
  const router = useRouter();

  const [prompt, setPrompt] = useState(EMPTY_TIPTAP_DOC);
  const [error, setError] = useState<string | undefined>();
  const [fields, setFields] = useState<TagWithMetadata[]>(DEFAULT_FIELDS);
  const [requestStatus, setRequestStatus] = useState<"idle" | "error">("idle");
  const [createdApplicationId, setCreatedApplicationId] = useState<
    string | null
  >(null);
  const [draft, setDraft] = useState<AiDraftFormState | null>(null);
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);
  const { enqueueToast } = useToastQueue();

  const refetchQueries = [{ query: ApplicationsDocument }];
  const [generateDraftWithAi, { loading: generating }] =
    useGenerateApplicationDraftWithAiLazyQuery({ fetchPolicy: "no-cache" });
  const [createApplication, { loading: creating }] =
    useCreateApplicationMutation({ refetchQueries, awaitRefetchQueries: true });
  const [createApplicationNote] = useCreateApplicationNoteMutation();
  const [createApplicationStageEvent, { loading: creatingStageEvent }] =
    useCreateApplicationStageEventMutation();
  const loading = generating || creating || creatingStageEvent;

  function showToast(message: string, intent: "success" | "error") {
    enqueueToast({ title: message, intent });
  }

  const promptText = tipTapToPlainText(prompt).trim();

  async function runDraftGeneration(customPrompt?: string) {
    try {
      const result = await generateDraftWithAi({
        variables: {
          input: {
            prompt: (customPrompt ?? promptText).trim(),
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
    if (!promptText) {
      setError("Please enter a prompt or paste a job description.");
      return;
    }
    setCreatedApplicationId(null);
    await runDraftGeneration();
  }

  async function handleReworkField(field: string) {
    if (!draft) return;
    const reworkPrompt = [
      promptText,
      "",
      `Current draft snapshot: ${JSON.stringify(draft)}`,
      `Rework only the field "${field}". Keep all other fields consistent with the current draft.`,
    ].join("\n");
    await runDraftGeneration(reworkPrompt);
  }

  async function handleCreateApplication(
    statusOnCreate: "new" | "applied" = "new",
  ) {
    if (!draft) return;
    if (!draft.title.trim() || !draft.company.trim()) {
      showToast("Title and company are required.", "error");
      return;
    }

    try {
      const created = await createApplication({
        variables: { input: parseCreateApplicationInput(draft) },
      });

      const applicationId = created.data?.createApplication.id;
      if (!applicationId) throw new Error("Failed to create application");

      const notes = parseDraftNoteContents(draft);

      for (const note of notes) {
        await createApplicationNote({
          variables: {
            input: { applicationId, content: toTipTapDocument(note) },
          },
        });
      }

      if (statusOnCreate === "applied") {
        await createApplicationStageEvent({
          variables: {
            input: {
              applicationId,
              toStage: ApplicationStage.Applied,
              source: "ai-draft-review",
            },
          },
        });
      }

      setCreatedApplicationId(applicationId);
      showToast(
        statusOnCreate === "applied"
          ? "Application created from reviewed draft with status applied."
          : "Application created from reviewed draft.",
        "success",
      );
    } catch {
      showToast(
        "Failed to create application. Check the draft fields.",
        "error",
      );
    }
  }

  const salaryLine = draft
    ? formatSalary({
        minCents: draft.salaryMinCents.trim()
          ? Number.parseInt(draft.salaryMinCents.trim(), 10)
          : null,
        maxCents: draft.salaryMaxCents.trim()
          ? Number.parseInt(draft.salaryMaxCents.trim(), 10)
          : null,
        currency: draft.salaryCurrency.trim() || null,
        period: draft.salaryPeriod === "none" ? null : draft.salaryPeriod,
      })
    : null;

  return (
    <div className={cn("flex h-full flex-col")}>
      <div className={cn("border-b border-border-subtle p-4  sm:px-6")}>
        <div
          className={cn(
            "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
          )}
        >
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
            className={cn("w-full sm:w-auto")}
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
              <TipTapEditor
                id="app-prompt"
                value={prompt}
                onChange={(nextValue) => {
                  setPrompt(nextValue);
                  if (error) setError(undefined);
                }}
                placeholder="Paste the job description or any copied text from the job ad page. It does not need to be perfect."
                disabled={loading}
                enableVoiceToText
                voiceToTextLanguage="en-US"
                contentClassName={cn("min-h-[260px]")}
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
                    <FieldWithLabelAction
                      label="title"
                      actions={
                        <IconButton
                          intent="ghost"
                          size="sm"
                          label="Rework title"
                          tooltip="Rework title with AI"
                          icon={<SparkleIcon size={14} weight="regular" />}
                          className={cn(
                            "size-7  opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
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
                    <FieldWithLabelAction
                      label="company"
                      actions={
                        <IconButton
                          intent="ghost"
                          size="sm"
                          label="Rework company"
                          tooltip="Rework company with AI"
                          icon={<SparkleIcon size={14} weight="regular" />}
                          className={cn(
                            "size-7  opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
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

                  <FieldWithLabelAction
                    label="description"
                    actions={
                      <IconButton
                        intent="ghost"
                        size="sm"
                        label="Rework description"
                        tooltip="Rework description with AI"
                        icon={<SparkleIcon size={14} weight="regular" />}
                        className={cn(
                          "size-7  opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
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
                    <FieldWithLabelAction
                      label="url"
                      actions={
                        <IconButton
                          intent="ghost"
                          size="sm"
                          label="Rework url"
                          tooltip="Rework url with AI"
                          icon={<SparkleIcon size={14} weight="regular" />}
                          className={cn(
                            "size-7  opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
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
                    <FieldWithLabelAction
                      label="salary"
                      actions={[
                        <IconButton
                          key="salary-rework"
                          intent="ghost"
                          size="sm"
                          label="Rework salary"
                          tooltip="Rework salary with AI"
                          icon={<SparkleIcon size={14} weight="regular" />}
                          className={cn(
                            "size-7  opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
                          )}
                          onClick={() =>
                            handleReworkField(
                              "minCents, maxCents, currency, period",
                            )
                          }
                          disabled={loading}
                        />,
                        <Button
                          key="salary-edit"
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
                        </Button>,
                      ]}
                      content={
                        <Text size="sm" color="secondary">
                          {salaryLine ?? "Not set"}
                        </Text>
                      }
                    />
                  </div>

                  <FieldWithLabelAction
                    label="tags (comma-separated)"
                    actions={
                      <IconButton
                        intent="ghost"
                        size="sm"
                        label="Rework tags"
                        tooltip="Rework tags with AI"
                        icon={<SparkleIcon size={14} weight="regular" />}
                        className={cn(
                          "size-7  opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
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

                  <FieldWithLabelAction
                    label="noteContents (one line per note)"
                    actions={
                      <IconButton
                        intent="ghost"
                        size="sm"
                        label="Rework noteContents"
                        tooltip="Rework noteContents with AI"
                        icon={<SparkleIcon size={14} weight="regular" />}
                        className={cn(
                          "size-7  opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
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
                  onClick={() => handleCreateApplication("new")}
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
        <SalaryEditDialog
          mode="draft"
          open={salaryDialogOpen}
          onOpenChange={setSalaryDialogOpen}
          salaryDraft={{
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
          onSalarySave={(next) => {
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
    </div>
  );
}
