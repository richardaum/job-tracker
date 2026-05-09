"use client";

import {
  Button,
  cn,
  Combobox,
  type ComboboxOption,
  Dialog,
} from "@job-tracker/ui";
import { PlusIcon } from "@phosphor-icons/react";
import { useMemo } from "react";

import { useBuiltInImportersQuery } from "@/gql/hooks";

const IMPORTER_COMBO_ID = "imports-new-run-importer";

export type NewImportRunDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importerComboValue: string;
  onImporterComboValueChange: (value: string) => void;
  canStart: boolean;
  creatingRun: boolean;
  onStart: () => void | Promise<void>;
};

export function NewImportRunDialog({
  open,
  onOpenChange,
  importerComboValue,
  onImporterComboValueChange,
  canStart,
  creatingRun,
  onStart,
}: NewImportRunDialogProps) {
  const { data: builtInData, loading: builtInsLoading } =
    useBuiltInImportersQuery();
  const importerComboOptions: ComboboxOption[] = useMemo(
    () =>
      (builtInData?.builtInImporters ?? []).map((imp) => ({
        value: imp.importerId,
        label: imp.name,
      })),
    [builtInData?.builtInImporters],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="New run"
      size="sm"
      trigger={
        <Button
          intent="primary"
          size="md"
          leftIcon={<PlusIcon size={16} weight="bold" />}
          type="button"
          disabled={builtInsLoading}
        >
          New run
        </Button>
      }
      footer={
        <div className={cn("flex w-full justify-end gap-2")}>
          <Button
            intent="secondary"
            size="md"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            size="md"
            type="button"
            disabled={!canStart || creatingRun}
            onClick={() => void onStart()}
          >
            Start
          </Button>
        </div>
      }
    >
      <Combobox
        id={IMPORTER_COMBO_ID}
        value={importerComboValue}
        onValueChange={onImporterComboValueChange}
        options={importerComboOptions}
        placeholder={builtInsLoading ? "Loading importers…" : "Choose importer"}
        size="sm"
        autoComplete="off"
      />
    </Dialog>
  );
}
