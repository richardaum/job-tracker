"use client";

import { tryRun } from "@job-tracker/try-run";
import {
  Button,
  Checkbox,
  cn,
  Dialog,
  FormField,
  Input,
  Stack,
  Text,
} from "@job-tracker/ui";
import React, { useCallback, useMemo, useState } from "react";

import { useUpdateSourceTemplateMutation } from "@/gql/hooks";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";
import type { SourceListItem } from "@/modules/sources/page/source-template-list.shared";

type StopWhen = "CatchUp" | "FirstRunMaxPages" | "OlderThan";

type StopConfig = {
  stopWhen: StopWhen[];
  catchUpThreshold: string;
  maxPages: string;
  olderThanDays: string;
};

const conditionMeta: {
  value: StopWhen;
  label: string;
  description: string;
  hint: string;
  paramLabel: string;
  paramPlaceholder: string;
}[] = [
  {
    value: "CatchUp",
    label: "CatchUp",
    description:
      "Stop after N consecutive duplicate jobs. Use this when the board is fully scanned and you only want new matches.",
    hint: "Consecutive duplicate count",
    paramLabel: "Consecutive Duplicates",
    paramPlaceholder: "e.g. 5",
  },
  {
    value: "FirstRunMaxPages",
    label: "First Run Max Pages",
    description:
      "Limit only the first run to a maximum number of pages. Use this to scope large boards without slowing down recurring scans.",
    hint: "Only applies to the first run; subsequent runs ignore this limit",
    paramLabel: "Max Pages",
    paramPlaceholder: "e.g. 3",
  },
  {
    value: "OlderThan",
    label: "Older Than",
    description:
      "Stop scanning once jobs older than N days are found. Use this for time-sensitive searches.",
    hint: "Age threshold in days",
    paramLabel: "Max Age (days)",
    paramPlaceholder: "e.g. 30",
  },
];

function parseConfig(
  config: Record<string, unknown> | null | undefined,
): StopConfig {
  const c = config ?? {};
  const raw = c.stopWhen;
  const sw: StopWhen[] = Array.isArray(raw)
    ? raw.filter(
        (v): v is StopWhen =>
          typeof v === "string" &&
          ["CatchUp", "FirstRunMaxPages", "OlderThan"].includes(v),
      )
    : typeof raw === "string" &&
        ["CatchUp", "FirstRunMaxPages", "OlderThan"].includes(raw)
      ? [raw as StopWhen]
      : [];
  return {
    stopWhen: sw,
    catchUpThreshold: String(c.catchUpThreshold ?? ""),
    maxPages: String(c.maxPages ?? ""),
    olderThanDays: String(c.olderThanDays ?? ""),
  };
}

function buildConfig(state: StopConfig): Record<string, unknown> {
  const config: Record<string, unknown> = { stopWhen: state.stopWhen };
  if (state.stopWhen.includes("CatchUp") && state.catchUpThreshold) {
    config.catchUpThreshold = Number(state.catchUpThreshold);
  }
  if (state.stopWhen.includes("FirstRunMaxPages") && state.maxPages) {
    config.maxPages = Number(state.maxPages);
  }
  if (state.stopWhen.includes("OlderThan") && state.olderThanDays) {
    config.olderThanDays = Number(state.olderThanDays);
  }
  return config;
}

type SourceStopConfigFormInnerProps = {
  template: SourceListItem;
  close: () => void;
  onStopConfigSaved?: (
    id: string,
    config: Record<string, unknown> | null,
  ) => void;
};

