"use client";

import { Button, cn, Input, Switch, Text, Tooltip } from "@job-tracker/ui";
import { LockIcon, SparkleIcon } from "@phosphor-icons/react";
import { useState } from "react";

import type { UpdateSettingsMutation } from "@/gql/graphql";
import {
  useRemoveOpenAiKeyMutation,
  useSaveOpenAiKeyMutation,
  useSettingsQuery,
  useUpdateSettingsMutation,
} from "@/gql/hooks";
import { SettingCard, SettingCardLabel } from "@/modules/profile/settings/components/SettingCard";

type SettingsToggleField = "autoFillEnabled" | "autoSummaryEnabled" | "autoMatchEnabled" | "aiEnabled";
type PendingSettingField = SettingsToggleField | "duplicateWindowDays" | "openaiKey" | "removeKey";

type SettingsValues = NonNullable<NonNullable<ReturnType<typeof useSettingsQuery>["data"]>["settings"]>;

function buildOptimisticSettings(
  settings: SettingsValues,
  input: Partial<
    Pick<
      SettingsValues,
      "autoFillEnabled" | "autoSummaryEnabled" | "autoMatchEnabled" | "duplicateWindowDays" | "aiEnabled"
    >
  >,
): UpdateSettingsMutation["updateSettings"] {
  return {
    __typename: "UserSetting",
    id: settings.id,
    autoFillEnabled: input.autoFillEnabled ?? settings.autoFillEnabled,
    autoSummaryEnabled: input.autoSummaryEnabled ?? settings.autoSummaryEnabled,
    autoMatchEnabled: input.autoMatchEnabled ?? settings.autoMatchEnabled,
    aiEnabled: input.aiEnabled ?? settings.aiEnabled,
    hasOpenAiKey: settings.hasOpenAiKey,
    duplicateWindowDays: input.duplicateWindowDays ?? settings.duplicateWindowDays,
    trialCallsUsed: settings.trialCallsUsed,
    trialCallsLimit: settings.trialCallsLimit,
    blockedKeywords: null,
    blockedCompanies: null,
  };
}

