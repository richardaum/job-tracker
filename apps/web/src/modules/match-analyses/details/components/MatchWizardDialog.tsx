"use client";

import { tryRun } from "@job-tracker/try-run";
import {
  Button,
  cn,
  Dialog,
  DropdownMenu,
  DropdownMenuItem,
  Input,
  Link,
  Select,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@job-tracker/ui";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BriefcaseIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import NextLink from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { type PreferenceInput, Weight } from "@/gql/hooks";
import {
  useResumesForPickerQuery,
  useUpdateWorkPreferencesMutation,
  useWorkPreferencesQuery,
} from "@/gql/hooks";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";

interface MatchWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (resumeId: string) => Promise<void>;
  generating: boolean;
  hasExistingMatch: boolean;
  /** Pre-select the resume used by the current match when regenerating. */
  initialResumeId?: string | null;
}

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

type PreferencesEditorProps = {
  preferences: LocalPreference[];
  onUpdate: (
    id: string,
    updates: Partial<Pick<LocalPreference, "text" | "weight">>,
  ) => void;
  onRemove: (id: string) => void;
  focusedId: string | null;
};

function PreferencesEditor({
  preferences,
  onUpdate,
  onRemove,
  focusedId,
}: PreferencesEditorProps) {
  return (
    <div className={cn("flex flex-col gap-3")}>
      {preferences.length === 0 ? (
        <Text size="sm" color="muted">
          No preferences yet. Add things like "remote only" or "equity".
        </Text>
      ) : (
        <div className={cn("flex flex-col gap-2")}>
          {preferences.map((pref) => (
            <PreferenceRow
              key={pref.id}
              pref={pref}
              onUpdate={onUpdate}
              onRemove={onRemove}
              shouldFocus={focusedId === pref.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type PreferenceRowProps = {
  pref: LocalPreference;
  onUpdate: (
    id: string,
    updates: Partial<Pick<LocalPreference, "text" | "weight">>,
  ) => void;
  onRemove: (id: string) => void;
  shouldFocus: boolean;
};

function PreferenceRow({
  pref,
  onUpdate,
  onRemove,
  shouldFocus,
}: PreferenceRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
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

export function MatchWizardDialog({
  open,
  onOpenChange,
  onGenerate,
  generating,
  hasExistingMatch,
  initialResumeId = null,
}: MatchWizardDialogProps) {
  const { enqueueToast } = useToastQueue();

  const {
    data: resumesData,
    loading: resumesLoading,
    error: resumesError,
    refetch: refetchResumes,
  } = useResumesForPickerQuery({ fetchPolicy: "cache-first", skip: !open });

  const { data: prefsData, loading: prefsLoading } = useWorkPreferencesQuery({
    fetchPolicy: "cache-and-network",
    skip: !open,
  });
  const [updatePreferences] = useUpdateWorkPreferencesMutation();

  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [localItems, setLocalItems] = useState<LocalPreference[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [prefsDirty, setPrefsDirty] = useState(false);

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevPrefsData, setPrevPrefsData] = useState<typeof prefsData | null>(
    null,
  );

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelectedResumeId(initialResumeId ?? "");
      setFocusedId(null);
      setPrefsDirty(false);
      setPrevPrefsData(null);
    } else {
      setLocalItems([]);
      setSelectedResumeId("");
      setFocusedId(null);
      setPrefsDirty(false);
      setPrevPrefsData(null);
    }
  }

  if (open && prefsData !== prevPrefsData && prefsData?.workPreferences) {
    setPrevPrefsData(prefsData);
    setLocalItems(toLocal(prefsData.workPreferences));
  }

  const resumeOptions = useMemo(() => {
    return (
      resumesData?.resumes?.map((r) => ({ label: r.title, value: r.id })) ?? []
    );
  }, [resumesData]);

  const resumes = resumesData?.resumes;
  const isLoadingResumes = open && !resumes && resumesLoading;

  const effectiveResumeId = useMemo(() => {
    const optionIds = new Set(resumeOptions.map((option) => option.value));
    if (selectedResumeId && optionIds.has(selectedResumeId)) {
      return selectedResumeId;
    }
    if (initialResumeId && optionIds.has(initialResumeId)) {
      return initialResumeId;
    }
    return resumeOptions[0]?.value ?? "";
  }, [selectedResumeId, initialResumeId, resumeOptions]);

  function addPreference() {
    const newId = nextPrefId();
    setLocalItems((prev) => [
      ...prev,
      { id: newId, text: "", weight: Weight.Low },
    ]);
    setFocusedId(newId);
    setPrefsDirty(true);
  }

  function updatePreference(
    id: string,
    patch: Partial<Pick<LocalPreference, "text" | "weight">>,
  ) {
    setLocalItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
    setPrefsDirty(true);
  }

  function removePreference(id: string) {
    setLocalItems((prev) => prev.filter((p) => p.id !== id));
    setPrefsDirty(true);
  }

  async function handleGenerate() {
    if (!effectiveResumeId) {
      enqueueToast({ title: "Please select a resume first.", intent: "error" });
      return;
    }

    if (prefsDirty) {
      const items: PreferenceInput[] = localItems
        .filter((p) => p.text.trim().length > 0)
        .map((p) => ({ text: p.text.trim(), weight: p.weight }));

      const [prefErr] = await tryRun(
        updatePreferences({
          variables: { items },
          refetchQueries: ["WorkPreferences"],
        }),
      );
      if (prefErr) {
        enqueueToast({ title: "Failed to save preferences.", intent: "error" });
        return;
      }
      enqueueToast({ title: "Preferences saved.", intent: "success" });
    }

    await onGenerate(effectiveResumeId);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        hasExistingMatch
          ? "Regenerate match analysis"
          : "Generate match analysis"
      }
      description="Choose a resume and update your preferences before generating."
      size="lg"
      childrenClassName="overflow-auto"
      footer={
        <div className={cn("flex items-center justify-between gap-2")}>
          <div className={cn("flex items-center gap-2")}>
            {prefsDirty && (
              <Text size="xs" color="muted">
                Unsaved preferences
              </Text>
            )}
          </div>
          <div className={cn("flex items-center gap-2")}>
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
              onClick={() => void handleGenerate()}
              state={generating ? "loading" : "default"}
              disabled={!effectiveResumeId}
            >
              {hasExistingMatch ? "Regenerate" : "Generate"}
            </Button>
          </div>
        </div>
      }
    >
      <Tabs defaultValue="resume" className={cn("flex flex-col gap-4")}>
        <TabsList>
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="preferences">
            <BriefcaseIcon
              size={14}
              weight="regular"
              className={cn("mr-1.5")}
            />
            Work Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className={cn("flex flex-col gap-2")}>
          <Text size="sm" color="muted">
            Choose the resume to evaluate against this job description. You can
            manage your resumes{" "}
            <Link asChild>
              <NextLink href="/profile/resumes">here</NextLink>
            </Link>
            .
          </Text>
          {isLoadingResumes ? (
            <Text size="sm" color="muted">
              Loading resumes...
            </Text>
          ) : resumesError ? (
            <div className={cn("flex flex-col gap-2")}>
              <Text size="sm" color="error">
                Failed to load resumes.
              </Text>
              <Button
                intent="secondary"
                size="md"
                className={cn("self-start")}
                onClick={() => void refetchResumes()}
              >
                Retry
              </Button>
            </div>
          ) : resumeOptions.length === 0 ? (
            <Text size="sm" color="muted">
              No resumes yet. Create one before generating a match analysis.
            </Text>
          ) : (
            <Select
              value={effectiveResumeId || undefined}
              onValueChange={(v) => setSelectedResumeId(v)}
              placeholder="Select a resume"
              options={resumeOptions}
            />
          )}
        </TabsContent>

        <TabsContent value="preferences" className={cn("flex flex-col gap-2")}>
          <div className={cn("mb-2")}>
            <Text size="sm" color="muted">
              What matters to you in a job? These preferences are used to
              evaluate match against job descriptions.
            </Text>
          </div>
          {prefsLoading ? (
            <Text size="sm" color="muted">
              Loading preferences...
            </Text>
          ) : (
            <>
              <PreferencesEditor
                preferences={localItems}
                onUpdate={updatePreference}
                onRemove={removePreference}
                focusedId={focusedId}
              />
              <Button
                intent="secondary"
                size="md"
                className={cn("mt-2 self-start")}
                onClick={addPreference}
                disabled={localItems.some((p) => p.text.trim().length === 0)}
              >
                <PlusIcon size={14} weight="bold" className={cn("mr-1.5")} />
                Add preference
              </Button>
            </>
          )}
        </TabsContent>
      </Tabs>
    </Dialog>
  );
}
