"use client";

import { Button, cn, Dialog, FormField, Input } from "@job-tracker/ui";
import { useState } from "react";

import { FieldTooltip } from "@/modules/sources/page/plan-editor/FieldTooltip";
import type {
  ParseRegexInput,
  Step,
} from "@/modules/sources/page/plan-editor/types";
import { defaultParseRegex } from "@/modules/sources/page/plan-editor/utils";

type ParseRegexStepDialogProps = {
  step: Step;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (step: Step) => void;
};

export function ParseRegexStepDialog({
  step,
  open,
  onOpenChange,
  onSave,
}: ParseRegexStepDialogProps) {
  const [stepId, setStepId] = useState(step.id);
  const [draft, setDraft] = useState<ParseRegexInput>(
    step.action.kind === "parse.regex"
      ? structuredClone(step.action.input)
      : defaultParseRegex(),
  );
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title={`Step: ${step.id}`}
      description="Apply regex patterns to extract structured values from a collected field."
      childrenClassName="flex flex-col"
    >
      <div className={cn("flex-1 overflow-auto pe-3")}>
        <div className={cn("flex flex-col gap-4")}>
          <FormField
            label="Step name"
            tooltip={
              <FieldTooltip content="Unique identifier for this step within the plan." />
            }
            htmlFor="re-stepId"
          >
            <Input
              id="re-stepId"
              value={stepId}
              onChange={(e) => setStepId(e.target.value)}
              placeholder="Step identifier"
            />
          </FormField>
          <FormField
            label="Text Source"
            tooltip={<FieldTooltip content="Which collected field to parse." />}
            htmlFor="re-text"
            required
          >
            <Input
              id="re-text"
              value={draft.text}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, text: e.target.value }))
              }
              placeholder="e.g. description"
            />
          </FormField>
        </div>
      </div>
      <Dialog.BottomActions className={cn("justify-end")}>
        <Button intent="secondary" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          intent="primary"
          onClick={() => {
            onSave({
              ...step,
              id: stepId,
              action: { kind: "parse.regex", input: draft },
            });
            onOpenChange(false);
          }}
        >
          Save
        </Button>
      </Dialog.BottomActions>
    </Dialog>
  );
}
