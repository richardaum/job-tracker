"use client";

import { cn, IconButton, Popover, Text } from "@job-tracker/ui";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import React from "react";

import { FieldEditTriggerButton } from "@/modules/applications/details/components/FieldEditTriggerButton";
import {
  CompanyEditDialog,
  type CompanyEditDialogApplication,
} from "@/modules/companies/shared/components/CompanyEditDialog";

import { TipTapContent } from "./TipTapContent";

interface CompanyNameWithPopoverProps {
  application: CompanyEditDialogApplication;
  className?: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function CompanyNameWithPopover({
  application,
  className,
  onSuccess,
  onError,
}: CompanyNameWithPopoverProps) {
  const router = useRouter();
  const [editCompanyOpen, setEditCompanyOpen] = React.useState(false);
  const name = application.company.name;
  const description = application.company.description;
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
          <Text
            size="xs"
            weight="semibold"
            color="muted"
            className={cn("block uppercase tracking-wider")}
          >
            About the company
          </Text>
          <FieldEditTriggerButton
            label={hasDescription ? "Edit description" : "Add description"}
            onClick={(e) => {
              e.stopPropagation();
              setEditCompanyOpen(true);
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
              router.push(
                `/companies/${encodeURIComponent(application.company.id)}`,
              );
            }}
          />
        </div>
        {hasDescription ? (
          <TipTapContent
            content={description}
            className={cn("text-xs/relaxed text-text-secondary")}
          />
        ) : (
          <Text size="xs" color="muted" className={cn("italic")}>
            No description available.
          </Text>
        )}
      </div>
      <CompanyEditDialog
        open={editCompanyOpen}
        onOpenChange={setEditCompanyOpen}
        application={application}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Popover>
  );
}
