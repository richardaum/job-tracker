import { cn } from "@job-tracker/ui";

type LoginV2SideTileProps = { title: string; className?: string };

/** Small decorative callout placed around the LoginV2 card — title only, no body copy. */
export function LoginV2SideTile({ title, className }: LoginV2SideTileProps) {
  return (
    <div
      className={cn(
        "flex w-48 items-center justify-center rounded-2xl border border-border-default bg-bg-brand-subtle p-4 text-center shadow-sm",
        className,
      )}
    >
      <p className={cn("text-sm font-medium text-text-primary")}>{title}</p>
    </div>
  );
}
