"use client";

import { FileArrowDownIcon } from "@phosphor-icons/react";
import { DropdownMenuItem } from "@job-tracker/ui";
import { useState } from "react";

import { type JobQuery, useJobNotesLazyQuery, useJobStageEventsLazyQuery } from "@/gql/hooks";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";
import {
  type JobData,
  type NoteData,
  type StageEventData,
  downloadMarkdown,
  formatJobAsMarkdown,
  slugifyFileName,
} from "@/modules/jobs/details/utils/export-job-md";

export interface ExportJobMdMenuItemProps {
  jobId: string;
  job: JobQuery["job"];
}

function toJobData(job: JobQuery["job"]): JobData {
  return {
    id: job.id,
    title: job.title ?? null,
    company: job.company ? { name: job.company.name } : null,
    description: job.description ?? null,
    urls: job.urls,
    source: job.source ?? null,
    tags: job.tags,
    location: job.location ?? null,
    workRegion: job.workRegion ?? null,
    summary: job.summary ?? null,
    htmlContent: job.htmlContent ?? null,
    currentStage: job.currentStage,
    currentStageAt: job.currentStageAt,
    createdAt: job.createdAt,
    salary: job.salary
      ? {
          minCents: job.salary.minCents ?? null,
          maxCents: job.salary.maxCents ?? null,
          currency: job.salary.currency ?? null,
          period: job.salary.period ?? null,
        }
      : null,
    match: job.match
      ? {
          scoreRatio: job.match.scoreRatio ?? null,
          classification: job.match.classification ?? null,
          matchCount: job.match.matchCount,
          gapCount: job.match.gapCount,
          unclearCount: job.match.unclearCount,
        }
      : null,
  };
}

export function ExportJobMdMenuItem({ jobId, job }: ExportJobMdMenuItemProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { enqueueToast } = useToastQueue();
  const [fetchNotes] = useJobNotesLazyQuery();
  const [fetchStageEvents] = useJobStageEventsLazyQuery();

  async function handleExport() {
    setIsExporting(true);
    try {
      const [notesResult, eventsResult] = await Promise.all([
        fetchNotes({ variables: { jobId } }),
        fetchStageEvents({ variables: { jobId } }),
      ]);

      const notes: NoteData[] = (notesResult.data?.jobNotes ?? []).map((note) => ({
        id: note.id,
        content: note.content,
        createdAt: note.createdAt,
      }));

      const stageEvents: StageEventData[] = (eventsResult.data?.jobStageEvents ?? []).map((event) => ({
        id: event.id,
        fromStage: event.fromStage ?? null,
        toStage: event.toStage,
        createdAt: event.createdAt,
        reason: event.reason ?? null,
      }));

      const md = formatJobAsMarkdown({ job: toJobData(job), notes, stageEvents });

      const filename = slugifyFileName(job.title, job.company?.name, jobId);
      downloadMarkdown(md, filename);
    } catch {
      enqueueToast({ title: "Failed to export job as Markdown", intent: "error" });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <DropdownMenuItem
      disabled={isExporting}
      onSelect={() => void handleExport()}
      icon={<FileArrowDownIcon size={14} weight="regular" />}
    >
      {isExporting ? "Exporting..." : "Export as Markdown"}
    </DropdownMenuItem>
  );
}
