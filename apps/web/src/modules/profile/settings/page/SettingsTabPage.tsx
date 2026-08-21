"use client";

import { Button, cn, Input, Text } from "@job-tracker/ui";
import { useState } from "react";

import type { UpdateSettingsMutation } from "@/gql/graphql";
import { useSettingsQuery, useUpdateSettingsMutation } from "@/gql/hooks";
import { SettingCard, SettingCardLabel } from "@/modules/profile/settings/components/SettingCard";

type SettingsValues = NonNullable<NonNullable<ReturnType<typeof useSettingsQuery>["data"]>["settings"]>;

function buildOptimisticSettings(
  settings: SettingsValues,
  duplicateWindowDays: number,
): UpdateSettingsMutation["updateSettings"] {
  return {
    __typename: "UserSetting",
    id: settings.id,
    autoFillEnabled: settings.autoFillEnabled,
    autoSummaryEnabled: settings.autoSummaryEnabled,
    autoMatchEnabled: settings.autoMatchEnabled,
    aiEnabled: settings.aiEnabled,
    hasOpenAiKey: settings.hasOpenAiKey,
    duplicateWindowDays,
    trialCallsUsed: settings.trialCallsUsed,
    trialCallsLimit: settings.trialCallsLimit,
    lastQuickTipId: settings.lastQuickTipId,
    dismissedQuickTipIds: settings.dismissedQuickTipIds,
    blockedKeywords: null,
    blockedCompanies: null,
  };
}

export default function SettingsTabPage() {
  const { data, loading } = useSettingsQuery({ fetchPolicy: "cache-first" });
  const [updateSettings] = useUpdateSettingsMutation();
  const settings = data?.settings ?? null;
  const [draftDays, setDraftDays] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (loading && !settings) return <Text>Loading...</Text>;
  if (!settings) return null;

  const displayedDays = draftDays ?? settings.duplicateWindowDays;
  const isDirty = displayedDays !== settings.duplicateWindowDays;

  const handleDaysChange = (value: number) => {
    const clamped = Math.min(365, Math.max(1, value));
    setDraftDays(clamped === settings.duplicateWindowDays ? null : clamped);
  };

  const handleDaysSave = () => {
    if (!isDirty || isSaving) return;
    setIsSaving(true);
    void updateSettings({
      variables: { input: { duplicateWindowDays: displayedDays } },
      optimisticResponse: { updateSettings: buildOptimisticSettings(settings, displayedDays) },
    }).finally(() => {
      setDraftDays(null);
      setIsSaving(false);
    });
  };

  return (
    <div className={cn("flex flex-col gap-3")}>
      <SettingCard
        label={<SettingCardLabel>Duplicate detection window</SettingCardLabel>}
        description="Time range in days for detecting duplicate applications"
        pending={isSaving}
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
              disabled={isSaving}
              value={displayedDays}
              onChange={(event) => handleDaysChange(Number(event.target.value))}
            />
            <Button type="submit" size="sm" state={isSaving ? "loading" : "default"} disabled={!isDirty || isSaving}>
              Save
            </Button>
          </form>
        }
      />
    </div>
  );
}
