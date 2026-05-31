"use client";

import { Button, cn, Text } from "@job-tracker/ui";
import React from "react";

import { usePlanQuery, useUpdatePlanMutation } from "@/gql/hooks";
import { HeadlessJsonEditor } from "@/modules/sources/components/HeadlessJsonEditor";
import {
  PlanHeaderActions,
  PlanTabDescription,
} from "@/modules/sources/page/plan-details-header.slots";

export default function PlanDocumentTabContent({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = React.use(params);
  const { data } = usePlanQuery({ variables: { id: planId } });
  const [updatePlan] = useUpdatePlanMutation();
  const plan = data?.plan ?? null;

  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const documentRef = React.useRef<unknown>(null);
  React.useEffect(() => {
    if (plan) {
      documentRef.current = plan.document;
    }
  }, [plan]);

  if (!plan) return null;

  async function handleSave() {
    if (!plan) return;
    setSaving(true);
    await updatePlan({
      variables: {
        id: plan.id,
        input: { document: documentRef.current as Record<string, unknown> },
      },
    });
    setSaving(false);
    setDirty(false);
  }

  const saveButton = (
    <Button
      intent="primary"
      size="md"
      type="button"
      state={saving ? "loading" : "default"}
      disabled={!dirty || saving}
      onClick={handleSave}
    >
      Save
    </Button>
  );

  return (
    <>
      <PlanTabDescription>
        <Text size="sm" color="secondary">
          Configure extraction rules and constraints for this plan.
        </Text>
      </PlanTabDescription>
      <PlanHeaderActions>{saveButton}</PlanHeaderActions>
      <div
        className={cn(
          "min-h-0 flex-1 overflow-auto rounded-lg border border-border-subtle bg-bg-app p-4",
        )}
      >
        <HeadlessJsonEditor
          key={plan.id}
          data={plan.document}
          onChange={(next) => {
            documentRef.current = next;
            setDirty(true);
          }}
        />
      </div>
    </>
  );
}
