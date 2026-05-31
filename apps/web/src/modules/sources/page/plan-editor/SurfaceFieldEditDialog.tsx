"use client";

import { Button, cn, Dialog, FormField, Input, Select, Textarea } from "@job-tracker/ui";
import { useState } from "react";

import { FieldTooltip } from "@/modules/sources/page/plan-editor/FieldTooltip";
import type { SurfaceField } from "@/modules/sources/page/plan-editor/types";

export function SurfaceFieldEditDialog({
  field,
  availableKeys,
  open,
  onOpenChange,
  onSave,
}: {
  field: SurfaceField | null;
  open: boolean;
  availableKeys?: string[];
  onOpenChange: (open: boolean) => void;
  onSave: (field: SurfaceField) => void;
}) {
  const [draft, setDraft] = useState<SurfaceField>(
    field ?? {
      key: "",
      selector: "",
      type: "property",
      value: "innerText",
      sourceField: availableKeys?.[0] ?? undefined,
    },
  );

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title={field ? "Edit Surface Field" : "Add Surface Field"}
      description={
        field
          ? `Editing "${field.key}".`
          : "Define a new surface field to extract from the listing row."
      }
      childrenClassName="flex flex-col"
    >
      <div className={cn("flex-1 overflow-auto pe-3")}>
        <div className={cn("flex flex-col gap-4")}>
          <FormField
            label="Key"
            tooltip={
              <FieldTooltip content="Identifier used to reference this field elsewhere in the plan." />
            }
            htmlFor="sf-key"
            required
          >
            <Input
              id="sf-key"
              value={draft.key}
              onChange={(e) => setDraft((prev) => ({ ...prev, key: e.target.value }))}
              placeholder="Field identifier"
            />
          </FormField>
          <FormField
            label="Type"
            tooltip={
              <FieldTooltip content="How to read the value: attribute (HTML attr), property (DOM text), or regex (pattern match)." />
            }
            htmlFor="sf-type"
          >
            <Select
              options={[
                { label: "attribute", value: "attribute" },
                { label: "property", value: "property" },
                { label: "regex", value: "regex" },
              ]}
              value={draft.type}
              onValueChange={(v) =>
                setDraft((prev) => ({
                  ...prev,
                  type: v as SurfaceField["type"],
                  sourceField:
                    v === "regex" && !prev.sourceField
                      ? (availableKeys?.[0] ?? undefined)
                      : prev.sourceField,
                }))
              }
            />
          </FormField>
          {draft.type === "property" ? (
            <FormField
              label="Value"
              tooltip={<FieldTooltip content="Which DOM property to read from the element." />}
              htmlFor="sf-value"
              required
            >
              <Select
                options={[
                  { label: "innerText", value: "innerText" },
                  { label: "textContent", value: "textContent" },
                  { label: "value", value: "value" },
                ]}
                value={draft.value}
                onValueChange={(v) => setDraft((prev) => ({ ...prev, value: v }))}
              />
            </FormField>
          ) : (
            <FormField
              label="Value"
              tooltip={
                <FieldTooltip
                  content={
                    draft.type === "regex"
                      ? "Regex pattern to extract the value."
                      : "HTML attribute name to read from the element."
                  }
                />
              }
              htmlFor="sf-value"
              required
            >
              <Input
                id="sf-value"
                value={draft.value}
                onChange={(e) => setDraft((prev) => ({ ...prev, value: e.target.value }))}
                placeholder={draft.type === "regex" ? "e.g. 🚀 (.+)" : "e.g. href"}
              />
            </FormField>
          )}
          {draft.type !== "regex" ? (
            <FormField
              label="Selector"
              tooltip={
                <FieldTooltip content="CSS selector for the element containing this field's data." />
              }
              htmlFor="sf-selector"
              required
            >
              <Textarea
                id="sf-selector"
                value={draft.selector ?? ""}
                onChange={(e) => setDraft((prev) => ({ ...prev, selector: e.target.value }))}
                placeholder="CSS selector"
                rows={2}
                size="sm"
                className="font-mono text-xs"
              />
            </FormField>
          ) : (
            <FormField
              label="Source Field"
              tooltip={
                <FieldTooltip content="Which field to parse with this regex. Leave empty to use all text." />
              }
              htmlFor="sf-source"
            >
              <Select
                options={availableKeys?.map((k) => ({ label: k, value: k })) ?? []}
                value={draft.sourceField ?? availableKeys?.[0] ?? ""}
                onValueChange={(v) => setDraft((prev) => ({ ...prev, sourceField: v }))}
              />
            </FormField>
          )}
        </div>
      </div>
      <Dialog.BottomActions className={cn("justify-end")}>
        <Button intent="secondary" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          intent="primary"
          onClick={() => {
            onSave(draft);
            onOpenChange(false);
          }}
        >
          Save
        </Button>
      </Dialog.BottomActions>
    </Dialog>
  );
}
