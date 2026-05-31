"use client";

import { Button, cn, Input, Switch, Text } from "@job-tracker/ui";
import { SparkleIcon } from "@phosphor-icons/react";
import { useState } from "react";

import type { UpdateSettingsMutation } from "@/gql/graphql";
import { useSettingsQuery, useUpdateSettingsMutation } from "@/gql/hooks";
import { SettingCard, SettingCardLabel } from "@/modules/profile/settings/components/SettingCard";

type SettingsToggleField = "autoFillEnabled" | "autoSummaryEnabled" | "autoMatchEnabled";
type PendingSettingField = SettingsToggleField | "duplicateWindowDays";

type SettingsValues = NonNullable<
  NonNullable<ReturnType<typeof useSettingsQuery>["data"]>["settings"]
>;

function buildOptimisticSettings(
  settings: SettingsValues,
  input: Partial<
    Pick<
      SettingsValues,
      "autoFillEnabled" | "autoSummaryEnabled" | "autoMatchEnabled" | "duplicateWindowDays"
    >
  >,
): UpdateSettingsMutation["updateSettings"] {
  return {
    __typename: "UserSetting",
    id: settings.id,
    autoFillEnabled: input.autoFillEnabled ?? settings.autoFillEnabled,
    autoSummaryEnabled: input.autoSummaryEnabled ?? settings.autoSummaryEnabled,
    autoMatchEnabled: input.autoMatchEnabled ?? settings.autoMatchEnabled,
    duplicateWindowDays: input.duplicateWindowDays ?? settings.duplicateWindowDays,
    blockedKeywords: null,
    blockedCompanies: null,
  };
}

export default function SettingsTabPage() {
  const { data, loading } = useSettingsQuery({ fetchPolicy: "cache-first" });
  const [updateSettings] = useUpdateSettingsMutation();
  const settings = data?.settings ?? null;

  const [draftDays, setDraftDays] = useState<number | null>(null);
  const [pendingField, setPendingField] = useState<PendingSettingField | null>(null);

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
        "autoFillEnabled" | "autoSummaryEnabled" | "autoMatchEnabled" | "duplicateWindowDays"
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
    void persistSetting({ duplicateWindowDays: displayedDays }, "duplicateWindowDays");
  };

  return (
    <div className={cn("flex flex-col gap-3")}>
      <SettingCard
        label={
          <SettingCardLabel icon={<SparkleIcon size={14} weight="regular" aria-hidden />}>
            Auto-fill job fields
          </SettingCardLabel>
        }
        description="Fill job fields automatically when creating a draft from pasted content"
        pending={pendingField === "autoFillEnabled"}
        control={
          <Switch
            checked={settings.autoFillEnabled}
            disabled={pendingField === "autoFillEnabled"}
            onCheckedChange={(checked) => handleToggle("autoFillEnabled", checked)}
          />
        }
      />
      <SettingCard
        label={
          <SettingCardLabel icon={<SparkleIcon size={14} weight="regular" aria-hidden />}>
            Auto-summary
          </SettingCardLabel>
        }
        description="Generate summaries automatically when job fields change"
        pending={pendingField === "autoSummaryEnabled"}
        control={
          <Switch
            checked={settings.autoSummaryEnabled}
            disabled={pendingField === "autoSummaryEnabled"}
            onCheckedChange={(checked) => handleToggle("autoSummaryEnabled", checked)}
          />
        }
      />
      <SettingCard
        label={
          <SettingCardLabel icon={<SparkleIcon size={14} weight="regular" aria-hidden />}>
            Auto-match
          </SettingCardLabel>
        }
        description="Run match analysis automatically when a job is created"
        pending={pendingField === "autoMatchEnabled"}
        control={
          <Switch
            checked={settings.autoMatchEnabled}
            disabled={pendingField === "autoMatchEnabled"}
            onCheckedChange={(checked) => handleToggle("autoMatchEnabled", checked)}
          />
        }
      />
      <SettingCard
        label={<SettingCardLabel>Duplicate detection window</SettingCardLabel>}
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
