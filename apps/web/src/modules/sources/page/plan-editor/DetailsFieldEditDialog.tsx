"use client";

import {
  Button,
  cn,
  Dialog,
  FormField,
  Input,
  Select,
  Textarea,
} from "@job-tracker/ui";
import { TrashIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { FieldTooltip } from "@/modules/sources/page/plan-editor/FieldTooltip";
import type { DetailsField } from "@/modules/sources/page/plan-editor/types";

type DetailsFieldEditDialogProps = {
  field: DetailsField | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (field: DetailsField) => void;
  onDelete?: (field: DetailsField) => void;
};

export function DetailsFieldEditDialog({
  field,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: DetailsFieldEditDialogProps) {
  const [draft, setDraft] = useState<DetailsField>(
    field ?? { key: "", selector: "", type: "property", value: "innerHTML" },
  );

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title={field ? "Edit Details Field" : "Add Details Field"}
      description={
        field
          ? `Editing "${field.key}".`
          : "Define a new details field to extract from the detail page."
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
            htmlFor="df-key"
            required
          >
            <Input
              id="df-key"
              value={draft.key}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, key: e.target.value }))
              }
              placeholder="Field identifier"
            />
          </FormField>
          <FormField
            label="Type"
            tooltip={
              <FieldTooltip content="How to read the value: attribute (HTML attr) or property (DOM text/HTML)." />
            }
            htmlFor="df-type"
          >
            <Select
              options={[
                { label: "attribute", value: "attribute" },
                { label: "property", value: "property" },
              ]}
              value={draft.type}
              onValueChange={(v) =>
                setDraft((prev) => ({
                  ...prev,
                  type: v as DetailsField["type"],
                }))
              }
            />
          </FormField>
          {draft.type === "property" ? (
            <FormField
              label="Value"
              tooltip={
                <FieldTooltip content="Which DOM property to read from the element." />
              }
              htmlFor="df-value"
              required
            >
              <Select
                options={[
                  { label: "innerText", value: "innerText" },
                  { label: "textContent", value: "textContent" },
                  { label: "value", value: "value" },
                  { label: "innerHTML", value: "innerHTML" },
                ]}
                value={draft.value}
                onValueChange={(v) =>
                  setDraft((prev) => ({ ...prev, value: v }))
                }
              />
            </FormField>
          ) : (
            <FormField
              label="Value"
              tooltip={
                <FieldTooltip content="HTML attribute name to read from the element." />
              }
              htmlFor="df-value"
              required
            >
              <Input
                id="df-value"
                value={draft.value}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, value: e.target.value }))
                }
                placeholder="e.g. href"
              />
            </FormField>
          )}
          <FormField
            label="Selector"
            tooltip={
              <FieldTooltip content="CSS selector for the element containing this field's data on the detail page." />
            }
            htmlFor="df-selector"
            required
          >
            <Textarea
              id="df-selector"
              value={draft.selector}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, selector: e.target.value }))
              }
              placeholder="CSS selector"
              rows={2}
              size="sm"
              className={cn("font-mono text-xs")}
            />
          </FormField>
          {draft.type === "property" ? (
            <FormField
              label="Format"
              tooltip={
                <FieldTooltip content="Post-processing: tiptap converts HTML to editor content, salary normalizes pay ranges." />
              }
              htmlFor="df-format"
            >
              <Select
                placeholder="None"
                options={[
                  { label: "tiptap", value: "tiptap" },
                  { label: "salary", value: "salary" },
                ]}
                value={draft.format || undefined}
                onValueChange={(v) =>
                  setDraft((prev) => ({
                    ...prev,
                    format: v as "tiptap" | "salary",
                  }))
                }
              />
            </FormField>
          ) : null}
        </div>
      </div>
      <Dialog.BottomActions className={cn("justify-between")}>
        {field && onDelete ? (
          <Button
            intent="ghost"
            size="md"
            leftIcon={<TrashIcon size={14} />}
            className={cn("hover:!text-text-error")}
            onClick={() => {
              onDelete(field);
              onOpenChange(false);
            }}
          >
            Delete
          </Button>
        ) : (
          <div />
        )}
        <div className={cn("flex items-center gap-2")}>
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
        </div>
      </Dialog.BottomActions>
    </Dialog>
  );
}
