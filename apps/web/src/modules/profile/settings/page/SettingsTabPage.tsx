"use client";

import { cn, Input, Switch, Text } from "@job-tracker/ui";
import { useRef, useState } from "react";

import { useSettingsQuery, useUpdateSettingsMutation } from "@/gql/hooks";

export default function SettingsTabPage() {
  const { data, loading } = useSettingsQuery();
  const [updateSettings] = useUpdateSettingsMutation();
  const settings = data?.settings ?? null;

  const [localDays, setLocalDays] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (loading && !settings) {
    return <Text>Loading...</Text>;
  }

  if (!settings) return null;

  const handleToggle = (
    field: "autoFillEnabled" | "autoSummaryEnabled",
    value: boolean,
  ) => {
    updateSettings({ variables: { input: { [field]: value } } });
  };

  const handleDaysChange = (value: number) => {
    const clamped = Math.min(365, Math.max(1, value));
    setLocalDays(clamped);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateSettings({
        variables: { input: { duplicateWindowDays: clamped } },
      });
    }, 500);
  };

  return (
    <div className={cn("flex flex-col gap-3")}>
      <SettingCard
        label="Auto-fill"
        description="Pre-fill application fields when converting from draft"
        control={
          <Switch
            checked={settings.autoFillEnabled}
            onCheckedChange={(checked) =>
              handleToggle("autoFillEnabled", checked)
            }
          />
        }
      />
      <SettingCard
        label="Auto-summary"
        description="Generate summaries automatically when job fields change"
        control={
          <Switch
            checked={settings.autoSummaryEnabled}
            onCheckedChange={(checked) =>
              handleToggle("autoSummaryEnabled", checked)
            }
          />
        }
      />
      <SettingCard
        label="Duplicate detection window"
        description="Time range in days for detecting duplicate applications"
        control={
          <Input
            type="number"
            size="sm"
            className={cn("w-24")}
            min={1}
            max={365}
            value={localDays ?? settings.duplicateWindowDays}
            onChange={(e) => handleDaysChange(Number(e.target.value))}
          />
        }
      />
    </div>
  );
}

function SettingCard({
  label,
  description,
  control,
}: {
  label: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg border border-border-subtle p-4",
      )}
    >
      <div className={cn("flex flex-col gap-0.5")}>
        <Text size="sm" weight="medium">
          {label}
        </Text>
        <Text size="xs" color="muted">
          {description}
        </Text>
      </div>
      <div className={cn("shrink-0")}>{control}</div>
    </div>
  );
}
