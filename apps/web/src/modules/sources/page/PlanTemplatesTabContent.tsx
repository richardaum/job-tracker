"use client";

import { Button, cn } from "@job-tracker/ui";
import { PlusIcon } from "@phosphor-icons/react";
import { use, useState } from "react";

import { NewSourceTemplateDialog } from "@/modules/sources/page/NewSourceTemplateDialog";
import {
  PlanHeaderActions,
  PlanTabDescription,
} from "@/modules/sources/page/plan-details-header.slots";
import { PlanTemplatesList } from "@/modules/sources/page/PlanTemplatesList";

type PlanTemplatesTabContentProps = { params: Promise<{ planId: string }> };

export default function PlanTemplatesTabContent({
  params,
}: PlanTemplatesTabContentProps) {
  const { planId } = use(params);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <PlanTabDescription>
        Link a URL to this plan to ingest jobs via the Chrome extension.
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
