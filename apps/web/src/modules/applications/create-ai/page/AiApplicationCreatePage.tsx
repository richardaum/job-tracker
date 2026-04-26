"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SparkleIcon } from "@phosphor-icons/react";
import {
  Button,
  Card,
  FormField,
  Textarea,
  Text,
  Toast,
  cn,
} from "@job-tracker/ui";
import {
  TagsInput,
  type TagWithMetadata,
} from "@/modules/applications/shared/components/TagsInput";
import {
  ApplicationsDocument,
  useCreateApplicationWithAiMutation,
} from "@/gql/hooks";

const DEFAULT_TAGS: TagWithMetadata[] = [
  { label: "Title", metadata: "as field value" },
  { label: "Company", metadata: "as field value" },
  { label: "Salary range", metadata: "currency, min, max" },
  { label: "Bonus", metadata: "as tags, bonus, stock options, etc." },
  { label: "Employment benefits", metadata: "PTO, etc." },
  { label: "Job description", metadata: "plain-text format" },
  { label: "Interview process", metadata: "as application note" },
  { label: "Timezone", metadata: "UTC-3, EST, PST, etc., unclear" },
  { label: "Location", metadata: "city, country, etc., unclear" },
  { label: "Tech stack", metadata: "as tags, e.g. React, Node.js, etc." },
  {
    label: "Skillset",
    metadata: "as tags, e.g. frontend heavy, backend heavy, full stack, etc.",
  },
  {
    label: "Work authorization",
    metadata: "as tags, US-only, LATAM, Brazil, anywhere, etc., unclear",
  },
  {
    label: "Work time",
    metadata:
      "as tag, remote-first, fully remote, onsite, hybrid, etc., unclear",
  },
];

