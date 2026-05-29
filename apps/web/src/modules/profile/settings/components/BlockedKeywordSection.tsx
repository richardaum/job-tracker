"use client";

import { Badge, Button, cn, Dialog, IconButton, Input, ListItemCard, Select, Text, Tooltip } from "@job-tracker/ui";
import { BuildingsIcon, FileTextIcon, PencilSimpleIcon, PlusIcon, TextTIcon, TrashIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { KeywordScope, MatchMode } from "@/gql/graphql";

export type BlockedKeywordItem = {
  keyword: string;
  scope: KeywordScope;
  matchMode: MatchMode;
};

export type BlockedKeywordSectionProps = {
  items: BlockedKeywordItem[];
  onAdd: () => void;
  onEdit: (item: BlockedKeywordItem) => void;
  onDelete: (index: number) => void;
};

const SCOPE_CONFIG: Record<KeywordScope, { label: string; icon: React.ReactNode; badgeIntent: "info" | "warning" | "success" }> = {
  [KeywordScope.Title]: { label: "Title", icon: <TextTIcon size={14} weight="regular" />, badgeIntent: "info" },
  [KeywordScope.Description]: { label: "Description", icon: <FileTextIcon size={14} weight="regular" />, badgeIntent: "warning" },
  [KeywordScope.Company]: { label: "Company", icon: <BuildingsIcon size={14} weight="regular" />, badgeIntent: "success" },
};

const MATCH_MODE_LABELS: Record<MatchMode, string> = {
  [MatchMode.Partial]: "Partial",
  [MatchMode.Exact]: "Exact",
};

export function BlockedKeywordItemDialog({
  editing,
  onSave,
  onOpenChange,
}: {
  editing: BlockedKeywordItem | null;
  onSave: (item: BlockedKeywordItem) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const open = editing !== null;
  const [keyword, setKeyword] = useState("");
  const [scope, setScope] = useState<KeywordScope>(KeywordScope.Title);
  const [matchMode, setMatchMode] = useState<MatchMode>(MatchMode.Partial);
  const [prevOpen, setPrevOpen] = useState(false);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setKeyword(editing?.keyword ?? "");
      setScope(editing?.scope ?? KeywordScope.Title);
      setMatchMode(editing?.matchMode ?? MatchMode.Partial);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing?.keyword ? "Edit blocked item" : "Add blocked item"}
      description="Set the keyword or company name, scope, and match mode"
      footer={
        <div className={cn("flex justify-end gap-2")}>
          <Button intent="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            intent="primary"
            disabled={!keyword.trim()}
            onClick={() => {
              onSave({ keyword: keyword.trim(), scope, matchMode });
              onOpenChange(false);
            }}
          >
            {editing?.keyword ? "Save" : "Add"}
          </Button>
        </div>
      }
    >
      <div className={cn("flex flex-col gap-4 py-2")}>
        <div>
          <Text size="sm" weight="medium" className={cn("mb-1")}>
            Keyword or company name
          </Text>
          <Input
            autoFocus
            placeholder='e.g. "QA Engineer" or "Acme Corp"'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <div>
          <Text size="sm" weight="medium" className={cn("mb-1")}>
            Scope
          </Text>
          <Select
            options={[
              { label: "Title", value: KeywordScope.Title },
              { label: "Description", value: KeywordScope.Description },
              { label: "Company", value: KeywordScope.Company },
            ]}
            value={scope}
            onValueChange={(v) => setScope(v as KeywordScope)}
          />
        </div>
        <div>
          <Text size="sm" weight="medium" className={cn("mb-1")}>
            Match mode
          </Text>
          <Select
            options={[
              { label: "Partial (substring)", value: MatchMode.Partial },
              { label: "Exact (full match)", value: MatchMode.Exact },
            ]}
            value={matchMode}
            onValueChange={(v) => setMatchMode(v as MatchMode)}
          />
        </div>
      </div>
    </Dialog>
  );
}

export function BlockedKeywordSection({
  items,
  onAdd,
  onEdit,
  onDelete,
}: BlockedKeywordSectionProps) {
  return (
    <div className={cn("flex flex-col gap-4")}>
      {items.length > 0 ? (
        <div className={cn("flex flex-wrap gap-4")}>
          {items.map((item, i) => (
            <div key={`${item.keyword}|${item.scope}|${item.matchMode}|${i}`} className={cn("w-fit")}>
              <ListItemCard
                title={
                  <ListItemCard.Title className={cn("flex items-center gap-1.5 wrap-break-word")}>
                    <Tooltip content={`Scope: ${SCOPE_CONFIG[item.scope].label}`}>
                      <span className={cn("shrink-0 text-text-muted")}>{SCOPE_CONFIG[item.scope].icon}</span>
                    </Tooltip>
                    {item.keyword}
                  </ListItemCard.Title>
                }
                actions={
                  <ListItemCard.Actions>
                    <Badge intent="default">
                      {MATCH_MODE_LABELS[item.matchMode]}
                    </Badge>
                    <IconButton
                      intent="ghost"
                      size="sm"
                      label={`Edit ${item.keyword}`}
                      tooltip="Edit"
                      className={cn(ListItemCard.actionIconButtonClassName)}
                      icon={<PencilSimpleIcon size={13} weight="regular" />}
                      onClick={() => onEdit(item)}
                    />
                    <IconButton
                      intent="ghost"
                      size="sm"
                      label={`Delete ${item.keyword}`}
                      tooltip="Delete"
                      className={cn(ListItemCard.actionIconButtonClassName)}
                      icon={<TrashIcon size={13} weight="regular" />}
                      onClick={() => onDelete(i)}
                    />
                  </ListItemCard.Actions>
                }
              />
            </div>
          ))}
        </div>
      ) : (
        <div className={cn("flex flex-col items-center gap-2 py-12")}>
          <Text color="muted">No blocked items yet</Text>
          <Text size="sm" color="muted">
            Add keywords, company names, or phrases to automatically reject matching jobs
          </Text>
          <Button size="sm" onClick={onAdd}>
            <PlusIcon size={14} weight="bold" />
            Add blocked item
          </Button>
        </div>
      )}
    </div>
  );
}
