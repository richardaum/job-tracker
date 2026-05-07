"use client";

import { Button, Card, cn, Stack, Text } from "@job-tracker/ui";
import { ListBulletsIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

type DraftApplicationPageProps = { draftId: string };

export default function DraftApplicationPage({
  draftId,
}: DraftApplicationPageProps) {
  const router = useRouter();

  return (
    <div className={cn("flex h-full flex-col")}>
      {/* Action bar */}
      <div
        className={cn(
          "flex flex-col gap-3 border-b border-border-subtle px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        )}
      >
        <div
          className={cn(
            "flex w-full items-center gap-2 rounded-md border border-border-subtle bg-bg-surface-hover px-3 py-2 sm:max-w-sm",
          )}
        >
          <MagnifyingGlassIcon
            size={14}
            weight="regular"
            className={cn("shrink-0 text-text-muted")}
          />
          <Text
            as="span"
            size="sm"
            color="muted"
            className={cn("min-w-0 flex-1")}
          >
            Search applications...
          </Text>
          <span
            className={cn(
              "rounded border border-border-subtle px-1.5 py-0.5 text-xs text-text-muted",
            )}
          >
            ⌘/
          </span>
        </div>

        <div className={cn("w-full sm:w-auto")}>
          <Button
            intent="primary"
            size="sm"
            leftIcon={<ListBulletsIcon size={16} weight="bold" />}
            onClick={() => {
              router.push("/applications");
            }}
          >
            Applications
          </Button>
        </div>
      </div>

      {/* Quick filters */}
      <div
        className={cn(
          "flex items-center gap-2 border-b border-border-subtle px-4 py-2 sm:px-6",
        )}
      >
        <div className={cn("flex flex-wrap items-center gap-1.5")} />
      </div>

      {/* Content */}
      <div
        className={cn("flex min-h-0 flex-1 flex-col overflow-auto p-4 sm:p-6")}
      >
        <Stack gap="sm">
          <Card padding="sm">
            <Stack gap="sm">
              <Text size="sm" color="secondary">
                Draft{" "}
                <Text as="span" weight="semibold" className={cn("font-mono")}>
                  {draftId}
                </Text>{" "}
                was created from the extension import flow.
              </Text>
              <Text size="sm" color="muted">
                The full draft editing experience is not finished yet. You can
                continue from your applications list when it is ready.
              </Text>
            </Stack>
          </Card>
        </Stack>
      </div>
    </div>
  );
}
