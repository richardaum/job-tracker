"use client";

import { Button, cn, Text } from "@job-tracker/ui";
import { PlusIcon } from "@phosphor-icons/react";
import React from "react";

import { NewSourceTemplateDialog } from "@/modules/sources/page/NewSourceTemplateDialog";
import {
  PlanHeaderActions,
  PlanTabDescription,
} from "@/modules/sources/page/plan-details-header.slots";
import { PlanTemplatesList } from "@/modules/sources/page/PlanTemplatesList";

export default function PlanTemplatesTabContent({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = React.use(params);
  const [importOpen, setImportOpen] = React.useState(false);

  return (
    <>
      <PlanTabDescription>
        <Text size="sm" color="secondary">
          Link a URL to this plan to ingest jobs via the Chrome extension.
        </Text>
      </PlanTabDescription>
      <PlanHeaderActions>
        <Button
          intent="primary"
          size="md"
          type="button"
          leftIcon={<PlusIcon size={16} weight="bold" />}
          onClick={() => setImportOpen(true)}
        >
          New template
        </Button>
      </PlanHeaderActions>
      <NewSourceTemplateDialog
        open={importOpen}
        planId={planId}
        onOpenChange={setImportOpen}
      />
      <div className={cn("flex flex-col gap-3")}>
        <PlanTemplatesList planId={planId} />
      </div>
    </>
  );
}
