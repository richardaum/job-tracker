"use client";

import { Button, cn, Dialog, FormField, Select, Text } from "@job-tracker/ui";
import { useState } from "react";

import { FieldTooltip } from "@/modules/sources/page/plan-editor/FieldTooltip";

export function AddStepDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (kind: "collect.jobs" | "parse.regex") => void;
}) {
  const [kind, setKind] = useState<"collect.jobs" | "parse.regex">("collect.jobs");

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title="Add Step"
      description="Choose the type of step to add."
    >
      <div className={cn("flex flex-col gap-4")}>
        <FormField
          label="Step Type"
          tooltip={
            <FieldTooltip content="Collect jobs: extract listings from a page using CSS selectors. Parse regex: extract structured data from a text field using regex patterns." />
          }
          htmlFor="add-kind"
        >
          <Select
            options={[
              { label: "Collect Jobs", value: "collect.jobs" },
              { label: "Parse Regex", value: "parse.regex" },
            ]}
            value={kind}
            onValueChange={(v) => setKind(v as "collect.jobs" | "parse.regex")}
          />
        </FormField>
        <Text size="xs" color="muted">
          {kind === "collect.jobs"
            ? "Extract job listings from a page using CSS selectors."
            : "Extract data from a text field using regex patterns."}
        </Text>
        <div className={cn("flex justify-end gap-2")}>
          <Button intent="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={() => {
              onAdd(kind);
              onOpenChange(false);
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
