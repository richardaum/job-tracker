"use client";

import { Button, cn, Input, Spinner, Switch, Text } from "@job-tracker/ui";
import { useEffect, useState } from "react";

import type { UpdateSettingsMutation } from "@/gql/graphql";
import { useSettingsQuery, useUpdateSettingsMutation } from "@/gql/hooks";

type SettingsToggleField = "autoFillEnabled" | "autoSummaryEnabled";
type PendingSettingField = SettingsToggleField | "duplicateWindowDays";

type SettingsValues = NonNullable<
  NonNullable<ReturnType<typeof useSettingsQuery>["data"]>["settings"]
>;

const SAVING_SPINNER_DELAY_MS = 300;

function useDelayedTrue(value: boolean, delayMs: number): boolean {
  const [showDelayed, setShowDelayed] = useState(false);

  useEffect(() => {
    if (!value) {
      return;
    }

    const timer = window.setTimeout(() => setShowDelayed(true), delayMs);
    return () => {
      window.clearTimeout(timer);
      setShowDelayed(false);
    };
  }, [value, delayMs]);

  return value && showDelayed;
}

function buildOptimisticSettings(
  settings: SettingsValues,
  input: Partial<
    Pick<
      SettingsValues,
      "autoFillEnabled" | "autoSummaryEnabled" | "duplicateWindowDays"
    >
  >,
): UpdateSettingsMutation["updateSettings"] {
  return {
    __typename: "UserSetting",
    userId: settings.userId,
    autoFillEnabled: input.autoFillEnabled ?? settings.autoFillEnabled,
    autoSummaryEnabled: input.autoSummaryEnabled ?? settings.autoSummaryEnabled,
    duplicateWindowDays:
      input.duplicateWindowDays ?? settings.duplicateWindowDays,
  };
}

export default function SettingsTabPage() {
  const { data, loading } = useSettingsQuery();
  const [updateSettings] = useUpdateSettingsMutation();
  const settings = data?.settings ?? null;

  const [draftDays, setDraftDays] = useState<number | null>(null);
  const [pendingField, setPendingField] = useState<PendingSettingField | null>(
    null,
  );

  if (loading && !settings) {
    return <Text>Loading...</Text>;
  }

  if (!settings) return null;

  const displayedDays = draftDays ?? settings.duplicateWindowDays;
  const isDaysDirty = displayedDays !== settings.duplicateWindowDays;
  const isDaysSaving = pendingField === "duplicateWindowDays";

  const persistSetting = async (
    input: Partial<
      Pick<
        SettingsValues,
        "autoFillEnabled" | "autoSummaryEnabled" | "duplicateWindowDays"
      >
    >,
    field: PendingSettingField,
  ) => {
    setPendingField(field);
    try {
      await updateSettings({
        variables: { input },
        optimisticResponse: {
          updateSettings: buildOptimisticSettings(settings, input),
        },
      });
    } finally {
      setPendingField((current) => (current === field ? null : current));
      if (field === "duplicateWindowDays") {
        setDraftDays(null);
      }
    }
  };

  const handleToggle = (field: SettingsToggleField, value: boolean) => {
    void persistSetting({ [field]: value }, field);
  };

  const handleDaysChange = (value: number) => {
    const clamped = Math.min(365, Math.max(1, value));
    setDraftDays(clamped === settings.duplicateWindowDays ? null : clamped);
  };

  const handleDaysSave = () => {
    if (!isDaysDirty || isDaysSaving) return;
    void persistSetting(
      { duplicateWindowDays: displayedDays },
      "duplicateWindowDays",
    );
  };

  return (
    <div className={cn("flex flex-col gap-3")}>
      <SettingCard
        label="Auto-fill"
        description="Pre-fill application fields when converting from draft"
        pending={pendingField === "autoFillEnabled"}
        control={
          <Switch
            checked={settings.autoFillEnabled}
            disabled={pendingField === "autoFillEnabled"}
            onCheckedChange={(checked) =>
              handleToggle("autoFillEnabled", checked)
            }
          />
        }
      />
      <SettingCard
        label="Auto-summary"
        description="Generate summaries automatically when job fields change"
        pending={pendingField === "autoSummaryEnabled"}
        control={
          <Switch
            checked={settings.autoSummaryEnabled}
            disabled={pendingField === "autoSummaryEnabled"}
            onCheckedChange={(checked) =>
              handleToggle("autoSummaryEnabled", checked)
            }
          />
        }
      />
      <SettingCard
        label="Duplicate detection window"
        description="Time range in days for detecting duplicate applications"
        pending={pendingField === "duplicateWindowDays"}
        control={
          <form
            aria-label="Duplicate detection window"
            className={cn("flex items-center gap-2")}
            onSubmit={(event) => {
              event.preventDefault();
              handleDaysSave();
            }}
          >
            <Input
              type="number"
              size="sm"
              className={cn("w-24")}
              min={1}
              max={365}
              disabled={isDaysSaving}
              value={displayedDays}
              onChange={(e) => handleDaysChange(Number(e.target.value))}
            />
            <Button
              type="submit"
              size="sm"
              state={isDaysSaving ? "loading" : "default"}
              disabled={!isDaysDirty || isDaysSaving}
            >
              Save
            </Button>
          </form>
        }
      />
    </div>
  );
}

function SettingCard({
  label,
  description,
  control,
  pending = false,
}: {
  label: string;
  description: string;
  control: React.ReactNode;
  pending?: boolean;
}) {
  const showSpinner = useDelayedTrue(pending, SAVING_SPINNER_DELAY_MS);

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border border-border-subtle p-4",
      )}
    >
      <div className={cn("flex flex-col gap-0.5")}>
        <div className={cn("flex items-center gap-2")}>
          <Text size="base" weight="medium">
            {label}
          </Text>
          {showSpinner ? <Spinner size="sm" label="Saving setting" /> : null}
        </div>
        <Text size="sm" color="muted">
          {description}
        </Text>
      </div>
      <div className={cn("shrink-0")}>{control}</div>
    </div>
  );
}
