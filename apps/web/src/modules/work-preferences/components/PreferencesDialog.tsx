"use client";

import {
  Button,
  cn,
  Dialog,
  DropdownMenu,
  DropdownMenuItem,
  Input,
  Text,
} from "@job-tracker/ui";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import React from "react";

import { type PreferenceInput, Weight } from "@/gql/hooks";
import {
  useUpdateWorkPreferencesMutation,
  useWorkPreferencesQuery,
} from "@/gql/hooks";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";

interface LocalPreference {
  id: string;
  text: string;
  weight: Weight;
}

let prefIdCounter = 0;
function nextPrefId(): string {
  prefIdCounter += 1;
  return `pref-${prefIdCounter}`;
}

function toLocal(
  items: readonly { text: string; weight: Weight }[],
): LocalPreference[] {
  return items.map((p) => ({
    id: nextPrefId(),
    text: p.text,
    weight: p.weight,
  }));
}

function PreferencesEditor({
  preferences,
  onUpdate,
  onRemove,
  focusedId,
  readOnly = false,
}: {
  preferences: LocalPreference[];
  onUpdate: (
    id: string,
    patch: Partial<Pick<LocalPreference, "text" | "weight">>,
  ) => void;
  onRemove: (id: string) => void;
  focusedId: string | null;
  readOnly?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-3")}>
      {preferences.length === 0 ? (
        <Text size="sm" color="muted">
          No preferences yet. Add things like "remote only" or "equity".
        </Text>
      ) : (
        <div className={cn("flex flex-col gap-2")}>
          {preferences.map((pref) =>
            readOnly ? (
              <div
                key={pref.id}
                className={cn(
                  "flex items-center gap-2 rounded-lg border border-border-default bg-bg-field px-3 py-2.5",
                )}
              >
                <Text size="sm">{pref.text}</Text>
                <div className={cn("ml-auto shrink-0")}>
                  {pref.weight === Weight.High ? (
                    <ArrowUpIcon
                      size={14}
                      weight="bold"
                      className={cn("text-green-500")}
                    />
                  ) : (
                    <ArrowDownIcon
                      size={14}
                      weight="bold"
                      className={cn("text-text-muted")}
                    />
                  )}
                </div>
              </div>
            ) : (
              <PreferenceRow
                key={pref.id}
                pref={pref}
                onUpdate={onUpdate}
                onRemove={onRemove}
                shouldFocus={focusedId === pref.id}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function PreferenceRow({
  pref,
  onUpdate,
  onRemove,
  shouldFocus,
}: {
  pref: LocalPreference;
  onUpdate: (
    id: string,
    patch: Partial<Pick<LocalPreference, "text" | "weight">>,
  ) => void;
  onRemove: (id: string) => void;
  shouldFocus: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (shouldFocus) {
      inputRef.current?.focus();
    }
  }, [shouldFocus]);

  return (
    <div className={cn("flex items-start gap-2")}>
      <div className={cn("flex flex-1 items-start gap-2")}>
        <Input
          ref={inputRef}
          value={pref.text}
          onChange={(e) =>
            onUpdate(pref.id, { text: e.target.value.slice(0, 255) })
          }
          maxLength={255}
          placeholder="e.g. Remote-first company"
          className={cn("flex-1")}
        />
        <DropdownMenu
          trigger={
            <Button
              intent="ghost"
              size="md"
              className={cn(
                "h-9 shrink-0 px-2",
                pref.weight === Weight.High
                  ? "text-text-success"
                  : "text-text-muted",
              )}
            >
              {pref.weight === Weight.High ? (
                <ArrowUpIcon size={14} weight="bold" />
              ) : (
                <ArrowDownIcon size={14} weight="bold" />
              )}
            </Button>
          }
          align="end"
        >
          <DropdownMenuItem
            icon={
              <ArrowUpIcon
                size={14}
                weight="bold"
                className={cn("text-text-success")}
              />
            }
            onSelect={() => onUpdate(pref.id, { weight: Weight.High })}
          >
            High
          </DropdownMenuItem>
          <DropdownMenuItem
            icon={
              <ArrowDownIcon
                size={14}
                weight="bold"
                className={cn("text-text-muted")}
              />
            }
            onSelect={() => onUpdate(pref.id, { weight: Weight.Low })}
          >
            Low
          </DropdownMenuItem>
        </DropdownMenu>
        <Button
          intent="ghost"
          size="md"
          className={cn(
            "h-9 shrink-0 px-2 text-text-muted hover:text-text-error",
          )}
          onClick={() => onRemove(pref.id)}
          aria-label={`Remove preference "${pref.text}"`}
        >
          <TrashIcon size={14} weight="regular" />
        </Button>
      </div>
    </div>
  );
}

interface PreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
}

export function PreferencesDialog({
  open,
  onOpenChange,
  readOnly = false,
}: PreferencesDialogProps) {
  const { data, loading } = useWorkPreferencesQuery({
    fetchPolicy: "cache-and-network",
    skip: !open,
  });
  const [updatePreferences] = useUpdateWorkPreferencesMutation();
  const { enqueueToast } = useToastQueue();

  const [localItems, setLocalItems] = React.useState<LocalPreference[]>([]);
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [prevOpen, setPrevOpen] = React.useState(open);
  const [prevData, setPrevData] = React.useState<typeof data | null>(null);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setLocalItems([]);
      setFocusedId(null);
      setPrevData(null);
    }
  }

  if (open && data !== prevData && data?.workPreferences) {
    setPrevData(data);
    setLocalItems(toLocal(data.workPreferences));
  }

  function addPreference() {
    const newId = nextPrefId();
    setLocalItems((prev) => [
      ...prev,
      { id: newId, text: "", weight: Weight.Low },
    ]);
    setFocusedId(newId);
  }

  function updatePreference(
    id: string,
    patch: Partial<Pick<LocalPreference, "text" | "weight">>,
  ) {
    setLocalItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }

  function removePreference(id: string) {
    setLocalItems((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleSave() {
    const items: PreferenceInput[] = localItems
      .filter((p) => p.text.trim().length > 0)
      .map((p) => ({ text: p.text.trim(), weight: p.weight }));

    setSaving(true);
    try {
      await updatePreferences({
        variables: { items },
        refetchQueries: ["WorkPreferences"],
      });
      enqueueToast({ title: "Preferences saved.", intent: "success" });
      onOpenChange(false);
    } catch {
      enqueueToast({ title: "Failed to save preferences.", intent: "error" });
    } finally {
      setSaving(false);
    }
  }

  const isLoaded = !!data?.workPreferences;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Work Preferences"
      description="What matters to you in a job? These preferences are used to evaluate match against job descriptions."
      childrenClassName="overflow-auto"
      footer={
        readOnly ? undefined : (
          <div className={cn("flex items-center justify-between gap-0")}>
            <Button
              intent="secondary"
              size="md"
              onClick={addPreference}
              disabled={localItems.some((p) => p.text.trim().length === 0)}
            >
              <PlusIcon size={14} weight="bold" className={cn("mr-1.5")} />
              Add preference
            </Button>
            <div className={cn("flex gap-2")}>
              <Button
                intent="ghost"
                size="md"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                intent="primary"
                size="md"
                onClick={() => void handleSave()}
                state={saving ? "loading" : "default"}
              >
                Save
              </Button>
            </div>
          </div>
        )
      }
    >
      {loading && !isLoaded ? (
        <Text size="sm" color="muted">
          Loading preferences...
        </Text>
      ) : (
        <PreferencesEditor
          preferences={localItems}
          onUpdate={updatePreference}
          onRemove={removePreference}
          focusedId={focusedId}
          readOnly={readOnly}
        />
      )}
    </Dialog>
  );
}
