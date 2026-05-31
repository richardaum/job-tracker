"use client";

import { Button, Checkbox, cn, Dialog, FormField, Input, Select, Text, Textarea } from "@job-tracker/ui";
import { useState } from "react";

import { FieldTooltip } from "@/modules/sources/page/plan-editor/FieldTooltip";
import type { CollectJobsInput, ReadyCheck, Step } from "@/modules/sources/page/plan-editor/types";

type ReadyCheckDialogProps = {
  step: Step;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (step: Step) => void;
};

export function ReadyCheckDialog({ step, open, onOpenChange, onSave }: ReadyCheckDialogProps) {
  const existing = step.action.kind === "collect.jobs" ? step.action.input.readyCheck : undefined;
  const [enabled, setEnabled] = useState(existing !== undefined);
  const [draft, setDraft] = useState<ReadyCheck>(
    existing ?? {
      selector: "",
      mode: "text",
      value: "updating",
      resolveTimeoutMs: 10_000,
      watchTimeoutMs: 3_000,
      pollIntervalMs: 200,
    },
  );

  function mergeIntoStep() {
    const action = step.action as { kind: "collect.jobs"; input: CollectJobsInput };
    return {
      ...step,
      action: { kind: "collect.jobs" as const, input: { ...action.input, readyCheck: enabled ? draft : undefined } },
    };
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title="Ready Check"
      description="Wait for a page element to stabilize before collecting jobs."
      childrenClassName="flex flex-col"
    >
      <div className={cn("flex-1 overflow-auto pe-3")}>
        <div className={cn("flex flex-col gap-4")}>
          <div className={cn("flex items-center gap-2")}>
            <Checkbox checked={enabled} onCheckedChange={(c) => setEnabled(c)} />
            <Text size="sm">Enable ready check</Text>
            <FieldTooltip content="When enabled, the extension waits for a page element to reach an idle state before collecting jobs." />
          </div>
          {enabled && (
            <>
              <FormField
                label="CSS Selector"
                tooltip={<FieldTooltip content="CSS selector for the element that shows loading/idle state." />}
                htmlFor="rc-selector"
              >
                <Textarea
                  id="rc-selector"
                  value={draft.selector}
                  onChange={(e) => setDraft((prev) => ({ ...prev, selector: e.target.value }))}
                  placeholder="e.g. .status-update"
                  rows={2}
                  size="sm"
                  className={cn("font-mono text-xs")}
                />
              </FormField>
              <FormField
                label="Mode"
                tooltip={
                  <FieldTooltip content="How the ready check determines stability. 'text' waits for the selected element's text to stop matching a value." />
                }
                htmlFor="rc-mode"
              >
                <Select
                  options={[{ label: "text", value: "text" }]}
                  value={draft.mode ?? "text"}
                  onValueChange={(v) => setDraft((prev) => ({ ...prev, mode: v as "text" }))}
                />
              </FormField>
              <FormField
                label="Value"
                tooltip={
                  <FieldTooltip content="Text value that indicates loading is still in progress. The check waits until this text disappears." />
                }
                hint='Default: "updating"'
                htmlFor="rc-value"
              >
                <Input
                  id="rc-value"
                  value={draft.value ?? ""}
                  onChange={(e) => setDraft((prev) => ({ ...prev, value: e.target.value || undefined }))}
                  placeholder="e.g. updating"
                />
              </FormField>
              <FormField
                label="Resolve Timeout (ms)"
                tooltip={<FieldTooltip content="Maximum time to wait for the loading text to disappear." />}
                hint="Default: 10000"
                htmlFor="rc-resolve"
              >
                <Input
                  id="rc-resolve"
                  type="number"
                  value={draft.resolveTimeoutMs ?? ""}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      resolveTimeoutMs: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  placeholder="10000"
                />
              </FormField>
              <FormField
                label="Watch Timeout (ms)"
                tooltip={
                  <FieldTooltip content="Maximum time to wait for the loading text to appear (if not currently visible)." />
                }
                hint="Default: 3000"
                htmlFor="rc-watch"
              >
                <Input
                  id="rc-watch"
                  type="number"
                  value={draft.watchTimeoutMs ?? ""}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      watchTimeoutMs: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  placeholder="3000"
                />
              </FormField>
              <FormField
                label="Poll Interval (ms)"
                tooltip={<FieldTooltip content="How often to check the element's text while waiting." />}
                hint="Default: 200"
                htmlFor="rc-poll"
              >
                <Input
                  id="rc-poll"
                  type="number"
                  value={draft.pollIntervalMs ?? ""}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      pollIntervalMs: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  placeholder="200"
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
