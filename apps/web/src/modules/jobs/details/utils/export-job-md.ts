function formatStageName(stage: string): string {
  return stage.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatSalary(
  salary: { minCents: number | null; maxCents: number | null; currency: string | null; period: string | null } | null,
): string {
  if (!salary) return "N/A";
  const { minCents, maxCents, currency, period } = salary;
  if (minCents == null && maxCents == null) return "N/A";

  const fmt = (cents: number) => {
    const amount = cents / 100;
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const range =
    minCents != null && maxCents != null
      ? `${fmt(minCents)} - ${fmt(maxCents)}`
      : minCents != null
        ? `From ${fmt(minCents)}`
        : `Up to ${fmt(maxCents!)}`;

  const extras = [period ? `/ ${period.toLowerCase()}` : "", currency ? `(${currency})` : ""].filter(Boolean).join(" ");
  return extras ? `${range} ${extras}` : range;
}

export function slugifyFileName(
  title: string | null | undefined,
  company: string | null | undefined,
  id: string,
): string {
  const parts = [title?.trim(), company?.trim()].filter(Boolean);
  if (parts.length > 0) {
    const slug = parts
      .join("-")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-");
    return slug.length > 0 ? `${slug}.md` : `job-${id}.md`;
  }
  return `job-${id}.md`;
}

export interface JobData {
  id: string;
  title: string | null;
  company: { name: string } | null;
  description: string | null;
  urls: string[];
  source: string | null;
  tags: string[];
  location: string | null;
  workRegion: string | null;
  summary: string | null;
  htmlContent: string | null;
  currentStage: string;
  currentStageAt: string;
  createdAt: string;
  salary: { minCents: number | null; maxCents: number | null; currency: string | null; period: string | null } | null;
  match: {
    scoreRatio: number | null;
    classification: string | null;
    matchCount: number;
    gapCount: number;
    unclearCount: number;
  } | null;
}

export interface NoteData {
  id: string;
  content: string;
  createdAt: string;
}

export interface StageEventData {
  id: string;
  fromStage: string | null;
  toStage: string;
  createdAt: string;
  reason: string | null;
}

export interface ExportJobData {
  job: JobData;
  notes: NoteData[];
  stageEvents: StageEventData[];
}

export function formatJobAsMarkdown(data: ExportJobData): string {
  const { job, notes, stageEvents } = data;
  const lines: string[] = [];

  lines.push(`# ${job.title?.trim() || "Untitled"}`);
  lines.push("");

  const meta: string[] = [];
  meta.push(`**Company**: ${job.company?.name?.trim() || "N/A"}`);
  meta.push(`**Location**: ${job.location?.trim() || "N/A"}`);
  if (job.workRegion?.trim()) {
    meta.push(`**Work Region**: ${job.workRegion.trim()}`);
  }
  meta.push(`**Stage**: ${formatStageName(job.currentStage)}`);
  if (job.urls.length > 0) {
    meta.push(`**URL**: ${job.urls.join(", ")}`);
  }
  meta.push(`**Salary**: ${formatSalary(job.salary)}`);
  meta.push(`**Tags**: ${job.tags.length > 0 ? job.tags.join(", ") : "N/A"}`);
  meta.push(`**Created**: ${formatDate(job.createdAt)}`);
  if (job.source) {
    meta.push(`**Source**: ${job.source}`);
  }
  lines.push(meta.join("\n"));
  lines.push("");

  if (job.summary?.trim()) {
    lines.push("## Summary");
    lines.push("");
    lines.push(job.summary.trim());
    lines.push("");
  }

  if (job.description?.trim()) {
    lines.push("## Description");
    lines.push("");
    lines.push(job.description.trim());
    lines.push("");
  }

  if (job.htmlContent?.trim()) {
    lines.push("## Source Content");
    lines.push("");
    lines.push(job.htmlContent.trim());
    lines.push("");
  }

  if (notes.length > 0) {
    lines.push("## Notes");
    lines.push("");
    for (const note of notes) {
      lines.push(`### ${formatDateTime(note.createdAt)}`);
      lines.push("");
      lines.push(note.content);
      lines.push("");
    }
  }

  if (stageEvents.length > 0) {
    lines.push("## Stage History");
    lines.push("");
    for (const event of stageEvents) {
      const from = event.fromStage ? formatStageName(event.fromStage) : "—";
      const to = formatStageName(event.toStage);
      lines.push(`- **${formatDateTime(event.createdAt)}** — ${from} → ${to}`);
      if (event.reason?.trim()) {
        lines.push(`  - *Reason*: ${event.reason.trim()}`);
      }
    }
    lines.push("");
  }

  if (job.match) {
    lines.push("## Match Analysis");
    lines.push("");
    lines.push(`- **Score**: ${job.match.scoreRatio != null ? `${job.match.scoreRatio}%` : "N/A"}`);
    lines.push(`- **Classification**: ${job.match.classification || "N/A"}`);
    lines.push(`- **Matching items**: ${job.match.matchCount}`);
    lines.push(`- **Gaps**: ${job.match.gapCount}`);
    lines.push(`- **Unclear**: ${job.match.unclearCount}`);
    lines.push("");
  }

  return lines.join("\n").trim() + "\n";
}

export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
