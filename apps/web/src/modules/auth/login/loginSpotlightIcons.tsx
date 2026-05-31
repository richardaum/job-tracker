import { cn } from "@job-tracker/ui";
import type { IconWeight } from "@phosphor-icons/react";
import {
  BriefcaseIcon,
  ChartLineUpIcon,
  ClipboardTextIcon,
  FoldersIcon,
  PulseIcon,
  RssSimpleIcon,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";

import type { LoginSpotlightIconKey } from "@/modules/auth/login/mockLoginSpotlightTiles";

const MAP: Record<
  LoginSpotlightIconKey,
  ComponentType<{ className?: string; weight?: IconWeight }>
> = {
  briefcase: BriefcaseIcon,
  chartLineUp: ChartLineUpIcon,
  clipboardText: ClipboardTextIcon,
  pulse: PulseIcon,
  folders: FoldersIcon,
  rss: RssSimpleIcon,
};

/** Icon chip for spotlight tiles on the dark glass shell (invert-facing). */

type LoginSpotlightGlyphProps = {
  icon: LoginSpotlightIconKey;
  className?: string;
  variant?: "tile" | "hero";
};

export function LoginSpotlightGlyph({
  icon,
  className,
  variant = "tile",
}: LoginSpotlightGlyphProps) {
  const Cmp = MAP[icon];
  const isHero = variant === "hero";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md border border-text-inverted/22",
        "bg-bg-surface/22",
        isHero ? "size-19 rounded-lg sm:size-21" : "size-11",
        className,
      )}
      aria-hidden
    >
      <Cmp
        className={cn(
          "text-text-inverted",
          isHero ? "size-11 sm:size-12" : "size-5",
        )}
        weight="duotone"
      />
    </span>
  );
}
