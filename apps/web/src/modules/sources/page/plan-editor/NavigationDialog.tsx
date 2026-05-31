"use client";

import { Button, cn, Dialog, FormField, Input, Select } from "@job-tracker/ui";
import { useState } from "react";

import { FieldTooltip } from "@/modules/sources/page/plan-editor/FieldTooltip";
import type { CollectJobsInput, Step } from "@/modules/sources/page/plan-editor/types";

type NavigationDialogProps = {
  step: Step;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (step: Step) => void;
};

export function NavigationDialog({ step, open, onOpenChange, onSave }: NavigationDialogProps) {
  const initial =
    step.action.kind === "collect.jobs"
      ? { direction: step.action.input.direction, parallelDetailsTabs: step.action.input.parallelDetailsTabs }
      : { direction: "down" as const, parallelDetailsTabs: 1 };

  const [direction, setDirection] = useState(initial.direction);
  const [parallelTabs, setParallelTabs] = useState(initial.parallelDetailsTabs);

  function mergeIntoStep() {
    const action = step.action as { kind: "collect.jobs"; input: CollectJobsInput };
    return {
      ...step,
      action: {
        kind: "collect.jobs" as const,
        input: { ...action.input, direction, parallelDetailsTabs: parallelTabs },
      },
    };
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title="Navigation"
      description="Configure scroll direction and parallelism."
      childrenClassName="flex flex-col"
    >
      <div className={cn("flex-1 overflow-auto pe-3")}>
        <div className={cn("flex flex-col gap-4")}>
          <FormField
            label="Direction"
            tooltip={
              <FieldTooltip content="Scroll direction: down (top-to-bottom) or up (bottom-to-top, for chat feeds)." />
            }
            htmlFor="nav-dir"
          >
            <Select
              options={[
                { label: "Down", value: "down" },
                { label: "Up", value: "up" },
              ]}
              value={direction}
              onValueChange={(v) => setDirection(v as "up" | "down")}
            />
          </FormField>
          <FormField
            label="Parallel Tabs"
            tooltip={<FieldTooltip content="Max detail pages to open concurrently." />}
            htmlFor="nav-tabs"
          >
            <Input
              id="nav-tabs"
              type="number"
              min={1}
              max={10}
              value={String(parallelTabs)}
              onChange={(e) => setParallelTabs(Number(e.target.value))}
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
