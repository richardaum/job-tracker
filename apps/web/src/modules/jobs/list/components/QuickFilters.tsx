"use client";

import { cn, FilterChip, Tooltip } from "@job-tracker/ui";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const QUICK_FILTERS = [
  { key: "all", label: "All", tooltip: "Show all jobs" },
  { key: "draft", label: "Draft", tooltip: "Imported jobs awaiting fill" },
  {
    key: "incoming",
    label: "Incoming",
    tooltip:
      "Non-rejected and non-applied with interviews scheduled from today onwards",
  },
  {
    key: "active",
    label: "Active",
    tooltip: "In-progress jobs (not new, applied, or rejected)",
  },
  {
    key: "applied",
    label: "Applied",
    tooltip: "Submitted jobs awaiting response",
  },
  { key: "new", label: "New", tooltip: "Recently added, not yet acted on" },
  {
    key: "duplicated",
    label: "Duplicated",
    tooltip: "Marked as duplicate of another job",
  },
] as const;

type QuickFilterKey = (typeof QUICK_FILTERS)[number]["key"];

function resolveActiveQuickFilterKey(raw: string | null): QuickFilterKey {
  if (!raw) return "incoming";
  const match = QUICK_FILTERS.find((f) => f.key === raw);
  return match ? match.key : "incoming";
}

export function QuickFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeFilter = resolveActiveQuickFilterKey(searchParams.get("q"));

  function toggle(key: QuickFilterKey) {
    const params = new URLSearchParams(searchParams.toString());
    if (activeFilter === key) {
      if (!searchParams.has("q")) return;
      if (key === "all") {
        params.set("q", "incoming");
      } else {
        params.delete("q");
      }
    } else {
      params.set("q", key);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
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
