import { cn } from "@job-tracker/ui";

import { LoginSpotlightGlyphOnLight } from "@/modules/auth/login/loginSpotlightIcons";
import type { LoginSpotlightIconKey } from "@/modules/auth/login/mockLoginSpotlightTiles";

type LoginV2SideTileProps = { icon: LoginSpotlightIconKey; title: string; className?: string };

/** Small decorative callout placed around the LoginV2 card — title only, no body copy. */
export function LoginV2SideTile({ icon, title, className }: LoginV2SideTileProps) {
  return (
    <div
      className={cn(
        "flex w-48 items-center gap-3 rounded-2xl border border-border-default bg-bg-surface p-4 shadow-sm",
        className,
      )}
    >
      <LoginSpotlightGlyphOnLight icon={icon} />
      <p className={cn("text-sm font-medium text-text-primary")}>{title}</p>
    </div>
  );
}
