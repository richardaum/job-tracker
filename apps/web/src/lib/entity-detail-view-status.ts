import { hasGraphQLCode } from "@/lib/graphql-entity-errors";

export type EntityDetailViewStatus = "loading" | "notFound" | "error" | "success";

export function deriveDetailStatus(loading: boolean, error: unknown): EntityDetailViewStatus {
  if (hasGraphQLCode(error, "NOT_FOUND")) return "notFound";
  if (error) return "error";
  if (loading) return "loading";
  return "success";
}
