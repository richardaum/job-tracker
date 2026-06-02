"use client";

import { Button, Card, cn, DropdownMenu, DropdownMenuItem, Heading, Skeleton, Stack, Text } from "@job-tracker/ui";
import { EmptyState } from "@/components/empty-state";
import { CaretDownIcon, PencilIcon, PlusIcon } from "@phosphor-icons/react";
import type { Route } from "next";
import { SafeLink } from "@/components/safe-link";
import { useState } from "react";

import { usePlansQuery } from "@/gql/hooks";
import { SourcesHeaderActions } from "@/modules/sources/layout/sources-header.slots";
import { ImportPlanDialog } from "@/modules/sources/page/ImportPlanDialog";
import { RenamePlanDialog } from "@/modules/sources/page/RenamePlanDialog";

export default function PlansPage() {
  const [importOpen, setImportOpen] = useState(false);
  const { data, loading } = usePlansQuery();
  const plans = data?.plans ?? [];

  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);

  return (
    <div className={cn("flex h-full min-h-0 flex-1 flex-col")}>
      <SourcesHeaderActions>
        <Button
          type="button"
          intent="primary"
          size="md"
          leftIcon={<PlusIcon size={16} weight="bold" />}
          onClick={() => setImportOpen(true)}
        >
          Import plan
        </Button>
      </SourcesHeaderActions>

      <ImportPlanDialog open={importOpen} onOpenChange={setImportOpen} />

      <RenamePlanDialog
        planId={renameTarget?.id ?? ""}
        currentName={renameTarget?.name ?? ""}
        open={renameTarget != null}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
      />

      <div className={cn("px-4 pb-2 pt-4 sm:px-6 sm:pb-2 sm:pt-6")}>
        <Text size="sm" color="secondary">
          {loading ? "Loading..." : `${plans.length} plans found`}
        </Text>
      </div>
      <div className={cn("flex min-h-0 flex-1 flex-col overflow-auto px-4 pb-4 pt-0.5 sm:px-6 sm:pb-6")}>
        {loading ? (
          <Stack gap="md">
            {Array.from({ length: 3 }, (_, i) => (
              <Card key={i} padding="md">
                <Skeleton variant="text" className={cn("h-5 w-48")} />
              </Card>
            ))}
          </Stack>
        ) : plans.length === 0 ? (
          <EmptyState variant="default" message="No plans yet." detail="Import a plan to start tracking sources." />
        ) : (
          <Stack gap="md">
            {plans.map((plan) => (
              <Card key={plan.id} padding="md">
                <div className={cn("space-y-1")}>
                  <div className={cn("flex items-center gap-3")}>
                    <div className={cn("min-w-0 flex-1")}>
                      <Heading as="h3" size="base">
                        <SafeLink
                          href={`/sources/plans/${plan.id}` as Route}
                          className={cn("text-text hover:text-text-link hover:underline transition-colors")}
                        >
                          {plan.displayName}
                        </SafeLink>
                      </Heading>
                    </div>
                    <DropdownMenu
                      trigger={
                        <Button intent="secondary" size="sm" rightIcon={<CaretDownIcon size={14} weight="bold" />}>
                          Actions
                        </Button>
                      }
                      align="end"
                    >
                      <DropdownMenuItem
                        icon={<PencilIcon size={16} weight="regular" />}
                        onSelect={() => setRenameTarget({ id: plan.id, name: plan.displayName })}
                      >
                        Edit name
                      </DropdownMenuItem>
                    </DropdownMenu>
                  </div>
                  <Text size="sm" color="secondary">
                    {plan.templates.length} template(s)
                  </Text>
                </div>
              </Card>
            ))}
          </Stack>
        )}
      </div>
    </div>
  );
}
