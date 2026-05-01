"use client";

import { cn, Text } from "@job-tracker/ui";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

import { useAuthReturnTo } from "@/hooks/useAuthReturnTo";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Sidebar } from "@/modules/navigation/components/Sidebar";

function AuthenticatedFullscreenLoadingScreen() {
  return (
    <div
      className={cn("flex h-screen items-center justify-center")}
      style={{ backgroundColor: "var(--primitive-color-neutral-100)" }}
    >
      <Text as="span" size="sm" color="secondary">
        Loading…
      </Text>
    </div>
  );
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const { loginRedirectUrl } = useAuthReturnTo();
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(loginRedirectUrl);
    }
  }, [loading, loginRedirectUrl, router, user]);

  if (loading) {
    return <AuthenticatedFullscreenLoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <div
      className={cn("flex h-screen")}
      style={{ backgroundColor: "var(--primitive-color-neutral-100)" }}
    >
      <Sidebar
        user={user}
        open={isNavOpen}
        onClose={() => setIsNavOpen(false)}
      />

      <div className={cn("flex flex-1 overflow-hidden p-2 md:pl-0")}>
        <div
          className={cn(
            "flex flex-1 flex-col overflow-hidden rounded-xl bg-bg-surface",
          )}
        >
          <div
            className={cn("border-b border-border-subtle px-4 py-3 md:hidden")}
          >
            <button
              type="button"
              onClick={() => setIsNavOpen(true)}
              className={cn(
                "rounded-md border border-border-subtle px-3 py-1.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-surface-hover",
              )}
            >
              Menu
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
