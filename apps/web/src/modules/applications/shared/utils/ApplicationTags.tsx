import { IconButton, Tooltip, cn } from "@job-tracker/ui";
import { XIcon } from "@phosphor-icons/react";

function OverflowChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex rounded border border-border-subtle px-1.5 py-0.5 text-xs text-text-muted",
      )}
    >
      {children}
    </span>
  );
}

export function ApplicationTags({
  tags,
  maxTagChips,
  onRemoveTag,
  className,
}: {
  tags: string[];
  maxTagChips?: number;
  onRemoveTag?: (tag: string) => void;
  className?: string;
}) {
  const shown = maxTagChips === undefined ? tags : tags.slice(0, maxTagChips);
  const rest = Math.max(0, tags.length - shown.length);
  const hidden = maxTagChips !== undefined ? tags.slice(maxTagChips) : [];
  if (shown.length === 0 && rest === 0) return null;
  return (
    <span
      className={cn("inline-flex flex-wrap items-center gap-1.5", className)}
    >
      {shown.map((t) => (
        <span
          key={t}
          className={cn(
            "inline-flex max-w-40 items-center gap-1 rounded border border-border-subtle bg-bg-surface-hover py-0.5 text-xs text-text-secondary",
            onRemoveTag ? "pl-1.5 pr-0.5" : "px-1.5",
          )}
          title={t}
        >
          <span className="truncate">{t}</span>
          {onRemoveTag ? (
            <IconButton
              intent="ghost"
              icon={<XIcon size={10} weight="bold" />}
              label={`Remove tag ${t}`}
              tooltip={`Remove tag ${t}`}
              onClick={() => onRemoveTag(t)}
              className="size-4 shrink-0 rounded shadow-none hover:bg-black/15"
            />
          ) : null}
        </span>
      ))}
      {rest > 0 ? (
        <Tooltip
          content={`${rest} more ${rest === 1 ? "tag" : "tags"}: ${hidden.join(", ")}`}
        >
          <span className={cn("inline-flex")}>
            <OverflowChip>+{rest}</OverflowChip>
          </span>
        </Tooltip>
      ) : null}
    </span>
  );
}
