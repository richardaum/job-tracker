"use client";

import { Button, cn } from "@job-tracker/ui";
import { use, useEffect, useRef, useState } from "react";

import { usePlanQuery, useUpdatePlanMutation } from "@/gql/hooks";
import { HeadlessJsonEditor } from "@/modules/sources/components/HeadlessJsonEditor";
import {
  PlanHeaderActions,
  PlanTabDescription,
} from "@/modules/sources/page/plan-details-header.slots";

type PlanDocumentTabContentProps = { params: Promise<{ planId: string }> };

export default function PlanDocumentTabContent({
  params,
}: PlanDocumentTabContentProps) {
  const { planId } = use(params);
  const { data } = usePlanQuery({ variables: { id: planId } });
  const [updatePlan] = useUpdatePlanMutation();
  const plan = data?.plan ?? null;

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const documentRef = useRef<unknown>(null);
  useEffect(() => {
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
        Configure extraction rules and constraints for this plan.
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
