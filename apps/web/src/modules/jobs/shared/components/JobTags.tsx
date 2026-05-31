import { Badge, cn, IconButton, Tooltip } from "@job-tracker/ui";
import { XIcon } from "@phosphor-icons/react";

type JobTagsProps = {
  tags: string[];
  maxTagChips?: number;
  onRemoveTag?: (tag: string) => void;
  className?: string;
};

export function JobTags({
  tags,
  maxTagChips,
  onRemoveTag,
  className,
}: JobTagsProps) {
  const shown = maxTagChips === undefined ? tags : tags.slice(0, maxTagChips);
  const rest = Math.max(0, tags.length - shown.length);
  const hidden = maxTagChips !== undefined ? tags.slice(maxTagChips) : [];
  if (shown.length === 0 && rest === 0) return null;
  return (
    <span
      className={cn("inline-flex flex-wrap items-center gap-1.5", className)}
    >
      {shown.map((t) => (
        <Badge
          key={t}
          className={cn(
            "max-w-40 gap-1",
            onRemoveTag ? "pl-1.5 pr-0.5" : undefined,
          )}
          title={t}
        >
          <span className={cn("truncate")}>{t}</span>
          {onRemoveTag ? (
            <IconButton
              intent="ghost"
              icon={<XIcon size={10} weight="bold" />}
              label="Remove tag"
              tooltip="Remove tag"
              onClick={() => onRemoveTag(t)}
              className={cn(
                "size-4 shrink-0 rounded shadow-none hover:bg-black/15",
              )}
            />
          ) : null}
        </Badge>
      ))}
      {rest > 0 ? (
        <Tooltip
          content={`${rest} more ${rest === 1 ? "tag" : "tags"}: ${hidden.join(", ")}`}
          side="bottom"
        >
          <span className={cn("inline-flex")}>
            <Badge>+{rest}</Badge>
          </span>
        </Tooltip>
      ) : null}
    </span>
  );
}