function SourceStopConfigFormInner({
  template,
  close,
  onStopConfigSaved,
}: SourceStopConfigFormInnerProps) {
  const [updateSource] = useUpdateSourceTemplateMutation({
    refetchQueries: ["Plans", "SourceTemplatesAll"],
  });

  const { enqueueToast } = useToastQueue();

  const initial = useMemo(
    () => parseConfig(template.config),
    [template.config],
  );
  const [stopWhen, setStopWhen] = useState<StopWhen[]>(initial.stopWhen);
  const [catchUpThreshold, setCatchUpThreshold] = useState(
    initial.catchUpThreshold,
  );
  const [maxPages, setMaxPages] = useState(initial.maxPages);
  const [olderThanDays, setOlderThanDays] = useState(initial.olderThanDays);
  const [saving, setSaving] = useState(false);

  function toggleCondition(value: StopWhen) {
    setStopWhen((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function paramValue(value: StopWhen): string {
    switch (value) {
      case "CatchUp":
        return catchUpThreshold;
      case "FirstRunMaxPages":
        return maxPages;
      case "OlderThan":
        return olderThanDays;
    }
  }

  function setParamValue(value: StopWhen, v: string) {
    switch (value) {
      case "CatchUp":
        setCatchUpThreshold(v);
        break;
      case "FirstRunMaxPages":
        setMaxPages(v);
        break;
      case "OlderThan":
        setOlderThanDays(v);
        break;
    }
  }

  function showValidationError(msg: string) {
    enqueueToast({ title: msg, intent: "error" });
  }

  async function handleSave() {
    if (stopWhen.includes("CatchUp") && !catchUpThreshold) {
      showValidationError("Consecutive duplicates is required for CatchUp");
      return;
    }
    if (stopWhen.includes("FirstRunMaxPages") && !maxPages) {
      showValidationError("Max pages is required for Max Pages");
      return;
    }
    if (stopWhen.includes("OlderThan") && !olderThanDays) {
      showValidationError("Max age is required for Older Than");
      return;
    }

    setSaving(true);

    const config = buildConfig({
      stopWhen,
      catchUpThreshold,
      maxPages,
      olderThanDays,
    });

    const [err] = await tryRun(
      updateSource({ variables: { id: template.id, input: { config } } }),
    );

    setSaving(false);

    if (err) {
      enqueueToast({ title: err instanceof Error ? err.message : "Could not save stop condition. Try again.", intent: "error" });
      return;
    }

    onStopConfigSaved?.(template.id, config);
    close();
  }

  return (
    <Stack gap="md">
      <Stack gap="md">
        {conditionMeta.map((condition) => {
          const checked = stopWhen.includes(condition.value);
          return (
            <div
              key={condition.value}
              className={cn("flex flex-col gap-2 pb-2")}
            >
              <label
                htmlFor={`stop-${condition.value}-${template.id}`}
                className={cn("flex cursor-pointer items-start gap-3")}
              >
                <span className={cn("flex shrink-0")}>
                  <Checkbox
                    id={`stop-${condition.value}-${template.id}`}
                    checked={checked}
                    onCheckedChange={() => toggleCondition(condition.value)}
                    disabled={saving}
                    size="sm"
                  />
                </span>
                <div className={cn("flex flex-col gap-2")}>
                  <Text size="sm" weight="medium" className={cn("leading-4")}>
                    {condition.label}
                  </Text>
                  <Text size="xs" color="secondary">
                    {condition.description}
                  </Text>
                </div>
              </label>

              {checked && (
                <div className={cn("ml-7")}>
                  <FormField
                    label={condition.paramLabel}
                    hint={condition.hint}
                    htmlFor={`stop-param-${condition.value}-${template.id}`}
                  >
                    <Input
                      id={`stop-param-${condition.value}-${template.id}`}
                      type="number"
                      min={1}
                      value={paramValue(condition.value)}
                      onChange={(e) =>
                        setParamValue(condition.value, e.target.value)
                      }
                      disabled={saving}
                      placeholder={condition.paramPlaceholder}
                    />
                  </FormField>
                </div>
              )}
            </div>
          );
        })}
      </Stack>

      <div className={cn("flex justify-end gap-2")}>
        <Button intent="secondary" disabled={saving} onClick={close}>
          Cancel
        </Button>
        <Button
          intent="primary"
          state={saving ? "loading" : "default"}
          onClick={() => void handleSave()}
        >
          Save
        </Button>
      </div>
    </Stack>
  );
}

type SourceStopConfigDialogProps = {
  template: SourceListItem | null;
  onOpenChange: (open: boolean) => void;
  onStopConfigSaved?: (
    id: string,
    config: Record<string, unknown> | null,
  ) => void;
};

export function SourceStopConfigDialog({
  template,
  onOpenChange,
  onStopConfigSaved,
}: SourceStopConfigDialogProps) {
  const open = template !== null;
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title="Stop Conditions"
      description={
        <Text size="sm" color="secondary">
          Configure when to stop scanning jobs. You can enable multiple
          conditions — the first one met stops the run.
        </Text>
      }
    >
      {open && template ? (
        <SourceStopConfigFormInner
          key={template.id}
          template={template}
          close={close}
          onStopConfigSaved={onStopConfigSaved}
        />
      ) : null}
    </Dialog>
  );
}
