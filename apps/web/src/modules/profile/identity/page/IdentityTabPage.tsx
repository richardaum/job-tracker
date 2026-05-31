"use client";

import { cn, FieldWithLabelAction, Stack, Text } from "@job-tracker/ui";
import Image from "next/image";

import { AuthProvider } from "@/gql/graphql";
import { useMeQuery } from "@/gql/hooks";

function authProviderLabel(provider: AuthProvider): string {
  switch (provider) {
    case AuthProvider.Google:
      return "Google";
    default:
      return provider;
  }
}

function primaryProviderLabel(accounts: { providerName: AuthProvider }[]): string | null {
  const first = accounts[0];
  return first ? authProviderLabel(first.providerName) : null;
}

export default function IdentityTabPage() {
  const { data, loading } = useMeQuery({ fetchPolicy: "cache-first" });
  const user = data?.me ?? null;

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!user) {
    return null;
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const providerLabel = primaryProviderLabel(user.accounts);

  return (
    <Stack gap="lg" align="stretch" className={cn("px-1 w-full")}>
      <div className={cn("max-w-full")}>
        <FieldWithLabelAction
          label="Photo"
          content={
            <div
              className={cn(
                "flex shrink-0 justify-start pt-0.5 max-sm:flex-col max-sm:items-start",
              )}
            >
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={96}
                  height={96}
                  className={cn("rounded-full")}
                />
              ) : (
                <div
                  className={cn(
                    "flex size-24 items-center justify-center rounded-full bg-bg-brand-subtle text-2xl font-semibold text-text-brand",
                  )}
                >
                  {initials}
                </div>
              )}
            </div>
          }
        />
      </div>

      <div
        className={cn(
          "flex w-full max-w-full flex-col justify-start gap-4 sm:flex-row sm:flex-wrap sm:justify-start sm:gap-6",
        )}
      >
        <div className={cn("min-w-0 max-w-full sm:max-w-md")}>
          <FieldWithLabelAction label="Name" content={<Text size="sm">{user.name}</Text>} />
        </div>
        <div className={cn("min-w-0 max-w-full sm:max-w-md")}>
          <FieldWithLabelAction label="Email" content={<Text size="sm">{user.email}</Text>} />
        </div>
        {providerLabel ? (
          <div className={cn("min-w-0 max-w-full sm:max-w-md")}>
            <FieldWithLabelAction
              label="Provider"
              content={<Text size="sm">{providerLabel}</Text>}
            />
          </div>
        ) : null}
      </div>
    </Stack>
  );
}
