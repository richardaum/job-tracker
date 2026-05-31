"use client";

import { cn, IconButton, ListItemCard, Text } from "@job-tracker/ui";
import { ArrowSquareOutIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

import { TipTapContent } from "@/modules/jobs/shared/components/TipTapContent";

import { DeleteCompanyDialog } from "./DeleteCompanyDialog";

interface CompanyCardData {
  id: string;
  name: string;
  description: string | null;
}

interface CompanyCardProps {
  company: CompanyCardData;
  onEdit: (company: CompanyCardData) => void;
  onOpenDetails?: (companyId: string) => void;
  isRecentlyVisited?: boolean;
  onRecentlyVisitedAnimationEnd?: () => void;
  onDeleteSuccess?: (message: string) => void;
  onDeleteError?: (message: string) => void;
}

export function CompanyCard({
  company,
  onEdit,
  onOpenDetails,
  isRecentlyVisited,
  onRecentlyVisitedAnimationEnd,
  onDeleteSuccess,
  onDeleteError,
}: CompanyCardProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  return (
    <div
      className={cn(
        "rounded-lg",
        isRecentlyVisited
          ? "ring-2 ring-border-brand/80 shadow-[0_0_0_8px_rgba(59,130,246,0.12)] animate-[pulse_1.2s_ease-out_2]"
          : "",
        isFadingOut
          ? "ring-2 ring-border-brand/80 shadow-[0_0_0_8px_rgba(59,130,246,0.12)] opacity-0 transition-[opacity,box-shadow] duration-500 ease-out"
          : "",
      )}
      onAnimationEnd={() => {
        if (isRecentlyVisited) {
          setIsFadingOut(true);
        }
      }}
      onTransitionEnd={(event) => {
        if (!isFadingOut) return;
        if (event.propertyName !== "opacity") return;

        setIsFadingOut(false);
        onRecentlyVisitedAnimationEnd?.();
      }}
    >
      <ListItemCard
        title={
          <ListItemCard.Title asChild className={cn("inline-block max-w-full font-semibold focus-visible:ring-inset")}>
            <Link href={`/companies/${encodeURIComponent(company.id)}`} onClick={() => onOpenDetails?.(company.id)}>
              <Text as="span" size="base" weight="semibold" className={cn("wrap-break-word")}>
                {company.name}
              </Text>
            </Link>
          </ListItemCard.Title>
        }
        actions={
          <ListItemCard.Actions>
            <IconButton
              asChild
              intent="ghost"
              size="sm"
              label={`View jobs from ${company.name}`}
              tooltip="View jobs"
              className={cn(ListItemCard.actionIconButtonClassName)}
            >
              <Link href={`/jobs?q=all&company=${encodeURIComponent(company.name)}`}>
                <ArrowSquareOutIcon size={13} weight="regular" />
              </Link>
            </IconButton>
            <IconButton
              intent="ghost"
              size="sm"
              label={`Edit ${company.name}`}
              tooltip="Edit"
              className={cn(ListItemCard.actionIconButtonClassName)}
              icon={<PencilSimpleIcon size={13} weight="regular" />}
              onClick={() => onEdit(company)}
            />
            <DeleteCompanyDialog
              trigger={
                <IconButton
                  intent="ghost"
                  size="sm"
                  label={`Delete ${company.name}`}
                  tooltip="Delete"
                  className={cn(ListItemCard.actionIconButtonClassName)}
                  icon={<TrashIcon size={13} weight="regular" />}
                />
              }
              companyId={company.id}
              companyName={company.name}
              onSuccess={onDeleteSuccess}
              onError={onDeleteError}
            />
          </ListItemCard.Actions>
        }
        description={
          company.description ? (
            <TipTapContent content={company.description} className={cn("text-text-secondary")} />
          ) : (
            <Text size="sm" color="muted" className={cn("italic")}>
              No description available.
            </Text>
          )
        }
      />
    </div>
  );
}
