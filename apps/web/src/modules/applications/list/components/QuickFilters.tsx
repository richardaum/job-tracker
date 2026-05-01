"use client";

import { cn, FilterChip, Tooltip } from "@job-tracker/ui";
import { useRouter, useSearchParams } from "next/navigation";

const QUICK_FILTERS = [
  {
    key: "active",
    label: "Active",
    tooltip: "In-progress applications (not new, applied, or rejected)",
  },
  {
    key: "incoming",
    label: "Incoming",
    tooltip:
      "Non-rejected and non-applied with interviews scheduled from today onwards",
  },
  {
    key: "applied",
    label: "Applied",
    tooltip: "Submitted applications awaiting response",
  },
  { key: "new", label: "New", tooltip: "Recently added, not yet acted on" },
] as const;

type QuickFilterKey = (typeof QUICK_FILTERS)[number]["key"];

export function QuickFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFilter = searchParams.get("q") as QuickFilterKey | null;

  function toggle(key: QuickFilterKey) {
    const params = new URLSearchParams(searchParams.toString());
    if (activeFilter === key) {
      params.delete("q");
    } else {
      params.set("q", key);
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-border-subtle px-4 py-2 sm:px-6",
      )}
    >
      <div className={cn("flex flex-wrap items-center gap-1.5")}>
        {QUICK_FILTERS.map(({ key, label, tooltip }) => (
          <Tooltip key={key} content={tooltip} side="bottom">
            <FilterChip
              active={activeFilter === key}
              onClick={() => toggle(key)}
            >
              {label}
            </FilterChip>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
