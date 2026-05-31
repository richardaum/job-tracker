"use client";

import { cn, IconButton, ListItemCard } from "@job-tracker/ui";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";

import { Weight } from "@/gql/hooks";
import { DeletePreferenceDialog } from "@/modules/work-preferences/components/DeletePreferenceDialog";
import {
  PreferenceWeightBadge,
  PreferenceWeightDropdown,
} from "@/modules/work-preferences/components/PreferenceWeightDropdown";
import { type LocalPreference } from "@/modules/work-preferences/model/work-preference.model";

interface PreferenceCardProps {
  preference: LocalPreference;
  readOnly?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onWeightChange?: (id: string, weight: Weight) => void;
}

export function PreferenceCard({
  preference,
  readOnly = false,
  onEdit,
  onDelete,
  onWeightChange,
}: PreferenceCardProps) {
  const title = readOnly ? (
    <ListItemCard.Title>{preference.text}</ListItemCard.Title>
  ) : (
    <ListItemCard.Title asChild>
      <button type="button" onClick={() => onEdit?.(preference.id)} className={cn("text-left")}>
        {preference.text}
      </button>
    </ListItemCard.Title>
  );

  const actions = (
    <ListItemCard.Actions>
      {readOnly ? (
        <PreferenceWeightBadge value={preference.weight} />
      ) : (
        <PreferenceWeightDropdown
          value={preference.weight}
          onChange={(weight) => onWeightChange?.(preference.id, weight)}
          variant="badge"
        />
      )}
      {!readOnly ? (
        <>
          <IconButton
            intent="ghost"
            size="sm"
            label={`Edit preference "${preference.text}"`}
            tooltip="Edit preference"
            className={cn(ListItemCard.actionIconButtonClassName)}
            icon={<PencilSimpleIcon size={13} weight="regular" />}
            onClick={() => onEdit?.(preference.id)}
          />
          <DeletePreferenceDialog
            preferenceText={preference.text}
            onConfirm={() => onDelete?.(preference.id)}
            trigger={
              <IconButton
                intent="ghost"
                size="sm"
                label={`Delete preference "${preference.text}"`}
                tooltip="Delete preference"
                className={cn(ListItemCard.actionIconButtonClassName, "hover:text-text-error")}
                icon={<TrashIcon size={13} weight="regular" />}
              />
            }
          />
        </>
      ) : null}
    </ListItemCard.Actions>
  );

  return <ListItemCard title={title} actions={actions} />;
}
