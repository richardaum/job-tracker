"use client";

import { Button, cn, Dialog, Input, Text } from "@job-tracker/ui";
import { useCallback, useState } from "react";

import { useUpdatePlanMutation } from "@/gql/hooks";

type RenamePlanDialogProps = {
  planId: string;
  currentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RenamePlanDialog({ planId, currentName, open, onOpenChange }: RenamePlanDialogProps) {
  const [name, setName] = useState(currentName);
  const [updatePlan, { loading }] = useUpdatePlanMutation();

  const handleSave = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === currentName) {
      onOpenChange(false);
      return;
    }

    await updatePlan({ variables: { id: planId, input: { displayName: trimmed } } });
    onOpenChange(false);
  }, [name, currentName, planId, updatePlan, onOpenChange]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title="Rename plan"
      description={
        <Text size="sm" color="secondary">
          Update the display name for this source plan.
        </Text>
      }
      footer={
        <div className={cn("flex items-center gap-2")}>
          <div className={cn("ml-auto flex gap-2")}>
            <Button intent="secondary" size="md" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              intent="primary"
              size="md"
              state={loading ? "loading" : "default"}
              onClick={() => void handleSave()}
            >
              Save
            </Button>
          </div>
        </div>
      }
    >
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Plan name"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
        }}
      />
    </Dialog>
  );
}
