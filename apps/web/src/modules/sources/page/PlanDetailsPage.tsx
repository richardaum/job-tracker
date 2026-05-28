"use client";

import { Button, cn, Heading, Text } from "@job-tracker/ui";
import type { Route } from "next";
import React from "react";

import { BackToLink } from "@/components/back-to-link";
import { DetailPageHeader } from "@/components/detail-page-header";
import { EntityNotFound } from "@/components/entity-not-found";
import { usePlanQuery, useUpdatePlanMutation } from "@/gql/hooks";
import { HeadlessJsonEditor } from "@/modules/sources/components/HeadlessJsonEditor";

export default function PlanDetailsPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = React.use(params);
  const { data, loading } = usePlanQuery({
    variables: { sourceProfileId: planId },
  });
  const [updatePlan] = useUpdatePlanMutation();
  const plan = data?.plan;

  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const documentRef = React.useRef<unknown>(null);
  React.useEffect(() => {
    if (plan) {
      documentRef.current = plan.document;
    }
  }, [plan]);

  async function handleSave() {
    if (!plan) return;
    setSaving(true);
    await updatePlan({
      variables: { id: plan.id, input: { document: documentRef.current } },
    });
    setSaving(false);
    setDirty(false);
  }

  if (loading) {
    return (
      <div className={cn("flex h-full items-center justify-center p-6")}>
        <Text color="secondary">Loading...</Text>
      </div>
    );
  }

  if (!plan) {
    return (
      <EntityNotFound
        resource="plan"
        backHref="/sources/plans"
        backLabel="Back to plans"
      />
    );
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <DetailPageHeader
        trailing={
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
        }
      >
        <BackToLink href={"/sources/plans" as Route}>Back to plans</BackToLink>
        <Heading as="h1" size="2xl" className={cn("min-w-0")}>
          {plan.displayName}
        </Heading>
      </DetailPageHeader>
      <div className={cn("flex min-h-0 flex-1 flex-col p-4 sm:p-6")}>
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
      </div>
    </div>
  );
}
