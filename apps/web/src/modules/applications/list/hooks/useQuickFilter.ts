import { useSearchParams } from "next/navigation";

import { ApplicationQuickFilter } from "@/gql/hooks";

const PARAM_TO_FILTER: Record<string, ApplicationQuickFilter> = {
  active: ApplicationQuickFilter.Active,
  incoming: ApplicationQuickFilter.Incoming,
  applied: ApplicationQuickFilter.Applied,
  new: ApplicationQuickFilter.New,
  duplicated: ApplicationQuickFilter.Duplicated,
};

export function useQuickFilter(): ApplicationQuickFilter | null {
  const searchParams = useSearchParams();
  const raw = searchParams.get("q");
  if (!raw) return ApplicationQuickFilter.Incoming;
  return PARAM_TO_FILTER[raw] ?? null;
}

export function useCompanyFilter(): string | null {
  const searchParams = useSearchParams();
  const company = searchParams.get("company")?.trim();
  return company ? company : null;
}
