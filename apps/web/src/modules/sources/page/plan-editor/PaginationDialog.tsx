"use client";

import {
  Button,
  Checkbox,
  cn,
  Dialog,
  FormField,
  Input,
  Text,
  Textarea,
} from "@job-tracker/ui";
import { useState } from "react";

import { FieldTooltip } from "@/modules/sources/page/plan-editor/FieldTooltip";
import type {
  CollectJobsInput,
  Pagination,
  Step,
} from "@/modules/sources/page/plan-editor/types";

type PaginationDialogProps = {
  step: Step;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (step: Step) => void;
};

export function PaginationDialog({
  step,
  open,
  onOpenChange,
  onSave,
}: PaginationDialogProps) {
  const existing =
    step.action.kind === "collect.jobs"
      ? step.action.input.pagination
      : undefined;
  const [enabled, setEnabled] = useState(existing !== undefined);
  const [draft, setDraft] = useState<Pagination>(
    existing ?? { containerSelector: "", nextButtonPartialMatch: "Next" },
  );

  function mergeIntoStep() {
    const action = step.action as {
      kind: "collect.jobs";
      input: CollectJobsInput;
    };
    return {
      ...step,
      action: {
        kind: "collect.jobs" as const,
        input: { ...action.input, pagination: enabled ? draft : undefined },
      },
    };
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title="Pagination"
      description="Configure multi-page board navigation."
      childrenClassName="flex flex-col"
    >
      <div className={cn("flex-1 overflow-auto pe-3")}>
        <div className={cn("flex flex-col gap-4")}>
          <div className={cn("flex items-center gap-2")}>
            <Checkbox
              checked={enabled}
              onCheckedChange={(c) => setEnabled(c)}
            />
            <Text size="sm">Enable pagination</Text>
            <FieldTooltip content="Enable if the board spans multiple pages with a 'Next' button." />
          </div>
          {enabled && (
            <>
              <FormField
                label="Pagination Container"
                tooltip={
                  <FieldTooltip content="CSS selector for the pagination navigation element." />
                }
                htmlFor="pag-container"
              >
                <Textarea
                  id="pag-container"
                  value={draft.containerSelector}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      containerSelector: e.target.value,
                    }))
                  }
                  placeholder="e.g. .pagination"
                  rows={2}
                  size="sm"
                  className={cn("font-mono text-xs")}
                />
              </FormField>
              <FormField
                label="Next Button Text"
                tooltip={
                  <FieldTooltip content="Partial text match for the next-page button, e.g. 'Next'." />
                }
                hint="Partial text match"
                htmlFor="pag-next"
              >
                <Input
                  id="pag-next"
                  value={draft.nextButtonPartialMatch}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      nextButtonPartialMatch: e.target.value,
                    }))
                  }
                  placeholder="e.g. Next"
                />
              </FormField>
            </>
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
            onSave(mergeIntoStep());
            onOpenChange(false);
          }}
        >
          Save
        </Button>
      </Dialog.BottomActions>
    </Dialog>
  );
}
