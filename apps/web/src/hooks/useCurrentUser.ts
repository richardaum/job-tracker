import { type MeQuery, useMeQuery } from "@/gql/hooks";

export type CurrentUser = NonNullable<MeQuery["me"]>;

export function useCurrentUser() {
  const { data, loading, error } = useMeQuery({ fetchPolicy: "cache-first" });

  return { user: data?.me ?? null, loading, error };
}
