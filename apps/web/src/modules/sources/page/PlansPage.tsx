"use client";

import { Button, Card, cn, Heading, Skeleton, Stack, Text } from "@job-tracker/ui";
import { EmptyState } from "@/components/empty-state";
import { PlusIcon } from "@phosphor-icons/react";
import NextLink from "next/link";
import { useState } from "react";

import { usePlansQuery } from "@/gql/hooks";
import { SourcesHeaderActions } from "@/modules/sources/layout/sources-header.slots";
import { ImportPlanDialog } from "@/modules/sources/page/ImportPlanDialog";

export default function PlansPage() {
  const [importOpen, setImportOpen] = useState(false);
  const { data, loading } = usePlansQuery();
  const plans = data?.plans ?? [];

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
                        <NextLink
                          href={`/sources/plans/${plan.id}`}
                          className={cn("text-text hover:text-text-link hover:underline transition-colors")}
                        >
                          {plan.displayName}
                        </NextLink>
                      </Heading>
                    </div>
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
