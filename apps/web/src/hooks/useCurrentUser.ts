import { useMeQuery, type MeQuery } from "@/gql/hooks";

export type CurrentUser = NonNullable<MeQuery["me"]>;

export function useCurrentUser() {
  const { data, loading, error } = useMeQuery();

  return {
    user: data?.me ?? null,
    loading,
    error,
  };
}