export default function AiApplicationCreatePage() {
  const mountedRef = useRef(true);
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [tags, setTags] = useState<TagWithMetadata[]>(DEFAULT_TAGS);
  const [thinkingLog, setThinkingLog] = useState<string[]>([]);
  const [responseStream, setResponseStream] = useState("");
  const [requestStatus, setRequestStatus] = useState<
    "idle" | "running" | "success" | "error"
  >("idle");
  const [createdApplicationId, setCreatedApplicationId] = useState<
    string | null
  >(null);
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
  const [createApplicationWithAi, { loading }] =
    useCreateApplicationWithAiMutation({
      refetchQueries,
    });

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  function showToast(message: string, intent: "success" | "error") {
    setToast({ open: true, message, intent });
  }

  function handlePromptChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setPrompt(e.target.value);
    if (error) setError(undefined);
  }

  function toSerializableErrorPayload(caughtError: unknown) {
    if (!caughtError || typeof caughtError !== "object") {
      return { status: "error", raw: String(caughtError) };
    }

    const apolloLike = caughtError as {
      message?: unknown;
      graphQLErrors?: Array<{
        message?: unknown;
        path?: unknown;
        extensions?: unknown;
      }>;
      networkError?: unknown;
      cause?: unknown;
    };

    const graphQLErrorsFromApollo = Array.isArray(apolloLike.graphQLErrors)
      ? apolloLike.graphQLErrors.map((gqlError) => ({
          message: String(gqlError?.message ?? ""),
          path: gqlError?.path ?? null,
          extensions: gqlError?.extensions ?? null,
        }))
      : [];
    const graphQLErrorsFromRaw =
      Array.isArray((caughtError as { errors?: unknown[] }).errors) &&
      (caughtError as { errors?: unknown[] }).errors.length > 0
        ? ((caughtError as { errors: unknown[] }).errors
            .filter((errorItem) => !!errorItem && typeof errorItem === "object")
            .map((errorItem) => {
              const typed = errorItem as {
                message?: unknown;
                path?: unknown;
                extensions?: unknown;
              };
              return {
                message: String(typed.message ?? ""),
                path: typed.path ?? null,
                extensions: typed.extensions ?? null,
              };
            }) ?? [])
        : [];
    const graphQLErrors =
      graphQLErrorsFromApollo.length > 0
        ? graphQLErrorsFromApollo
        : graphQLErrorsFromRaw;

    const firstExtensions = graphQLErrors[0]?.extensions as
      | {
          aiOutputRaw?: unknown;
          aiOutputNormalized?: unknown;
          originalError?: {
            aiOutputRaw?: unknown;
            aiOutputNormalized?: unknown;
            response?: {
              aiOutputRaw?: unknown;
              aiOutputNormalized?: unknown;
            };
          };
        }
      | undefined;
    const aiOutputRaw =
      typeof firstExtensions?.aiOutputRaw === "string"
        ? firstExtensions.aiOutputRaw
        : typeof firstExtensions?.originalError?.aiOutputRaw === "string"
          ? firstExtensions.originalError.aiOutputRaw
          : typeof firstExtensions?.originalError?.response?.aiOutputRaw ===
              "string"
            ? firstExtensions.originalError.response.aiOutputRaw
            : null;
    const aiOutputNormalized =
      typeof firstExtensions?.aiOutputNormalized === "string"
        ? firstExtensions.aiOutputNormalized
        : typeof firstExtensions?.originalError?.aiOutputNormalized === "string"
          ? firstExtensions.originalError.aiOutputNormalized
          : typeof firstExtensions?.originalError?.response
                ?.aiOutputNormalized === "string"
            ? firstExtensions.originalError.response.aiOutputNormalized
            : null;

    return {
      status: "error",
      message:
        typeof apolloLike.message === "string"
          ? apolloLike.message
          : "Unknown error while generating application.",
      graphQLErrors,
      networkError: apolloLike.networkError ?? null,
      cause: apolloLike.cause ?? null,
      aiOutputRaw,
      aiOutputNormalized,
      // Keep a best-effort raw snapshot for debugging exact upstream output.
      raw: caughtError,
    };
  }

  async function streamResponseText(text: string) {
    setResponseStream("");
    for (let index = 0; index < text.length; index += 24) {
      if (!mountedRef.current) return;
      setResponseStream((prev) => prev + text.slice(index, index + 24));
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please enter a prompt or paste a job description.");
      return;
    }

    setRequestStatus("running");
    setCreatedApplicationId(null);
    setThinkingLog([
      "Queued request to AI service...",
      "Preparing async field extraction requests...",
    ]);
    setResponseStream("");
    const progressMessages = [
      "Running async extraction for: title",
      "Running async extraction for: company",
      "Running async extraction for: url",
      "Running async extraction for: description",
      "Running async extraction for: salaryCurrency, salaryMinCents, salaryMaxCents, salaryPeriod",
      "Running async extraction for: tags and noteBlocks",
      "Merging extracted fields into final application draft",
    ];
    let progressIndex = 0;
    const thinkingInterval = window.setInterval(() => {
      setThinkingLog((prev) => [
        ...prev,
        `${progressMessages[progressIndex % progressMessages.length]} (${new Date().toLocaleTimeString()})`,
      ]);
      progressIndex += 1;
    }, 1200);

    try {
      const result = await createApplicationWithAi({
        variables: {
          input: {
            prompt: prompt.trim(),
            tags:
              tags.length > 0
                ? tags.map((tag) => ({
                    label: tag.label,
                    metadata: tag.metadata ?? null,
                  }))
                : null,
          },
        },
      });
      window.clearInterval(thinkingInterval);
      const application = result.data?.createApplicationWithAI;
      setCreatedApplicationId(application?.id ?? null);
      const responsePayload = JSON.stringify(
        {
          status: "created",
          application: application
            ? {
                id: application.id,
                title: application.title,
                company: application.company.name,
                tags: application.tags,
                description: application.description,
              }
            : null,
        },
        null,
        2,
      );
      await streamResponseText(responsePayload);
      setThinkingLog((prev) => [
        ...prev,
        "No explicit thinking field was returned by API.",
        "Application created successfully.",
      ]);
      setRequestStatus("success");
      showToast("Application created from prompt.", "success");
    } catch (caughtError) {
      window.clearInterval(thinkingInterval);
      setRequestStatus("error");
      setThinkingLog((prev) => [
        ...prev,
        "Failed to parse or persist response.",
      ]);
      const errorPayloadObject = toSerializableErrorPayload(caughtError);
      const errorPayload = JSON.stringify(errorPayloadObject, null, 2);
      if (
        typeof errorPayloadObject.aiOutputRaw === "string" &&
        errorPayloadObject.aiOutputRaw.trim().length > 0
      ) {
        await streamResponseText(errorPayloadObject.aiOutputRaw);
      } else {
        await streamResponseText(errorPayload);
      }
      showToast("Something went wrong. Please try again.", "error");
    }
  }

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
            Generate with AI
          </Button>
        </div>
      </div>

      <div className={cn("flex-1 overflow-auto p-4 sm:p-6")}>
        <div className={cn("grid grid-cols-1 gap-4 lg:grid-cols-2")}>
          <form id="ai-application-form" onSubmit={handleSubmit}>
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
                Tags
              </span>
              <TagsInput
                id="prompt-tags"
                value={tags}
                onChange={setTags}
                disabled={loading}
              />
            </div>
          </form>

          <div className="space-y-3">
            <Card variant="outlined" padding="sm">
              <Text size="sm" weight="medium">
                Thinking
              </Text>
              <div className="mt-2 max-h-44 overflow-y-auto rounded-md bg-bg-surface-hover p-2">
                {thinkingLog.length > 0 ? (
                  <ul className="space-y-1 text-xs text-text-secondary">
                    {thinkingLog.map((entry, index) => (
                      <li key={`${entry}-${index}`}>{entry}</li>
                    ))}
                  </ul>
                ) : (
                  <Text size="xs" color="muted">
                    Submit a prompt to start streaming progress...
                  </Text>
                )}
              </div>
            </Card>

            <Card variant="outlined" padding="sm">
              <Text size="sm" weight="medium">
                Response stream
              </Text>
              <pre
                className={cn(
                  "mt-2 max-h-52 overflow-auto rounded-md bg-bg-surface-hover p-3 text-xs text-text-primary whitespace-pre-wrap wrap-break-word",
                )}
              >
                {responseStream || "No response streamed yet."}
              </pre>
            </Card>

            {requestStatus === "error" ? (
              <Text size="sm" color="error">
                Request failed. Update the prompt and try again.
              </Text>
            ) : null}
            {requestStatus === "success" ? (
              <Button
                intent="primary"
                size="sm"
                onClick={() => {
                  if (createdApplicationId) {
                    router.push(`/applications/${createdApplicationId}`);
                    return;
                  }
                  router.push("/applications");
                }}
              >
                Open created application
              </Button>
            ) : null}
          </div>
        </div>
      </div>

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
