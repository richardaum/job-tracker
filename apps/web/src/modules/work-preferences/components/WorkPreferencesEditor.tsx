"use client";

import { tryRun } from "@job-tracker/try-run";
import { Button, cn, Stack, Text } from "@job-tracker/ui";
import { PlusIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { Weight } from "@/gql/hooks";
import { useUpdateWorkPreferencesMutation, useWorkPreferencesQuery } from "@/gql/hooks";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";
import { PreferenceCard } from "@/modules/work-preferences/components/PreferenceCard";
import { PreferenceFormDialog } from "@/modules/work-preferences/components/PreferenceFormDialog";
import {
  type LocalPreference,
  nextPrefId,
  toLocal,
  toPreferenceInput,
} from "@/modules/work-preferences/model/work-preference.model";

interface WorkPreferencesEditorProps {
  mode: "inline" | "dialog";
  readOnly?: boolean;
  onClose?: () => void;
  onAddActionChange?: (action: { add: () => void; disabled: boolean } | null) => void;
}

export function WorkPreferencesEditor({
  mode,
  readOnly = false,
  onClose,
  onAddActionChange,
}: WorkPreferencesEditorProps) {
  const { data, loading } = useWorkPreferencesQuery({ fetchPolicy: "cache-and-network" });
  const [updatePreferences] = useUpdateWorkPreferencesMutation();
  const { enqueueToast } = useToastQueue();

  const [localItems, setLocalItems] = useState<LocalPreference[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (!hasHydratedRef.current && data?.workPreferences) {
      setLocalItems(toLocal(data.workPreferences));
      hasHydratedRef.current = true;
    }
  }, [data?.workPreferences]);

  const persistPreferences = useCallback(
    async (items: LocalPreference[]) => {
      const [err] = await tryRun(
        updatePreferences({ variables: { items: toPreferenceInput(items) }, refetchQueries: ["WorkPreferences"] }),
      );
      if (err) {
        enqueueToast({ title: "Failed to save preferences.", intent: "error" });
      }
    },
    [enqueueToast, updatePreferences],
  );

  const openCreateDialog = useCallback(() => {
    setFormMode("create");
    setEditingId(null);
    setFormOpen(true);
  }, []);

  const openEditDialog = useCallback((id: string) => {
    setFormMode("edit");
    setEditingId(id);
    setFormOpen(true);
  }, []);

  const addInHeader = mode === "inline" && !!onAddActionChange && !readOnly;

  useEffect(() => {
    if (!addInHeader) {
      onAddActionChange?.(null);
      return;
    }

    onAddActionChange({ add: openCreateDialog, disabled: false });

    return () => {
      onAddActionChange(null);
    };
  }, [addInHeader, onAddActionChange, openCreateDialog]);

  async function handleFormSubmit(values: { text: string; weight: Weight }) {
    let next: LocalPreference[];

    if (formMode === "create") {
      next = [...localItems, { id: nextPrefId(), text: values.text, weight: values.weight }];
    } else if (editingId) {
      next = localItems.map((item) => (item.id === editingId ? { ...item, ...values } : item));
    } else {
      return;
    }

    setLocalItems(next);
    await persistPreferences(next);
  }

  async function handleDelete(id: string) {
    const next = localItems.filter((item) => item.id !== id);
    setLocalItems(next);
    await persistPreferences(next);
  }

  async function handleWeightChange(id: string, weight: Weight) {
    const next = localItems.map((item) => (item.id === id ? { ...item, weight } : item));
    setLocalItems(next);
    await persistPreferences(next);
  }

  const editingPreference = editingId ? localItems.find((item) => item.id === editingId) : undefined;

  const isLoaded = !!data?.workPreferences;

  const content =
    loading && !isLoaded ? (
      <Text size="sm" color="muted">
        Loading preferences...
      </Text>
    ) : localItems.length === 0 ? (
      <EmptyState variant="default" message="No preferences yet." detail='Add things like "remote only" or "equity".' />
    ) : (
      <Stack gap="sm">
        {localItems.map((preference) => (
          <PreferenceCard
            key={preference.id}
            preference={preference}
            readOnly={readOnly}
            onEdit={openEditDialog}
            onDelete={(id) => {
              void handleDelete(id);
            }}
            onWeightChange={(id, weight) => {
              void handleWeightChange(id, weight);
            }}
          />
        ))}
      </Stack>
    );

  const showFooterAdd = !readOnly && !addInHeader;
  const showFooterCancel = mode === "dialog" && !readOnly;

  const footer =
    showFooterAdd || showFooterCancel ? (
      <div
        className={cn(
          "flex items-center gap-2",
          mode === "inline" && "mt-4",
          showFooterAdd && showFooterCancel ? "justify-between" : "justify-end",
        )}
      >
        {showFooterAdd ? (
          <Button intent="secondary" size="md" onClick={openCreateDialog}>
            <PlusIcon size={14} weight="bold" className={cn("mr-1.5")} />
            Add preference
          </Button>
        ) : null}
        {showFooterCancel ? (
          <Button intent="ghost" size="md" onClick={() => onClose?.()}>
            Cancel
          </Button>
        ) : null}
      </div>
    ) : null;

  const editorBody = (
    <>
      {content}
      {footer}
      {!readOnly ? (
        <PreferenceFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          mode={formMode}
          initialText={editingPreference?.text ?? ""}
          initialWeight={editingPreference?.weight ?? Weight.Low}
          onSubmit={handleFormSubmit}
        />
      ) : null}
    </>
  );

  if (mode === "inline") {
    return (
      <div>
        <Text size="sm" color="muted" className={cn("px-1 mb-4")}>
          What matters to you in a job? These preferences are used to evaluate match against job descriptions.
        </Text>
        {editorBody}
      </div>
    );
  }

  return editorBody;
}
