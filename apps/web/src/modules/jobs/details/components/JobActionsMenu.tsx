"use client";

import { Button, cn, DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@job-tracker/ui";
import {
  ArrowsOutIcon,
  CaretDownIcon,
  CheckIcon,
  SidebarSimpleIcon,
  SparkleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useCallback, useState } from "react";

import { CopyJobMdMenuItem } from "@/modules/jobs/details/components/CopyJobMdMenuItem";
import { ExportJobMdMenuItem } from "@/modules/jobs/details/components/ExportJobMdMenuItem";
import { JobActionsMenuItems } from "@/modules/jobs/details/job-details-header.slots";
import type { JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";

interface JobActionsMenuProps {
  job: JobDetailsValues;
  fillButtonState: "default" | "loading";
  triggerFillAutomatically: () => Promise<{ error: Error | null }>;
  onDelete: () => void;
  fullWidth?: boolean;
  onToggleFullWidth?: () => void;
  readOnly?: boolean;
}

export function JobActionsMenu({
  job,
  fillButtonState,
  triggerFillAutomatically,
  onDelete,
  fullWidth,
  onToggleFullWidth,
  readOnly = false,
}: JobActionsMenuProps) {
  const { enqueueToast } = useToastQueue();
  const [open, setOpen] = useState(false);

  const handleFillAutomatically = useCallback(async () => {
    const { error } = await triggerFillAutomatically();
    if (error) {
      enqueueToast({
        title:
          error instanceof Error
            ? error.message.replace("Bad Request Exception: ", "")
            : "Failed to start automatic fill.",
        intent: "error",
      });
      return;
    }
    enqueueToast({ title: "Automatic fill queued.", intent: "success" });
  }, [enqueueToast, triggerFillAutomatically]);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          intent="secondary"
          size="md"
          rightIcon={
            <CaretDownIcon
              size={12}
              weight="bold"
              className={cn("transition-transform duration-200", open ? "rotate-180" : "rotate-0")}
            />
          }
        >
          Actions
        </Button>
      }
      align="end"
    >
      <JobActionsMenuItems.Slot />
      {!readOnly ? (
        <>
          <DropdownMenuItem
            disabled={fillButtonState === "loading"}
            onSelect={() => void handleFillAutomatically()}
            icon={<SparkleIcon size={14} weight="regular" />}
          >
            Fill job fields automatically
          </DropdownMenuItem>
        </>
      ) : null}
      <ExportJobMdMenuItem jobId={job.id} job={job} />
      <CopyJobMdMenuItem jobId={job.id} job={job} />
      {onToggleFullWidth && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>View</DropdownMenuLabel>
          <DropdownMenuItem
            icon={<SidebarSimpleIcon size={14} weight="regular" className={cn("-scale-x-100")} />}
            onSelect={() => fullWidth && onToggleFullWidth()}
          >
            <span className={cn("flex items-center gap-2 flex-1")}>
              <span className={cn(!fullWidth ? "font-medium" : "")}>Side panel</span>
              {!fullWidth && <CheckIcon size={14} weight="bold" className={cn("ml-auto")} />}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            icon={<ArrowsOutIcon size={14} weight="regular" />}
            onSelect={() => !fullWidth && onToggleFullWidth()}
          >
            <span className={cn("flex items-center gap-2 flex-1")}>
              <span className={cn(fullWidth ? "font-medium" : "")}>Full width</span>
              {fullWidth && <CheckIcon size={14} weight="bold" className={cn("ml-auto")} />}
            </span>
          </DropdownMenuItem>
        </>
      )}
      {!readOnly ? (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onSelect={() => onDelete()} icon={<TrashIcon size={14} weight="regular" />}>
            Remove
          </DropdownMenuItem>
        </>
      ) : null}
    </DropdownMenu>
  );
}
