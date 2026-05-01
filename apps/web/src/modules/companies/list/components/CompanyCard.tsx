"use client";

import { Card, cn, IconButton, Text } from "@job-tracker/ui";
import {
  ArrowSquareOutIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

import { TipTapContent } from "@/modules/applications/shared/components/TipTapContent";

import { DeleteCompanyDialog } from "./DeleteCompanyDialog";

export interface CompanyCardData {
  id: string;
  name: string;
  description: string | null;
}

interface CompanyCardProps {
  company: CompanyCardData;
  onEdit: (company: CompanyCardData) => void;
  onViewJobs: (companyName: string) => void;
  onOpenDetails?: (companyId: string) => void;
  isRecentlyVisited?: boolean;
  onRecentlyVisitedAnimationEnd?: () => void;
  onDeleteSuccess?: (message: string) => void;
  onDeleteError?: (message: string) => void;
}

export function CompanyCard({
  company,
  onEdit,
  onViewJobs,
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
      <Card padding="sm">
        <div className={cn("min-w-0 space-y-2")}>
          <div className={cn("flex items-start gap-1")}>
            <div className={cn("min-w-0")}>
              <Link
                href={`/companies/${encodeURIComponent(company.id)}`}
                onClick={() => onOpenDetails?.(company.id)}
                className={cn(
                  "text-text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2",
                )}
              >
                <Text
                  size="base"
                  weight="semibold"
                  className={cn("wrap-break-word")}
                >
                  {company.name}
                </Text>
              </Link>
            </div>
            <div className={cn("flex shrink-0 items-center")}>
              <IconButton
                intent="ghost"
                size="sm"
                label={`View jobs from ${company.name}`}
                tooltip="View jobs"
                className={cn(
                  "h-6 w-6 text-text-muted/80 hover:text-text-muted",
                )}
                icon={<ArrowSquareOutIcon size={13} weight="regular" />}
                onClick={() => onViewJobs(company.name)}
              />
              <IconButton
                intent="ghost"
                size="sm"
                label={`Edit ${company.name}`}
                tooltip="Edit"
                className={cn(
                  "h-6 w-6 text-text-muted/80 hover:text-text-muted",
                )}
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
                    className={cn(
                      "h-6 w-6 text-text-muted/80 hover:text-text-muted",
                    )}
                    icon={<TrashIcon size={13} weight="regular" />}
                  />
                }
                companyId={company.id}
                companyName={company.name}
                onSuccess={onDeleteSuccess}
                onError={onDeleteError}
              />
            </div>
          </div>
          {company.description ? (
            <TipTapContent
              content={company.description}
              className={cn("text-text-secondary")}
            />
          ) : (
            <Text size="sm" color="muted" className={cn("italic")}>
              No description available.
            </Text>
          )}
        </div>
      </Card>
    </div>
  );
}
