import { cn, Link, Tooltip, TabsTrigger } from "@job-tracker/ui";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import NextLink from "next/link";

import { jobDetailsNotesFocusPath } from "@/modules/jobs/details/utils/job-details-routes";

type NotesSideTabTriggerProps = { jobId: string };

export function NotesSideTabTrigger({ jobId }: NotesSideTabTriggerProps) {
  return (
    <TabsTrigger value="notes" className={cn("flex-1 group flex items-center justify-center gap-1.5")}>
      <span>Notes</span>
      <Tooltip content="Open full page">
        <Link
          variant="muted"
          asChild
          className={cn(
            "opacity-0 transition-opacity group-hover:opacity-100 data-[state=active]:opacity-100 no-underline hover:no-underline",
          )}
        >
          <NextLink href={jobDetailsNotesFocusPath(jobId)} aria-label="Open full page">
            <ArrowSquareOutIcon size={14} weight="regular" />
          </NextLink>
        </Link>
      </Tooltip>
    </TabsTrigger>
  );
}
