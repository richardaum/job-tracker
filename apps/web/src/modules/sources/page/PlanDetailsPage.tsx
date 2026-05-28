"use client";

import { Button, cn, Heading, Text } from "@job-tracker/ui";
import React, { useState } from "react";

import { BackToLink } from "@/components/back-to-link";
import { DetailPageHeader } from "@/components/detail-page-header";
import { HeadlessJsonEditor } from "@/modules/sources/components/HeadlessJsonEditor";
import { findMockPlanById, MOCK_PLANS } from "@/modules/sources/lib/mock-plans";

export default function PlanDetailsPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = React.use(params);
  const initialPlan = React.useMemo(() => findMockPlanById(planId), [planId]);
  const [plan, setPlan] = useState(initialPlan);
  const [dirty, setDirty] = useState(false);

  if (!plan) {
    return (
      <div className={cn("flex h-full items-center justify-center p-6")}>
        <Text color="error">Plan not found.</Text>
      </div>
    );
  }

  function handleChange(next: unknown) {
    setPlan(next as typeof plan);
    setDirty(true);
  }

  function handleSave() {
    const idx = MOCK_PLANS.findIndex((p) => p.id === planId);
    if (idx >= 0) {
      (MOCK_PLANS as unknown[])[idx] = plan;
    }
    setDirty(false);
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <DetailPageHeader
        trailing={
          <Button
            intent="primary"
            size="sm"
            type="button"
            state={dirty ? "default" : "loading"}
            disabled={!dirty}
            onClick={handleSave}
          >
            Save
          </Button>
        }
      >
        <BackToLink href="/sources/plans">Back to plans</BackToLink>
        <Heading as="h1" size="2xl" className={cn("min-w-0")}>
          {plan.name}
        </Heading>
      </DetailPageHeader>
      <div className={cn("flex min-h-0 flex-1 flex-col p-4 sm:p-6")}>
        <div
          className={cn(
            "min-h-0 flex-1 overflow-auto rounded-lg border border-border-subtle bg-bg-app p-4",
          )}
        >
          <HeadlessJsonEditor data={plan} onChange={handleChange} />
        </div>
      </div>
    </div>
  );
}
