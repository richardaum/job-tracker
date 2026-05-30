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
  Text,
} from "@job-tracker/ui";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { usePlanQuery, useUpdatePlanMutation } from "@/gql/hooks";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";
import type { SourceListItem } from "@/modules/sources/page/source-template-list.shared";

type SurfaceFieldType = "attribute" | "property" | "regex";

const typeOptions = [
  { label: "Attribute", value: "attribute" },
  { label: "Property", value: "property" },
  { label: "Regex", value: "regex" },
];

type PublishedAtForm = {
  selector: string;
  fieldType: SurfaceFieldType;
  value: string;
  sourceField: string;
};

function parsePublishedAt(
  document: Record<string, unknown>,
): PublishedAtForm {
  const steps = (document.steps ?? []) as Array<Record<string, unknown>>;
  for (const step of steps) {
    const action = step.action as Record<string, unknown> | undefined;
    if (action?.kind !== "collect.jobs") continue;
    const input = action.input as Record<string, unknown> | undefined;
    const surfaceFields = (input?.surfaceFields ??
      []) as Array<Record<string, unknown>>;
    const field = surfaceFields.find((sf) => sf.key === "publishedAt");
    if (field) {
      return {
        selector: (field.selector as string) ?? "",
        fieldType: (field.type as SurfaceFieldType) ?? "attribute",
        value: (field.value as string) ?? "",
        sourceField: (field.sourceField as string) ?? "",
      };
    }
  }
  return { selector: "", fieldType: "attribute", value: "", sourceField: "" };
}

function setPublishedAt(
  document: Record<string, unknown>,
  form: PublishedAtForm,
): Record<string, unknown> {
  const doc = JSON.parse(JSON.stringify(document)) as Record<string, unknown>;
  const steps = (doc.steps ?? []) as Array<Record<string, unknown>>;

  let targetStep = steps.find((step) => {
    const action = step.action as Record<string, unknown> | undefined;
    return action?.kind === "collect.jobs";
  }) as Record<string, unknown> | undefined;

  if (!targetStep) {
    steps.push({
      id: "step-collect-jobs",
      action: { kind: "collect.jobs", input: {} },
    });
    targetStep = steps[steps.length - 1] as Record<string, unknown>;
  }

  const action = targetStep.action as Record<string, unknown>;
  const input = (action.input ?? {}) as Record<string, unknown>;
  const surfaceFields = (input.surfaceFields ??
    []) as Array<Record<string, unknown>>;

  const field: Record<string, unknown> = {
    key: "publishedAt",
    type: form.fieldType,
    value: form.value,
  };

  if (form.fieldType !== "regex") {
    field.selector = form.selector;
    delete field.sourceField;
    delete field.flags;
    delete field.group;
  } else {
    delete field.selector;
    if (form.sourceField) {
      field.sourceField = form.sourceField;
    }
  }

  const idx = surfaceFields.findIndex((sf) => sf.key === "publishedAt");
  if (idx >= 0) {
    surfaceFields[idx] = field;
  } else {
    surfaceFields.push(field);
  }

  action.input = { ...input, surfaceFields };
  return doc;
}

function removePublishedAt(
  document: Record<string, unknown>,
): Record<string, unknown> {
  const doc = JSON.parse(JSON.stringify(document)) as Record<string, unknown>;
  const steps = (doc.steps ?? []) as Array<Record<string, unknown>>;

  for (const step of steps) {
    const action = step.action as Record<string, unknown> | undefined;
    if (action?.kind !== "collect.jobs") continue;
    const input = action.input as Record<string, unknown> | undefined;
    const surfaceFields = (input?.surfaceFields ??
      []) as Array<Record<string, unknown>>;
    const filtered = surfaceFields.filter((sf) => sf.key !== "publishedAt");
    if (input) {
      (action as Record<string, unknown>).input = {
        ...input,
        surfaceFields: filtered,
      };
    }
  }

  return doc;
}

type SourcePublishedAtDialogProps = {
  template: SourceListItem | null;
  onOpenChange: (open: boolean) => void;
};

