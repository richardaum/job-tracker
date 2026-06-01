"use client";

import { tryRun } from "@job-tracker/try-run";
import {
  Button,
  cn,
  Dialog,
  FormField,
  Input,
  Select,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Textarea,
} from "@job-tracker/ui";
import { UploadSimpleIcon } from "@phosphor-icons/react";
import { useCallback, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { useCreatePlanMutation } from "@/gql/hooks";

type JsonInputMode = "type" | "upload";

function tryParseJson(raw: string): { ok: true; value: Record<string, unknown> } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(raw) as Record<string, unknown> };
  } catch (e: unknown) {
    if (e instanceof SyntaxError) {
      return { ok: false };
    }
    throw e;
  } finally {
    /* json parse boundary */
  }
}

type ImportPlanDialogProps = { open: boolean; onOpenChange: (open: boolean) => void };

export function ImportPlanDialog({ open, onOpenChange }: ImportPlanDialogProps) {
  const [displayName, setDisplayName] = useState("");
  const [jsonMode, setJsonMode] = useState<JsonInputMode>("type");
  const [documentJson, setDocumentJson] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [boardType, setBoardType] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createPlan] = useCreatePlanMutation();

  const resetState = useCallback(() => {
    setDisplayName("");
    setBoardType("");
    setJsonMode("type");
    setDocumentJson("");
    setFileName(null);
    setSubmitError(null);
    setParseError(null);
  }, []);

  const notifyOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) resetState();
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetState],
  );

  const close = useCallback(() => notifyOpenChange(false), [notifyOpenChange]);

  function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setDocumentJson(reader.result as string);
      setParseError(null);
    };
    reader.readAsText(file);
  }

  function handleModeSwitch(mode: JsonInputMode) {
    setJsonMode(mode);
    if (mode === "type") {
      setFileName(null);
    } else {
      setDocumentJson("");
    }
    setParseError(null);
  }

  async function handleImport() {
    const trimmedDisplayName = displayName.trim();
    const trimmedDocument = documentJson.trim();

    if (!trimmedDisplayName || !trimmedDocument) {
      setSubmitError("Name and plan document are required.");
      return;
    }

    if (!boardType) {
      setSubmitError("Board type is required.");
      return;
    }

    const parsed = tryParseJson(trimmedDocument);
    if (!parsed.ok) {
      setParseError("Invalid JSON. Please check the document syntax.");
      return;
    }
    const document = { ...parsed.value, boardType };
    setParseError(null);

    setSaving(true);
    setSubmitError(null);

    const [err] = await tryRun(
      createPlan({ variables: { input: { displayName: trimmedDisplayName, document } }, refetchQueries: ["Plans"] }),
    );

    setSaving(false);

    if (err) {
      setSubmitError("Could not import plan. Try again.");
      return;
    }

    close();
  }

  const hasJson = documentJson.trim().length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={notifyOpenChange}
      size="lg"
      title="Import plan"
      description={
        <Text size="sm" color="secondary">
          Name your plan and provide its JSON document to import it.
        </Text>
      }
    >
      <Stack gap="sm">
        <FormField label="Name">
          <Input
            placeholder="e.g. RemoteYeah"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={saving}
          />
        </FormField>

        <FormField label="Board Type" required>
          <Select
            placeholder="Select board type"
            options={[
              { label: "Sequential", value: "Sequential" },
              { label: "NonSequential", value: "NonSequential" },
            ]}
            value={boardType || undefined}
            onValueChange={(v) => {
              setBoardType(v);
              setSubmitError(null);
            }}
            disabled={saving}
            required
          />
        </FormField>

        <FormField label="Plan document">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.txt"
            className={cn("hidden")}
            onChange={handleFileSelected}
          />

          <Tabs value={jsonMode} onValueChange={(v) => handleModeSwitch(v as JsonInputMode)}>
            <TabsList>
              <TabsTrigger value="type">Type manually</TabsTrigger>
              <TabsTrigger value="upload">
                <UploadSimpleIcon size={14} weight="bold" className={cn("mr-1.5")} />
                Upload file
              </TabsTrigger>
            </TabsList>

            <TabsContent value="type">
              <Textarea
                placeholder="Paste your plan document JSON here…"
                value={documentJson}
                onChange={(e) => {
                  setDocumentJson(e.target.value);
                  setParseError(null);
                }}
                disabled={saving}
                rows={12}
                state={parseError ? "error" : "default"}
                className={cn("font-mono text-xs")}
              />
            </TabsContent>

            <TabsContent value="upload">
              <div
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 transition-colors",
                  fileName
                    ? "border-border-brand bg-bg-info-subtle"
                    : "border-border-default hover:border-border-brand hover:bg-bg-subtle",
                )}
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                }}
              >
                <UploadSimpleIcon size={24} weight="regular" className={cn("text-text-muted")} />
                {fileName ? (
                  <Text size="sm">{fileName}</Text>
                ) : (
                  <Text size="sm" color="secondary">
                    Click to select a JSON file or drop it here
                  </Text>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {parseError ? (
            <Text size="xs" color="error">
              {parseError}
            </Text>
          ) : null}
        </FormField>

        {submitError ? (
          <Text size="sm" color="error">
            {submitError}
          </Text>
        ) : null}

        <div className={cn("flex justify-end gap-2")}>
          <Button intent="secondary" disabled={saving} onClick={close}>
            Cancel
          </Button>
          <Button
            intent="primary"
            state={saving ? "loading" : "default"}
            disabled={!displayName.trim() || !boardType || !hasJson}
            onClick={() => void handleImport()}
          >
            Import plan
          </Button>
        </div>
      </Stack>
    </Dialog>
  );
}
