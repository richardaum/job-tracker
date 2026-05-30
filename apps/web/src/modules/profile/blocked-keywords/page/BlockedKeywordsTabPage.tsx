"use client";

import { Button, Tabs, TabsList, TabsTrigger } from "@job-tracker/ui";
import { BuildingsIcon, FileTextIcon, ListIcon, PlusIcon, TextTIcon } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import type { KeywordScope, MatchMode, UpdateSettingsMutation } from "@/gql/graphql";
import { useSettingsQuery, useUpdateSettingsMutation } from "@/gql/hooks";
import { ProfileHeaderActions, ProfileSubTabs } from "@/modules/profile/layout/profile-header.slots";
import type { BlockedKeywordItem } from "@/modules/profile/settings/components/BlockedKeywordSection";
import {
  BlockedKeywordItemDialog,
  BlockedKeywordSection,
} from "@/modules/profile/settings/components/BlockedKeywordSection";

const SCOPE_TABS = [
  { value: "all", label: "All", icon: <ListIcon size={14} weight="regular" /> },
  { value: "title", label: "Title", icon: <TextTIcon size={14} weight="regular" /> },
  { value: "company", label: "Company", icon: <BuildingsIcon size={14} weight="regular" /> },
  { value: "description", label: "Description", icon: <FileTextIcon size={14} weight="regular" /> },
] as const;

type SettingsValues = NonNullable<
  NonNullable<ReturnType<typeof useSettingsQuery>["data"]>["settings"]
>;

function buildOptimisticSettings(
  settings: SettingsValues,
  input: {
    blockedKeywords?: BlockedKeywordItem[];
    blockedCompanies?: string[];
  },
): UpdateSettingsMutation["updateSettings"] {
  return {
    __typename: "UserSetting",
    id: settings.id,
    autoFillEnabled: settings.autoFillEnabled,
    autoSummaryEnabled: settings.autoSummaryEnabled,
    autoMatchEnabled: settings.autoMatchEnabled,
    duplicateWindowDays: settings.duplicateWindowDays,
    blockedKeywords: input.blockedKeywords ?? settings.blockedKeywords ?? null,
    blockedCompanies: input.blockedCompanies ?? settings.blockedCompanies ?? null,
  };
}

function mergeItems(
  keywords: BlockedKeywordItem[],
  companies: string[],
): BlockedKeywordItem[] {
  return [
    ...keywords,
    ...companies.map((c) => ({
      keyword: c,
      scope: "COMPANY" as KeywordScope,
      matchMode: "EXACT" as MatchMode,
    })),
  ];
}

function splitItems(items: BlockedKeywordItem[]): {
  keywords: BlockedKeywordItem[];
  companies: string[];
} {
  return {
    keywords: items.filter((i) => i.scope !== "COMPANY"),
    companies: items
      .filter((i) => i.scope === "COMPANY")
      .map((i) => i.keyword),
  };
}

function filterItems(items: BlockedKeywordItem[], scope: string): BlockedKeywordItem[] {
  if (scope === "all") return items;
  return items.filter((i) => i.scope.toLowerCase() === scope);
}

export default function BlockedKeywordsTabPage() {
  const { data, loading } = useSettingsQuery({ fetchPolicy: "cache-first" });
  const [updateSettings] = useUpdateSettingsMutation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const settings = data?.settings ?? null;
  const currentScope = searchParams.get("scope") ?? "all";

  const [editingItem, setEditingItem] = useState<BlockedKeywordItem | null>(null);

  if (loading && !settings) {
    return null;
  }

  if (!settings) return null;

  const items = mergeItems(
    (settings.blockedKeywords ?? []) as BlockedKeywordItem[],
    (settings.blockedCompanies ?? []) as string[],
  );

  const filteredItems = filterItems(items, currentScope);

  const handleSave = async (updatedItems: BlockedKeywordItem[]) => {
    const { keywords: newKeywords, companies: newCompanies } = splitItems(updatedItems);
    await updateSettings({
      variables: { input: { blockedKeywords: newKeywords, blockedCompanies: newCompanies } },
      optimisticResponse: {
        updateSettings: buildOptimisticSettings(settings, {
          blockedKeywords: newKeywords,
          blockedCompanies: newCompanies,
        }),
      },
    });
  };

  const handleSaveItem = (saved: BlockedKeywordItem) => {
    if (!editingItem) return;
    const idx = items.findIndex(
      (i) => i.keyword === editingItem.keyword && i.scope === editingItem.scope && i.matchMode === editingItem.matchMode,
    );
    const next = idx >= 0 ? items.map((i, n) => (n === idx ? saved : i)) : [...items, saved];
    void handleSave(next);
  };

  const handleDelete = (index: number) => {
    const globalIndex = items.findIndex(
      (i) => i === filteredItems[index],
    );
    if (globalIndex < 0) return;
    void handleSave(items.filter((_, i) => i !== globalIndex));
  };

  const setScope = (scope: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (scope === "all") {
      params.delete("scope");
    } else {
      params.set("scope", scope);
    }
    const qs = params.toString();
    router.replace(qs ? `/profile/blocked-keywords?${qs}` : "/profile/blocked-keywords");
  };

  return (
    <>
      <ProfileHeaderActions>
        <Button
          size="md"
          intent="primary"
          onClick={() => setEditingItem({ keyword: "", scope: "TITLE" as KeywordScope, matchMode: "PARTIAL" as MatchMode })}
        >
          <PlusIcon size={14} weight="bold" />
          Add blocked item
        </Button>
      </ProfileHeaderActions>
      <ProfileSubTabs>
        <Tabs value={currentScope} onValueChange={setScope}>
          <TabsList>
            {SCOPE_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} leadingIcon={tab.icon}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </ProfileSubTabs>
      <BlockedKeywordSection
        items={filteredItems}
        onAdd={() => setEditingItem({ keyword: "", scope: "TITLE" as KeywordScope, matchMode: "PARTIAL" as MatchMode })}
        onEdit={(item) => setEditingItem({ ...item })}
        onDelete={handleDelete}
      />
      <BlockedKeywordItemDialog
        editing={editingItem}
        onSave={handleSaveItem}
        onOpenChange={(open) => {
          if (!open) setEditingItem(null);
        }}
      />
    </>
  );
}
