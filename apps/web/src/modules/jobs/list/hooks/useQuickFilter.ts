import { useSearchParams } from "next/navigation";

import { JobQuickFilter } from "@/gql/hooks";

const PARAM_TO_FILTER: Record<string, JobQuickFilter> = {
  active: JobQuickFilter.Active,
  incoming: JobQuickFilter.Incoming,
  applied: JobQuickFilter.Applied,
  new: JobQuickFilter.New,
  duplicated: JobQuickFilter.Duplicated,
};

export function useQuickFilter(): JobQuickFilter | null {
  const searchParams = useSearchParams();
  const raw = searchParams.get("q");
  if (!raw) return JobQuickFilter.Incoming;
  return PARAM_TO_FILTER[raw] ?? null;
}

export function useCompanyFilter(): string | null {
  const searchParams = useSearchParams();
  const company = searchParams.get("company")?.trim();
  return company ? company : null;
}
