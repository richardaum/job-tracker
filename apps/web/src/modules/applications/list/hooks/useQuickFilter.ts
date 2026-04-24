import { useSearchParams } from "next/navigation";
import { ApplicationQuickFilter } from "@/gql/hooks";

const PARAM_TO_FILTER: Record<string, ApplicationQuickFilter> = {
  active: ApplicationQuickFilter.Active,
  incoming: ApplicationQuickFilter.Incoming,
  applied: ApplicationQuickFilter.Applied,
  new: ApplicationQuickFilter.New,
};

export function useQuickFilter(): ApplicationQuickFilter | null {
  const searchParams = useSearchParams();
  return PARAM_TO_FILTER[searchParams.get("q") ?? ""] ?? null;
}