export default function SettingsTabPage() {
  const { data, loading } = useSettingsQuery({ fetchPolicy: "cache-first" });
  const [updateSettings] = useUpdateSettingsMutation();
  const [saveOpenAiKey] = useSaveOpenAiKeyMutation();
  const [removeOpenAiKey] = useRemoveOpenAiKeyMutation();
  const settings = data?.settings ?? null;

  const [draftDays, setDraftDays] = useState<number | null>(null);
  const [draftOpenAiKey, setDraftOpenAiKey] = useState<string | null>(null);
  const [openAiKeyError, setOpenAiKeyError] = useState<string | null>(null);
  const [pendingField, setPendingField] = useState<PendingSettingField | null>(null);

  if (loading && !settings) {
    return <Text>Loading...</Text>;
  }

  if (!settings) return null;

  const aiSettingsDisabled = !settings.aiEnabled;

  const displayedDays = draftDays ?? settings.duplicateWindowDays;
  const isDaysDirty = displayedDays !== settings.duplicateWindowDays;
  const isDaysSaving = pendingField === "duplicateWindowDays";

  const persistSetting = async (
    input: Partial<
      Pick<SettingsValues, "autoFillEnabled" | "autoSummaryEnabled" | "autoMatchEnabled" | "duplicateWindowDays">
    >,
    field: PendingSettingField,
  ) => {
    setPendingField(field);
    try {
      await updateSettings({
        variables: { input },
        optimisticResponse: { updateSettings: buildOptimisticSettings(settings, input) },
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

  const displayedOpenAiKey = draftOpenAiKey ?? "";
  const isOpenAiKeyDirty = displayedOpenAiKey.length > 0;
  const isOpenAiKeySaving = pendingField === "openaiKey";
  const isOpenAiKeyRemoving = pendingField === "removeKey";

  const handleOpenAiKeyChange = (value: string) => {
    setDraftOpenAiKey(value);
    setOpenAiKeyError(null);
  };

  const handleOpenAiKeySave = () => {
    if (!isOpenAiKeyDirty || isOpenAiKeySaving) return;
    setPendingField("openaiKey");
    void saveOpenAiKey({ variables: { key: displayedOpenAiKey } })
      .then(() => {
        setDraftOpenAiKey(null);
        setOpenAiKeyError(null);
      })
      .catch((error) => {
        const graphqlError = error?.graphQLErrors?.[0];
        if (graphqlError?.extensions?.code === "AI_KEY_INVALID") {
          setOpenAiKeyError(graphqlError.message || "The key is invalid or could not be verified.");
        } else {
          setOpenAiKeyError("Failed to save key. Please try again.");
        }
      })
      .finally(() => {
        setPendingField((current) => (current === "openaiKey" ? null : current));
      });
  };

  const handleOpenAiKeyRemove = () => {
    if (isOpenAiKeyRemoving) return;
    setPendingField("removeKey");
    void removeOpenAiKey()
      .catch(() => {
        setOpenAiKeyError("Failed to remove key. Please try again.");
      })
      .finally(() => {
        setPendingField((current) => (current === "removeKey" ? null : current));
      });
  };

  return (
    <div className={cn("flex flex-col gap-3")}>
      <SettingCard
        label={
          <SettingCardLabel icon={<SparkleIcon size={14} weight="regular" aria-hidden />}>AI-enabled</SettingCardLabel>
        }
        description="Enable or disable AI features for your account"
        pending={pendingField === "aiEnabled"}
        control={
          <Switch
            checked={settings.aiEnabled}
            disabled={pendingField === "aiEnabled"}
            onCheckedChange={(checked) => handleToggle("aiEnabled", checked)}
          />
        }
      />
      <SettingCard
        label={
          <SettingCardLabel icon={<SparkleIcon size={14} weight="regular" aria-hidden />}>
            Auto-fill job fields
          </SettingCardLabel>
        }
        description="Fill job fields automatically when creating a draft from pasted content"
        pending={pendingField === "autoFillEnabled"}
        disabled={aiSettingsDisabled}
        control={
          <Switch
            checked={settings.autoFillEnabled}
            disabled={pendingField === "autoFillEnabled" || aiSettingsDisabled}
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
        disabled={aiSettingsDisabled}
        control={
          <Switch
            checked={settings.autoSummaryEnabled}
            disabled={pendingField === "autoSummaryEnabled" || aiSettingsDisabled}
            onCheckedChange={(checked) => handleToggle("autoSummaryEnabled", checked)}
          />
        }
      />
      <SettingCard
        label={
          <SettingCardLabel icon={<SparkleIcon size={14} weight="regular" aria-hidden />}>Auto-match</SettingCardLabel>
        }
        description="Run match analysis automatically when a job is created"
        pending={pendingField === "autoMatchEnabled"}
        disabled={aiSettingsDisabled}
        control={
          <Switch
            checked={settings.autoMatchEnabled}
            disabled={pendingField === "autoMatchEnabled" || aiSettingsDisabled}
            onCheckedChange={(checked) => handleToggle("autoMatchEnabled", checked)}
          />
        }
      />
      <SettingCard
        label={
          <SettingCardLabel icon={<SparkleIcon size={14} weight="regular" aria-hidden />}>
            OpenAI API key
          </SettingCardLabel>
        }
        description="Add your own OpenAI key to use AI features beyond the free trial"
        pending={pendingField === "openaiKey" || pendingField === "removeKey"}
        disabled={aiSettingsDisabled}
        control={
          <div className={cn("flex flex-col gap-2 w-full")}>
            <form
              aria-label="OpenAI API key"
              className={cn("flex items-center gap-2")}
              onSubmit={(event) => {
                event.preventDefault();
                handleOpenAiKeySave();
              }}
            >
              {!settings.hasOpenAiKey && (
                <Input
                  type="password"
                  size="sm"
                  className={cn("flex-1", openAiKeyError && "border-red-500")}
                  placeholder="sk-..."
                  disabled={isOpenAiKeySaving || isOpenAiKeyRemoving || aiSettingsDisabled}
                  value={displayedOpenAiKey}
                  onChange={(e) => handleOpenAiKeyChange(e.target.value)}
                />
              )}
              {settings.hasOpenAiKey && (
                <Tooltip content="Stored encrypted, used only for your own requests">
                  <LockIcon
                    size={18}
                    className={cn("shrink-0 text-gray-500")}
                    weight="bold"
                    role="img"
                    aria-label="Encrypted"
                  />
                </Tooltip>
              )}
              {settings.hasOpenAiKey ? (
                <Button
                  type="button"
                  size="sm"
                  state={isOpenAiKeyRemoving ? "loading" : "default"}
                  disabled={isOpenAiKeySaving || isOpenAiKeyRemoving || aiSettingsDisabled}
                  onClick={handleOpenAiKeyRemove}
                >
                  Remove
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="sm"
                  state={isOpenAiKeySaving ? "loading" : "default"}
                  disabled={!isOpenAiKeyDirty || isOpenAiKeySaving || aiSettingsDisabled}
                >
                  Save
                </Button>
              )}
            </form>
            {openAiKeyError && (
              <Text size="sm" color="error">
                {openAiKeyError}
              </Text>
            )}
          </div>
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
