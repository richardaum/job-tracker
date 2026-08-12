"use client";

import { cn, FilterChip, Tooltip } from "@job-tracker/ui";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ApplicationQuickFilter, useQuickFilterCountsQuery } from "@/gql/hooks";
import { useWelcomeTour } from "@/modules/welcome-tour/useWelcomeTour";

const QUICK_FILTERS = [
  { key: "all", label: "All", tooltip: "Show all jobs" },
  { key: "draft", label: "Draft", tooltip: "Imported jobs awaiting fill" },
  {
    key: "incoming",
    label: "Incoming",
    tooltip: "Non-rejected and non-applied with interviews scheduled from today onwards",
  },
  { key: "active", label: "Active", tooltip: "In-progress jobs (not new, applied, or rejected)" },
  { key: "applied", label: "Applied", tooltip: "Submitted jobs awaiting response" },
  { key: "new", label: "New", tooltip: "Recently added, not yet acted on" },
  { key: "duplicated", label: "Duplicated", tooltip: "Marked as duplicate of another job" },
] as const;

type QuickFilterKey = (typeof QUICK_FILTERS)[number]["key"];
type QuickFiltersProps = { restrictInteractionTo?: QuickFilterKey };

const FILTER_COUNT_KEY_MAP: Record<string, QuickFilterKey> = {
  [ApplicationQuickFilter.Draft]: "draft",
  [ApplicationQuickFilter.Incoming]: "incoming",
  [ApplicationQuickFilter.Active]: "active",
  [ApplicationQuickFilter.Applied]: "applied",
  [ApplicationQuickFilter.New]: "new",
  [ApplicationQuickFilter.Duplicated]: "duplicated",
};

function resolveActiveQuickFilterKey(raw: string | null): QuickFilterKey {
  if (!raw) return "incoming";
  const match = QUICK_FILTERS.find((f) => f.key === raw);
  return match ? match.key : "incoming";
}

export function QuickFilters({ restrictInteractionTo }: QuickFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activePhase } = useWelcomeTour();
  const activeFilter = resolveActiveQuickFilterKey(searchParams.get("q"));

  const company = searchParams.get("company");
  const runId = searchParams.get("runId");
  const isInitialWelcomeTourStep = activePhase === "job-creation";
  const { data } = useQuickFilterCountsQuery({
    variables: { company, runId },
    fetchPolicy: "cache-and-network",
    skip: isInitialWelcomeTourStep,
  });

  const entries = isInitialWelcomeTourStep ? [] : (data?.quickFilterCounts ?? []);
  const counts: Record<string, number> = {};
  let allCount = 0;
  for (const entry of entries) {
    const chipKey = FILTER_COUNT_KEY_MAP[entry.key];
    if (chipKey) {
      counts[chipKey] = entry.count;
    }
    allCount += entry.count;
  }
  counts.all = allCount;

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
    router.push((query ? `${pathname}?${query}` : pathname) as Route);
  }

  return (
    <div className={cn("flex items-center gap-2 border-b border-border-subtle px-4 py-2 sm:px-6")}>
      <div className={cn("flex flex-wrap items-center gap-1.5")}>
        {QUICK_FILTERS.map(({ key, label, tooltip }) => {
          const isRestricted = restrictInteractionTo !== undefined && restrictInteractionTo !== key;

          return (
            <div key={key} inert={isRestricted}>
              <Tooltip content={tooltip} side="bottom">
                <FilterChip
                  active={activeFilter === key}
                  onClick={() => toggle(key)}
                  tabIndex={isRestricted ? -1 : undefined}
                  data-welcome-tour-step={key === "active" ? "active-jobs-filter" : undefined}
                >
                  {label}
                  {counts[key] > 0 && <span className={cn("ml-1")}>({counts[key]})</span>}
                </FilterChip>
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
}
