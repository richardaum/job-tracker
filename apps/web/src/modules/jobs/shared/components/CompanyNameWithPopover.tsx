"use client";

import { cn, FieldWithLabelAction, IconButton, Popover, Text, useDialog } from "@job-tracker/ui";
import { ArrowSquareOutIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

import { CompanyEditDialog, type CompanyEditDialogJob } from "@/modules/companies/shared/components/CompanyEditDialog";

import { TipTapContent } from "./TipTapContent";

interface CompanyNameWithPopoverProps {
  job: CompanyEditDialogJob;
  className?: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function CompanyNameWithPopover({ job, className, onSuccess, onError }: CompanyNameWithPopoverProps) {
  const router = useRouter();
  const editCompany = useDialog();
  const company = job.company;
  const name = company?.name?.trim() ?? "";
  if (!company || !name) {
    return null;
  }

  const description = company.description;
  const hasDescription = Boolean(description);

  return (
    <Popover
      enabled={true}
      align="start"
      trigger={
        <Text
          as="p"
          size="sm"
          color="secondary"
          className={cn(
            "cursor-pointer decoration-text-muted/50 decoration-dotted underline-offset-4 hover:underline",
            className,
          )}
        >
          {name}
        </Text>
      }
    >
      <div className={cn("group max-w-xs p-1")}>
        <div className={cn("mb-2 flex items-center gap-1")}>
          <Text size="xs" weight="semibold" color="muted" className={cn("block uppercase tracking-wider")}>
            About the company
          </Text>
          <FieldWithLabelAction.IconActionButton
            label={hasDescription ? "Edit description" : "Add description"}
            icon={<PencilSimpleIcon size={14} weight="regular" />}
            onClick={(e) => {
              e.stopPropagation();
              editCompany.open();
            }}
            className={cn("size-6 opacity-100")}
          />
          <IconButton
            intent="ghost"
            size="sm"
            label={`Open ${name} details`}
            tooltip="Open details"
            icon={<ArrowSquareOutIcon size={14} weight="regular" />}
            className={cn("size-6 opacity-100")}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/companies/${encodeURIComponent(company.id)}`);
            }}
          />
        </div>
        {hasDescription ? (
          <TipTapContent content={description} className={cn("text-xs/relaxed text-text-secondary")} />
        ) : (
          <Text size="xs" color="muted" className={cn("italic")}>
            No description available.
          </Text>
        )}
      </div>
      <CompanyEditDialog control={editCompany} job={job} onSuccess={onSuccess} onError={onError} />
    </Popover>
  );
}
