"use client";

import {
  Badge,
  Button,
  Card,
  cn,
  ConfirmDialog,
  Stack,
  Text,
} from "@job-tracker/ui";
import { TrashIcon } from "@phosphor-icons/react";

import { ImportRunsDocument, useDeleteImportRunMutation } from "@/gql/hooks";
import type { ImportRun } from "@/modules/imports/types/importRun";
import {
  formatImportRunStartedAt,
  formatImportRunStatusLabel,
  importRunStatusBadgeIntent,
} from "@/modules/imports/utils/importRunDisplay";

export type ImportRunDetailsProps = { run: ImportRun; onDeleted?: () => void };

export function ImportRunDetails({ run, onDeleted }: ImportRunDetailsProps) {
  const [deleteImportRun] = useDeleteImportRunMutation({
    refetchQueries: [{ query: ImportRunsDocument }],
    awaitRefetchQueries: true,
  });

  async function handleConfirmDelete(): Promise<void> {
    await deleteImportRun({ variables: { id: run.id } });
    onDeleted?.();
  }

  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto p-4 sm:p-6")}>
      <Card padding="md">
        <Stack gap="sm">
          <div>
            <Text size="xs" color="secondary">
              Importer
            </Text>
            <Text size="sm" weight="semibold">
              {run.importerName}
            </Text>
          </div>
          <div>
            <Text size="xs" color="secondary">
              Entry URL
            </Text>
            <Text size="sm" className={cn("break-all")}>
              <a
                href={run.entryUrl}
                target="_blank"
                rel="noreferrer"
                className={cn("text-text-brand underline")}
              >
                {run.entryUrl}
              </a>
            </Text>
          </div>
          <div>
            <Text size="xs" color="secondary">
              Source
            </Text>
            <Text size="sm">{run.importerSource}</Text>
          </div>
          <div>
            <Text size="xs" color="secondary">
              Status
            </Text>
            <Badge intent={importRunStatusBadgeIntent(run.status)}>
              {formatImportRunStatusLabel(run.status)}
            </Badge>
          </div>
          <div>
            <Text size="xs" color="secondary">
              Started
            </Text>
            <Text size="sm">{formatImportRunStartedAt(run.startedAt)}</Text>
          </div>
          <div>
            <Text size="xs" color="secondary">
              Run id
            </Text>
            <Text size="xs" className={cn("font-mono break-all")}>
              {run.id}
            </Text>
          </div>
          <ConfirmDialog
            title="Remove import run"
            description={`Remove this "${run.importerName}" run from your history? You can start another run anytime.`}
            confirmLabel="Remove"
            trigger={
              <Button
                intent="destructive"
                size="sm"
                type="button"
                leftIcon={<TrashIcon size={16} weight="regular" />}
              >
                Remove run
              </Button>
            }
            onConfirm={handleConfirmDelete}
          />
        </Stack>
      </Card>
    </div>
  );
}
