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

import { useToastQueue } from "@/modules/applications/shared/hooks/useToastQueue";

/* MOCK DATA: replace with generated Preference type from @/gql/hooks */
interface PreferenceItem {
  id: string;
  text: string;
  weight: "high" | "low";
}

let prefIdCounter = 0;
function nextPrefId(): string {
  prefIdCounter += 1;
  return `pref-${prefIdCounter}`;
}

/* MOCK DATA: replace with useUserPreferencesQuery + useUpdateUserPreferencesMutation (T-186) */
function useMockUserPreferences() {
  const [preferences, setPreferences] = React.useState<PreferenceItem[]>([
    { id: nextPrefId(), text: "Remote-first company", weight: "high" },
    { id: nextPrefId(), text: "Equity compensation", weight: "low" },
    { id: nextPrefId(), text: "No on-call rotation", weight: "high" },
  ]);

  function addPreference() {
    setPreferences((prev) => [
      ...prev,
      { id: nextPrefId(), text: "", weight: "low" },
    ]);
  }

  function updatePreference(
    id: string,
    patch: Partial<Pick<PreferenceItem, "text" | "weight">>,
  ) {
    setPreferences((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }

  function removePreference(id: string) {
    setPreferences((prev) => prev.filter((p) => p.id !== id));
  }

  return { preferences, addPreference, updatePreference, removePreference };
}

function PreferencesEditor({
  preferences,
  onUpdate,
  onRemove,
  listRef,
}: {
  preferences: PreferenceItem[];
  onUpdate: (
    id: string,
    patch: Partial<Pick<PreferenceItem, "text" | "weight">>,
  ) => void;
  onRemove: (id: string) => void;
  listRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className={cn("flex flex-col gap-3")}>
      {preferences.length === 0 ? (
        <Text size="sm" color="muted">
          No preferences yet. Add things like "remote only" or "equity".
        </Text>
      ) : (
        <div ref={listRef} className={cn("flex flex-col gap-2")}>
          {preferences.map((pref) => (
            <div key={pref.id} className={cn("flex items-start gap-2")}>
              <div className={cn("flex flex-1 items-start gap-2")}>
                <Input
                  value={pref.text}
                  onChange={(e) => onUpdate(pref.id, { text: e.target.value })}
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
                        pref.weight === "high"
                          ? "text-text-success"
                          : "text-text-muted",
                      )}
                    >
                      {pref.weight === "high" ? (
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
                    onSelect={() => onUpdate(pref.id, { weight: "high" })}
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
                    onSelect={() => onUpdate(pref.id, { weight: "low" })}
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
          ))}
        </div>
      )}
    </div>
  );
}

interface PreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreferencesModal({
  open,
  onOpenChange,
}: PreferencesModalProps) {
  const { preferences, addPreference, updatePreference, removePreference } =
    useMockUserPreferences();
  const { enqueueToast } = useToastQueue();
  const [saving, setSaving] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);
  const prevCountRef = React.useRef(preferences.length);

  React.useEffect(() => {
    if (preferences.length > prevCountRef.current) {
      prevCountRef.current = preferences.length;
      const inputs =
        listRef.current?.querySelectorAll<HTMLInputElement>("input");
      inputs?.[inputs.length - 1]?.focus();
    }
    prevCountRef.current = preferences.length;
  }, [preferences.length]);

  async function handleSave() {
    /* MOCK DATA: replace with real updateUserPreferences mutation (T-186) */
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    setSaving(false);
    enqueueToast({ title: "Preferences saved.", intent: "success" });
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Preferences"
      description="What matters to you in a job? These preferences are used to evaluate fit against job descriptions."
      trigger={<span />}
      childrenClassName="overflow-auto"
      footer={
        <div className={cn("flex items-center justify-between gap-2")}>
          <Button
            intent="secondary"
            size="md"
            onClick={addPreference}
            disabled={preferences.some((p) => p.text.trim().length === 0)}
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
      }
    >
      <PreferencesEditor
        preferences={preferences}
        onUpdate={updatePreference}
        onRemove={removePreference}
        listRef={listRef}
      />
    </Dialog>
  );
}
