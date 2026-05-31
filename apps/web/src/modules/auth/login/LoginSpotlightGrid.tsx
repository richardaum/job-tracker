"use client";

import { cn } from "@job-tracker/ui";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { LoginSpotlightGlyph } from "@/modules/auth/login/loginSpotlightIcons";
import {
  LOGIN_SPOTLIGHT_NAV_TAGS,
  LOGIN_SPOTLIGHT_TILES,
  type LoginSpotlightTile,
} from "@/modules/auth/login/mockLoginSpotlightTiles";

/** Frosted tiles sit on the dark login shell — typography uses inverted ramp (`text-text-inverted` / opacity), not shell-facing `text-text-*` (yale / neutral-500). */

function MosaicCardShell({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col gap-2 overflow-hidden rounded-xl border border-border-default/35",
        "bg-bg-surface/18 backdrop-blur-2xl backdrop-saturate-150",
        "p-3 shadow-lg sm:gap-3 sm:p-4 lg:gap-4 lg:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function renderTile(tile: LoginSpotlightTile) {
  const outer = cn("min-h-0", tile.layoutClassName);

  if (tile.kind === "card") {
    return (
      <MosaicCardShell key={tile.id} className={outer}>
        <div className={cn("flex min-w-0 flex-col items-start gap-2")}>
          <LoginSpotlightGlyph icon={tile.icon} />
          <p className={cn("text-sm font-semibold tracking-tight text-text-inverted")}>
            {tile.title}
          </p>
          <p className={cn("line-clamp-3 text-xs/snug text-text-inverted/80 sm:line-clamp-4")}>
            {tile.body}
          </p>
        </div>
      </MosaicCardShell>
    );
  }

  if (tile.kind === "wide") {
    return (
      <MosaicCardShell key={tile.id} className={outer}>
        <div
          className={cn("flex min-h-0 flex-1 flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4")}
        >
          <div className={cn("flex min-h-0 flex-1 flex-col items-start gap-2 sm:max-w-[55%]")}>
            <LoginSpotlightGlyph icon={tile.icon} />
            <p className={cn("text-base font-semibold text-text-inverted sm:text-lg")}>
              {tile.title}
            </p>
            <p className={cn("line-clamp-3 text-xs/relaxed text-text-inverted/80 sm:line-clamp-4")}>
              {tile.body}
            </p>
          </div>
          <div
            aria-hidden
            className={cn(
              "flex min-h-30 min-w-0 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-border-subtle p-5  sm:min-h-0 sm:w-[42%] sm:px-6",
              "bg-bg-brand-strong shadow-inner",
            )}
          >
            <LoginSpotlightGlyph icon={tile.icon} variant="hero" />
            <span
              className={cn(
                "text-center text-[0.6875rem] font-semibold uppercase tracking-wider text-text-inverted/90",
              )}
            >
              {tile.accentSideLabel}
            </span>
          </div>
        </div>
      </MosaicCardShell>
    );
  }

  return (
    <MosaicCardShell key={tile.id} className={cn(outer, "min-h-0")}>
      <div className={cn("grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-3 sm:gap-4")}>
        <div className={cn("flex min-h-0 min-w-0 flex-col items-start gap-2")}>
          <LoginSpotlightGlyph icon={tile.icon} />
          <p className={cn("text-sm font-semibold tracking-tight text-text-inverted")}>
            {tile.title}
          </p>
          <p className={cn("line-clamp-2 text-xs text-text-inverted/75 sm:line-clamp-3")}>
            {tile.body}
          </p>
        </div>
        <div
          aria-hidden
          className={cn(
            "min-h-26 w-full overflow-hidden rounded-lg border border-border-default sm:min-h-0",
            "bg-linear-to-br from-bg-field via-bg-shell to-bg-info-subtle bg-cover bg-center",
          )}
        />
        {tile.imageCaption ? (
          <p className={cn("text-[0.6875rem] text-text-inverted/70")}>{tile.imageCaption}</p>
        ) : null}
      </div>
    </MosaicCardShell>
  );
}

export function LoginSpotlightGrid({ className }: { className?: string }) {
  return (
    <section
      aria-label="Job Tracker highlights"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-3 overflow-hidden text-text-inverted lg:gap-5",
        className,
      )}
    >
      <div className={cn("min-h-0 min-w-0 flex-1 overflow-hidden")}>
        <div
          className={cn(
            "grid size-full min-h-0 grid-cols-1 gap-3 grid-rows-6",
            "lg:grid-cols-12 lg:gap-4 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]",
          )}
        >
          {LOGIN_SPOTLIGHT_TILES.map((tile) => renderTile(tile))}
        </div>
      </div>

      <div
        className={cn(
          "flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-border-default/25 pt-4",
        )}
      >
        <div className={cn("flex flex-wrap items-center gap-2")}>
          {LOGIN_SPOTLIGHT_NAV_TAGS.map((tag) => (
            <span
              key={tag.id}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium",
                tag.active
                  ? "border-transparent bg-bg-brand text-text-inverted"
                  : "border-text-inverted/28 bg-bg-surface/28 text-text-inverted shadow-sm backdrop-blur-md",
              )}
            >
              {tag.label}
            </span>
          ))}
        </div>
        <div className={cn("flex items-center gap-2")}>
          <button
            type="button"
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full border border-text-inverted/28",
              "bg-bg-surface/28 text-text-inverted shadow-sm backdrop-blur-md transition-colors",
              "hover:bg-bg-surface/40",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
            )}
            aria-label="Previous highlight — decorative preview"
          >
            <CaretLeftIcon className={cn("size-4")} weight="bold" />
          </button>
          <button
            type="button"
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full border border-text-inverted/28",
              "bg-bg-surface/28 text-text-inverted shadow-sm backdrop-blur-md transition-colors",
              "hover:bg-bg-surface/40",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
            )}
            aria-label="Next highlight — decorative preview"
          >
            <CaretRightIcon className={cn("size-4")} weight="bold" />
          </button>
        </div>
      </div>
    </section>
  );
}
