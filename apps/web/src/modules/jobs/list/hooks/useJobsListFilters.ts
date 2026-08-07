import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { useCompanyFilter, useQuickFilter } from "@/modules/jobs/list/hooks/useQuickFilter";

/** Reads the URL-backed filters used by the jobs list data source. */
export function useJobsListFilters() {
  const searchParams = useSearchParams();
  const activeFilter = useQuickFilter();
  const companyFilter = useCompanyFilter();

  const runIdFilter = useMemo(() => {
    const raw = searchParams.get("runId")?.trim();
    return raw && raw.length > 0 ? raw : undefined;
  }, [searchParams]);

  return { activeFilter, companyFilter, runIdFilter };
}
