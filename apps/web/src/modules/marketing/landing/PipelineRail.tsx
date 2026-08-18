import { Badge, cn } from "@job-tracker/ui";
import { ClockIcon, CurrencyDollarIcon, LinkIcon, SparkleIcon } from "@phosphor-icons/react";

type Stage = { name: string; content: React.ReactNode };

const stages: Stage[] = [
  {
    name: "Draft",
    content: (
      <>
        <span className={cn("flex items-center gap-1.5 font-mono text-[11px] break-all text-text-muted")}>
          <LinkIcon className={cn("size-3 shrink-0")} aria-hidden />
          nimbusorbital.io/eng
        </span>
        <span
          className={cn(
            "mt-auto flex w-fit items-center gap-1 rounded-md bg-bg-brand px-2 py-1 text-[11px] font-semibold text-text-inverted",
          )}
        >
          <SparkleIcon className={cn("size-3")} aria-hidden />
          Generate draft
        </span>
      </>
    ),
  },
  {
    name: "New",
    content: (
      <>
        <p className={cn("text-sm/tight font-semibold text-text-primary")}>Senior Product Engineer</p>
        <p className={cn("text-xs text-text-secondary")}>Nimbus Orbital Labs</p>
        <Badge intent="default" className={cn("mt-auto w-fit")}>
          Ready to review
        </Badge>
      </>
    ),
  },
  {
    name: "Applied",
    content: (
      <>
        <p className={cn("text-sm/tight font-semibold text-text-primary")}>Senior Product Engineer</p>
        <p className={cn("text-xs text-text-secondary")}>Nimbus Orbital Labs</p>
        <span
          className={cn(
            "mt-auto flex w-fit items-center gap-1.5 rounded-md bg-bg-field px-2 py-1.5 text-[11px] text-text-secondary",
          )}
        >
          <ClockIcon className={cn("size-3 shrink-0 text-text-brand")} aria-hidden />
          Follow up in 3 days
        </span>
      </>
    ),
  },
  {
    name: "Recruiter Screen",
    content: (
      <>
        <p className={cn("text-sm/tight font-semibold text-text-primary")}>Recruiter call</p>
        <p className={cn("text-xs text-text-secondary")}>30 min · scheduled</p>
        <div className={cn("mt-auto flex flex-wrap gap-1")}>
          <Badge intent="success">Fit</Badge>
          <Badge intent="warning">Unclear</Badge>
        </div>
      </>
    ),
  },
  {
    name: "Technical",
    content: (
      <>
        <Badge intent="success" className={cn("w-fit")}>
          Strong match · 82%
        </Badge>
        <div className={cn("mt-auto flex flex-wrap gap-1")}>
          <Badge intent="success">React</Badge>
          <Badge intent="success">TypeScript</Badge>
          <Badge intent="error">Telemetry</Badge>
        </div>
      </>
    ),
  },
  {
    name: "Offer",
    content: (
      <>
        <span className={cn("flex items-center gap-1 font-mono text-[11px] whitespace-nowrap text-text-muted")}>
          <CurrencyDollarIcon className={cn("size-3 shrink-0")} aria-hidden />
          compare offers
        </span>
        <div className={cn("flex items-center gap-2 font-mono text-sm tabular-nums")}>
          <span className={cn("font-bold text-(--primitive-color-green-700)")}>$142k</span>
          <span className={cn("text-[10px] text-text-muted")}>vs</span>
          <span className={cn("text-text-secondary")}>$126k</span>
        </div>
        <Badge intent="success" className={cn("mt-auto w-fit")}>
          Best offer
        </Badge>
      </>
    ),
  },
];

/**
 * The hero's signature element: the real pipeline stage order (Draft → New → Applied →
 * Recruiter Screen → Technical → Offer) carrying one fictional job through it, so
 * structure encodes an actual sequence rather than decorating one.
 */
export function PipelineRail() {
  return (
    <div>
      <p className={cn("mb-5 text-xs font-medium tracking-wide text-text-muted uppercase")}>
        The pipeline, stage by stage
      </p>
      <div className={cn("-mx-6 overflow-x-auto px-6 pb-2 sm:-mx-8 sm:px-8")}>
        <ol
          className={cn(
            "relative flex min-w-max gap-3",
            "before:absolute before:top-[9px] before:inset-x-20 before:h-px before:bg-border-default",
          )}
        >
          {stages.map((stage) => (
            <li key={stage.name} className={cn("relative flex w-40 shrink-0 flex-col items-center pt-8")}>
              <span
                aria-hidden
                className={cn(
                  "absolute top-0 left-1/2 flex size-5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-border-brand bg-bg-surface",
                )}
              >
                <span className={cn("size-2 rounded-full bg-bg-brand")} />
              </span>
              <p className={cn("mb-3 text-[11px] font-medium tracking-wide text-text-secondary uppercase")}>
                {stage.name}
              </p>
              <div
                className={cn(
                  "flex min-h-44 w-full flex-col gap-2.5 rounded-xl border border-border-default bg-bg-surface p-4 shadow-md",
                )}
              >
                {stage.content}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