export function SourcePublishedAtDialog({
  template,
  onOpenChange,
}: SourcePublishedAtDialogProps) {
  const open = template !== null;
  const planId = template?.planId ?? "";
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const { data: planData } = usePlanQuery({
    variables: { id: planId },
    skip: !open,
  });

  const [updatePlan] = useUpdatePlanMutation({
    refetchQueries: ["Plans", "SourceTemplatesAll"],
  });

  const { enqueueToast } = useToastQueue();

  const planDocument = (planData?.plan?.document ?? {}) as Record<string, unknown>;

  const initial = useMemo(
    () => (open ? parsePublishedAt(planDocument) : null),
    [open, planDocument],
  );

  const [selector, setSelector] = useState("");
  const [fieldType, setFieldType] = useState<SurfaceFieldType>("attribute");
  const [value, setValue] = useState("");
  const [sourceField, setSourceField] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && initial) {
      setSelector(initial.selector);
      setFieldType(initial.fieldType);
      setValue(initial.value);
      setSourceField(initial.sourceField);
    }
  }, [open, initial]);

  async function handleSave() {
    if (!planId) return;

    if (!value) {
      enqueueToast({
        title: "Value is required for publishedAt field",
        intent: "error",
      });
      return;
    }

    if (fieldType !== "regex" && !selector) {
      enqueueToast({
        title: "Selector is required for attribute/property type",
        intent: "error",
      });
      return;
    }

    setSaving(true);

    const form: PublishedAtForm = { selector, fieldType, value, sourceField };
    const document = setPublishedAt(planDocument, form);

    const [err] = await tryRun(
      updatePlan({ variables: { id: planId, input: { document } } }),
    );

    setSaving(false);

    if (err) {
      enqueueToast({
        title:
          err instanceof Error ? err.message : "Could not save. Try again.",
        intent: "error",
      });
      return;
    }

    close();
  }

  const configured = !!(initial?.value);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title="Published At"
      description={
        <Text size="sm" color="secondary">
          Configure how the extension reads the publication timestamp from the
          page. Required for the Older Than stop condition.
        </Text>
      }
    >
      {open ? (
        <Stack gap="sm">
          <FormField label="Type" required>
            <Select
              options={typeOptions}
              value={fieldType}
              onValueChange={(v) => setFieldType(v as SurfaceFieldType)}
              disabled={saving}
            />
          </FormField>

          {fieldType !== "regex" && (
            <FormField
              label="CSS Selector"
              hint="Element containing the timestamp"
              required
            >
              <Input
                placeholder='e.g. ".bubble.channel-post"'
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
                disabled={saving}
              />
            </FormField>
          )}

          <FormField
            label={fieldType === "regex" ? "Regex Pattern" : "Attribute / Property"}
            hint={
              fieldType === "attribute"
                ? 'e.g. "data-timestamp"'
                : fieldType === "property"
                  ? 'e.g. "innerText"'
                  : 'e.g. "\\\\d{4}-\\\\d{2}-\\\\d{2}"'
            }
            required
          >
            <Input
              placeholder={
                fieldType === "attribute"
                  ? "data-timestamp"
                  : fieldType === "property"
                    ? "innerText"
                    : "\\d{4}-\\d{2}-\\d{2}"
              }
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={saving}
            />
          </FormField>

          {fieldType === "regex" && (
            <FormField
              label="Source Field"
              hint="Which collected field to parse (optional)"
            >
              <Input
                placeholder="e.g. rawText"
                value={sourceField}
                onChange={(e) => setSourceField(e.target.value)}
                disabled={saving}
              />
            </FormField>
          )}

          <div className={cn("flex items-center justify-between")}>
            {configured ? (
              <Button
                intent="secondary"
                size="sm"
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  const document = removePublishedAt(planDocument);
                  const [err] = await tryRun(
                    updatePlan({
                      variables: { id: planId, input: { document } },
                    }),
                  );
                  setSaving(false);
                  if (err) {
                    enqueueToast({
                      title:
                        err instanceof Error
                          ? err.message
                          : "Could not remove. Try again.",
                      intent: "error",
                    });
                    return;
                  }
                  close();
                }}
              >
                Remove
              </Button>
            ) : (
              <div />
            )}

            <div className={cn("flex gap-2")}>
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
          </div>
        </Stack>
      ) : null}
    </Dialog>
  );
}
