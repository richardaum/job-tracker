"use client";

import { Card, cn, Heading, Skeleton, Stack, Text } from "@job-tracker/ui";
import { useRouter } from "next/navigation";

import { usePlansQuery } from "@/gql/hooks";

export default function PlansPage() {
  const router = useRouter();
  const { data, loading } = usePlansQuery();
  const plans = data?.plans ?? [];

  return (
    <div className={cn("flex h-full min-h-0 flex-1 flex-col")}>
      <div className={cn("px-4 pb-2 pt-4 sm:px-6 sm:pb-2 sm:pt-6")}>
        <Text size="sm" color="secondary">
          {loading ? "Loading..." : `${plans.length} plans found`}
        </Text>
      </div>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-auto px-4 pb-4 sm:px-6 sm:pb-6",
        )}
      >
        {loading ? (
          <Stack gap="md">
            {Array.from({ length: 3 }, (_, i) => (
              <Card key={i} padding="md">
                <Skeleton variant="text" className={cn("h-5 w-48")} />
              </Card>
            ))}
          </Stack>
        ) : (
          <Stack gap="md">
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() =>
                  router.push(`/sources/plans/${plan.sourceProfileId}`)
                }
                className={cn("w-full cursor-pointer text-start")}
              >
                <Card
                  padding="md"
                  className={cn("hover:bg-bg-subtle transition-colors")}
                >
                  <div className={cn("space-y-3")}>
                    <div className={cn("flex items-center gap-3")}>
                      <div className={cn("min-w-0 flex-1")}>
                        <Heading as="h3" size="base">
                          {plan.displayName}
                        </Heading>
                      </div>
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </Stack>
        )}
      </div>
    </div>
  );
}
