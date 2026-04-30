"use client";

import {
  ArrowSquareOutIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Card, IconButton, Text, cn } from "@job-tracker/ui";
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
  onDeleteSuccess?: (message: string) => void;
  onDeleteError?: (message: string) => void;
}

export function CompanyCard({
  company,
  onEdit,
  onViewJobs,
  onDeleteSuccess,
  onDeleteError,
}: CompanyCardProps) {
  return (
    <Card padding="sm">
      <div className={cn("min-w-0 space-y-2")}>
        <div className={cn("flex items-start gap-1")}>
          <div className={cn("min-w-0")}>
            <Text
              size="base"
              weight="semibold"
              className={cn("wrap-break-word")}
            >
              {company.name}
            </Text>
          </div>
          <div className={cn("flex shrink-0 items-center")}>
            <IconButton
              intent="ghost"
              size="sm"
              label={`View jobs from ${company.name}`}
              tooltip="View jobs"
              className={cn("h-6 w-6 text-text-muted/80 hover:text-text-muted")}
              icon={<ArrowSquareOutIcon size={13} weight="regular" />}
              onClick={() => onViewJobs(company.name)}
            />
            <IconButton
              intent="ghost"
              size="sm"
              label={`Edit ${company.name}`}
              tooltip="Edit"
              className={cn("h-6 w-6 text-text-muted/80 hover:text-text-muted")}
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
  );
}
