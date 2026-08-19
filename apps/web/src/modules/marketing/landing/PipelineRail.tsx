"use client";

import { cn } from "@job-tracker/ui";
import Image from "next/image";
import { useState } from "react";

type Stage = { id: string; name: string; imageSrc: string; alt: string };

const stages: Stage[] = [
  { id: "draft", name: "Draft", imageSrc: "/landing/stage-draft.png", alt: "Job created as a draft, ready for review" },
  { id: "new", name: "New", imageSrc: "/landing/stage-new.png", alt: "Job enriched and marked New" },
  { id: "applied", name: "Applied", imageSrc: "/landing/stage-applied.png", alt: "Job marked Applied" },
  {
    id: "recruiter-screen",
    name: "Recruiter Screen",
    imageSrc: "/landing/stage-recruiter-screen.png",
    alt: "Job at the Recruiter Screen stage",
  },
  {
    id: "technical",
    name: "Technical",
    imageSrc: "/landing/stage-technical.png",
    alt: "AI match analysis showing fit against the job requirements",
  },
  {
    id: "offer",
    name: "Offer",
    imageSrc: "/landing/stage-offer.png",
    alt: "Job with salary range set at the Offer stage",
  },
];

/**
 * The hero's signature element: one job carried through the real pipeline stages.
 * Each tab reveals the corresponding full-screen product view at its native ratio.
 */
export function PipelineRail() {
  const [activeStageId, setActiveStageId] = useState(stages[0].id);

  return (
    <div>
      <p className={cn("mb-5 text-xs font-medium tracking-wide text-text-muted uppercase")}>
        The pipeline, stage by stage
      </p>
      <div
        role="tablist"
        aria-label="Pipeline stages"
        className={cn("mb-4 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden")}
      >
        {stages.map((stage) => {
          const isActive = stage.id === activeStageId;

          return (
            <button
              key={stage.id}
              id={`pipeline-tab-${stage.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`pipeline-panel-${stage.id}`}
              onClick={() => setActiveStageId(stage.id)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-2 font-mono text-xs font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2",
                isActive
                  ? "border-bg-brand-strong bg-bg-brand-strong text-text-inverted"
                  : "border-border-default bg-bg-surface text-text-secondary hover:border-border-brand hover:text-text-primary",
              )}
            >
              {stage.name}
            </button>
          );
        })}
      </div>
      <div className={cn("overflow-hidden rounded-2xl border border-border-default bg-bg-surface shadow-md")}>
        <div
          className={cn("flex items-center gap-1.5 border-b border-border-default bg-bg-surface-hover px-3.5 py-2.5")}
        >
          <span aria-hidden className={cn("size-2 rounded-full bg-border-default")} />
          <span aria-hidden className={cn("size-2 rounded-full bg-border-default")} />
          <span aria-hidden className={cn("size-2 rounded-full bg-border-default")} />
        </div>
        <div className={cn("relative aspect-1512/806 bg-bg-surface")}>
          {stages.map((stage) => {
            const isActive = stage.id === activeStageId;

            return (
              <div
                key={stage.id}
                id={`pipeline-panel-${stage.id}`}
                role="tabpanel"
                aria-labelledby={`pipeline-tab-${stage.id}`}
                aria-hidden={!isActive}
                className={cn(
                  "absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none",
                  isActive ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                <Image
                  src={stage.imageSrc}
                  alt={isActive ? stage.alt : ""}
                  fill
                  unoptimized
                  sizes="(max-width: 1152px) calc(100vw - 48px), 1104px"
                  className={cn("object-cover object-top")}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
