"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Text } from "@job-tracker/ui";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Sidebar } from "./Sidebar";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (loading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ backgroundColor: "var(--primitive-color-neutral-100)" }}
      >
        <Text as="span" size="sm" color="secondary">
          Loading…
        </Text>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      className="flex h-screen"
      style={{ backgroundColor: "var(--primitive-color-neutral-100)" }}
    >
      {/* Sidebar sits flat on the gray background (desktop + mobile drawer) */}
      <Sidebar open={isNavOpen} onClose={() => setIsNavOpen(false)} />

      {/* Content panel: white card elevated above the gray */}
      <div className="flex flex-1 overflow-hidden p-2 md:pl-0">
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-bg-surface">
          <div className="border-b border-border-subtle px-4 py-3 md:hidden">
            <button
              type="button"
              onClick={() => setIsNavOpen(true)}
              className="rounded-md border border-border-subtle px-3 py-1.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-surface-hover"
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
