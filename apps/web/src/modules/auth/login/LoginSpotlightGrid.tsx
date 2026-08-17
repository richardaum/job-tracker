"use client";

import { cn } from "@job-tracker/ui";
import Image from "next/image";
import type { ReactNode } from "react";

import { LoginSpotlightGlyph } from "@/modules/auth/login/loginSpotlightIcons";
import { LOGIN_SPOTLIGHT_TILES, type LoginSpotlightTile } from "@/modules/auth/login/mockLoginSpotlightTiles";

/** Frosted tiles sit on the dark login shell — typography uses inverted ramp (`text-text-inverted` / opacity), not shell-facing `text-text-*` (yale / neutral-500). */

type MosaicCardShellProps = { className?: string; children: ReactNode };
function MosaicCardShell({ className, children }: MosaicCardShellProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col gap-2 rounded-xl border border-border-default/35",
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
  const outer = tile.layoutClassName;

  if (tile.kind === "card") {
    return (
      <MosaicCardShell key={tile.id} className={outer}>
        <div className={cn("flex min-w-0 flex-col items-start gap-2")}>
          <LoginSpotlightGlyph icon={tile.icon} />
          <p className={cn("text-base font-semibold tracking-tight text-text-inverted")}>{tile.title}</p>
          <p className={cn("text-sm/snug text-text-inverted/80")}>{tile.body}</p>
        </div>
      </MosaicCardShell>
    );
  }

  if (tile.kind === "wide") {
    return (
      <MosaicCardShell key={tile.id} className={outer}>
        <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4")}>
          <div className={cn("flex flex-1 flex-col items-start gap-2 sm:max-w-[55%]")}>
            <LoginSpotlightGlyph icon={tile.icon} />
            <p className={cn("text-lg font-semibold text-text-inverted sm:text-xl")}>{tile.title}</p>
            <p className={cn("text-sm/relaxed text-text-inverted/80")}>{tile.body}</p>
          </div>
          <div
            aria-hidden
            className={cn(
              "flex min-h-30 min-w-0 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-border-subtle p-5 sm:w-[42%] sm:px-6",
              "bg-bg-brand-strong shadow-inner",
            )}
          >
            <LoginSpotlightGlyph icon={tile.icon} variant="hero" />
            <span className={cn("text-center text-xs font-semibold uppercase tracking-wider text-text-inverted/90")}>
              {tile.accentSideLabel}
            </span>
          </div>
        </div>
      </MosaicCardShell>
    );
  }

  return (
    <MosaicCardShell key={tile.id} className={outer}>
      <div className={cn("flex flex-1 flex-col gap-3 sm:gap-4")}>
        <div className={cn("flex min-w-0 flex-col items-start gap-2")}>
          <LoginSpotlightGlyph icon={tile.icon} />
          <p className={cn("text-base font-semibold tracking-tight text-text-inverted")}>{tile.title}</p>
          <p className={cn("text-sm text-text-inverted/75")}>{tile.body}</p>
        </div>
        <div aria-hidden className={cn("relative min-h-24 w-full flex-1 overflow-hidden rounded-lg sm:min-h-28")}>
          <Image src={tile.imageSrc} alt="" fill sizes={tile.imageSizes} className={cn("object-cover")} />
        </div>
        {tile.imageCaption ? <p className={cn("text-xs text-text-inverted/70")}>{tile.imageCaption}</p> : null}
      </div>
    </MosaicCardShell>
  );
}

type LoginSpotlightGridProps = { className?: string };
export function LoginSpotlightGrid({ className }: LoginSpotlightGridProps) {
  return (
    <section
      aria-label="NewJobTracker highlights"
      className={cn("flex flex-col gap-3 text-text-inverted lg:gap-5", className)}
    >
      <div className={cn("min-w-0")}>
        <div className={cn("grid grid-cols-1 gap-3", "lg:grid-cols-12 lg:grid-rows-[repeat(3,auto)] lg:gap-4")}>
          {LOGIN_SPOTLIGHT_TILES.map((tile) => renderTile(tile))}
        </div>
      </div>
    </section>
  );
}
