import { cn } from "@job-tracker/ui";
import type { IconWeight } from "@phosphor-icons/react";
import {
  BriefcaseIcon,
  CalculatorIcon,
  ChartLineUpIcon,
  ClipboardTextIcon,
  FunnelIcon,
  MagicWandIcon,
  TargetIcon,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";

import type { LoginSpotlightIconKey } from "@/modules/auth/login/mockLoginSpotlightTiles";

const MAP: Record<LoginSpotlightIconKey, ComponentType<{ className?: string; weight?: IconWeight }>> = {
  briefcase: BriefcaseIcon,
  chartLineUp: ChartLineUpIcon,
  clipboardText: ClipboardTextIcon,
  target: TargetIcon,
  magicWand: MagicWandIcon,
  funnel: FunnelIcon,
  calculator: CalculatorIcon,
};

/** Icon chip for spotlight tiles on the dark glass shell (invert-facing). */

type LoginSpotlightGlyphProps = { icon: LoginSpotlightIconKey; className?: string; variant?: "tile" | "hero" };

export function LoginSpotlightGlyph({ icon, className, variant = "tile" }: LoginSpotlightGlyphProps) {
  const Cmp = MAP[icon];
  const isHero = variant === "hero";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        isHero ? "size-19 sm:size-21" : "-ml-2 size-11",
        className,
      )}
      aria-hidden
    >
      <Cmp className={cn("text-text-inverted", isHero ? "size-11 sm:size-12" : "size-7")} weight="duotone" />
    </span>
  );
}

/** Icon chip for spotlight tiles on a light card background (brand-facing, not inverted). */

type LoginSpotlightGlyphOnLightProps = { icon: LoginSpotlightIconKey; className?: string };

export function LoginSpotlightGlyphOnLight({ icon, className }: LoginSpotlightGlyphOnLightProps) {
  const Cmp = MAP[icon];
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-bg-brand-subtle",
        className,
      )}
      aria-hidden
    >
      <Cmp className={cn("size-5 text-text-brand")} weight="duotone" />
    </span>
  );
}
