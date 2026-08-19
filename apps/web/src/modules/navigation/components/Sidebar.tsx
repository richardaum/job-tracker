"use client";

import { useApolloClient } from "@apollo/client/react";
import { authMutationRequestInit } from "@job-tracker/auth";
import { Button, cn, Text } from "@job-tracker/ui";
import {
  BriefcaseIcon,
  BuildingsIcon,
  CalculatorIcon,
  CaretRightIcon,
  DownloadSimpleIcon,
  GaugeIcon,
  GearIcon,
  QuestionIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useFeatureFlagEnabled, usePostHog } from "posthog-js/react";
import { useEffect, useState } from "react";

import { Role } from "@/gql/graphql";
import { useAiUsageChangedSubscription, useSettingsQuery } from "@/gql/hooks";
import { clientEnv } from "@/env/client";
import type { CurrentUser } from "@/hooks/useCurrentUser";
import { getApiBaseUrl } from "@/lib/api-endpoints";
import { areScreenshotFlagsEnabled, screenshotFlags } from "@/lib/screenshot-flags";
import { AppBrandMark } from "@/modules/navigation/components/AppBrandMark";
import { ObfuscatedText } from "@/modules/navigation/components/ObfuscatedText";
import { TrialQuotaTrackbar } from "@/modules/navigation/components/TrialQuotaTrackbar";
import { WelcomeTourProgressTrackbar } from "@/modules/navigation/components/WelcomeTourProgressTrackbar";

const API_URL = getApiBaseUrl();
const screenshotsEnabled = areScreenshotFlagsEnabled(clientEnv.NODE_ENV);

const navItems: Array<{ href: Route; label: string; icon: typeof BriefcaseIcon }> = [
  { href: "/jobs", label: "Jobs", icon: BriefcaseIcon },
  { href: "/sources", label: "Sources", icon: DownloadSimpleIcon },
  { href: "/companies", label: "Companies", icon: BuildingsIcon },
  { href: "/tools/salary-calculator", label: "Salary Calculator", icon: CalculatorIcon },
];

const adminNavItem: { href: Route; label: string; icon: typeof GaugeIcon } = {
  href: "/admin",
  label: "Admin",
  icon: GaugeIcon,
};

const bottomItems: Array<{ href: Route; label: string; icon: typeof QuestionIcon }> = [
  { href: "#" as Route, label: "Help Center", icon: QuestionIcon },
  { href: "/profile/settings", label: "Settings", icon: GearIcon },
];

function obfuscateEmail(email: string) {
  const [localPart, domainPart] = email.split("@");
  if (!localPart || !domainPart) {
    return email;
  }

  if (localPart.length <= 2) {
    return `${localPart[0] ?? "*"}***@${domainPart}`;
  }

  return `${localPart.slice(0, 2)}***@${domainPart}`;
}

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  user: CurrentUser;
}

export function Sidebar({ open = false, onClose, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const apolloClient = useApolloClient();
  const [loggingOut, setLoggingOut] = useState(false);
  const { data: settingsData, refetch: refetchSettings } = useSettingsQuery();

  useAiUsageChangedSubscription({
    onData: () => {
      void refetchSettings();
    },
  });
  const posthog = usePostHog();
  const sourcesEnabled = useFeatureFlagEnabled("sources-enabled") ?? false;
  const helpCenterEnabled = useFeatureFlagEnabled("help-center-enabled") ?? false;
  const visibleNavItems = [
    ...navItems.filter((item) => item.href !== "/sources" || sourcesEnabled),
    ...(user.role === Role.Admin && !(screenshotsEnabled && screenshotFlags.hideAdminPanel) ? [adminNavItem] : []),
  ];
  const visibleBottomItems = bottomItems.filter((item) => item.label !== "Help Center" || helpCenterEnabled);

  useEffect(() => {
    posthog?.identify(user.id, { email: user.email, name: user.name });
  }, [posthog, user.id, user.email, user.name]);
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((namePart) => namePart[0])
    .join("")
    .toUpperCase();
  const shouldShowTrialTrackbar = settingsData?.settings && !settingsData.settings.hasOpenAiKey;

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch(`${API_URL}/auth/logout`, authMutationRequestInit({ method: "POST", credentials: "include" }));
      await apolloClient.clearStore();
      onClose?.();
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  const navContent = (
    <>
      {/* Logo — same graphic as favicon (`src/app/icon.svg`) */}
      <div className={cn("flex items-center gap-2 p-5 ")}>
        <AppBrandMark size={22} />
        <Text as="span" size="base" weight="bold">
          NewJobTracker
        </Text>
      </div>

      {/* Nav */}
      <nav className={cn("flex flex-1 flex-col px-3")}>
        <Text size="xs" weight="semibold" className={cn("mb-2 px-2 uppercase tracking-wider")}>
          Menu
        </Text>
        <div className={cn("flex flex-col gap-0.5")}>
          {visibleNavItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => onClose?.()}
                className={cn(
                  "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-bg-brand text-text-inverted" : "text-text-secondary hover:bg-bg-surface",
                )}
              >
                <Icon size={16} weight={isActive ? "fill" : "regular"} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom items */}
      <div className={cn("flex flex-col gap-0 p-3 ")}>
        <WelcomeTourProgressTrackbar onResetComplete={onClose} />
        {shouldShowTrialTrackbar && settingsData?.settings && (
          <TrialQuotaTrackbar
            trialCallsUsed={settingsData.settings.trialCallsUsed}
            trialCallsLimit={settingsData.settings.trialCallsLimit}
          />
        )}
        <div className={cn("mx-1 mb-1 border-t border-border-default")} />
        <Link
          href="/profile"
          onClick={() => onClose?.()}
          className={cn(
            "mb-1 flex min-w-0 items-center gap-3 rounded-md px-4 py-2 hover:bg-bg-surface-hover cursor-pointer",
          )}
        >
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={36}
              height={36}
              className={cn("size-9  shrink-0 rounded-full object-cover")}
            />
          ) : (
            <div
              className={cn(
                "flex size-9  shrink-0 items-center justify-center rounded-full bg-bg-brand-subtle text-sm font-semibold text-text-brand",
              )}
            >
              {initials}
            </div>
          )}
          <div className={cn("min-w-0 flex-1")}>
            <Text size="sm" weight="semibold" className={cn("truncate")}>
              {user.name}
            </Text>
            <Text size="xs" color="muted" className={cn("truncate")}>
              <ObfuscatedText text={user.email} obfuscatedText={obfuscateEmail(user.email)} />
            </Text>
          </div>
          <CaretRightIcon size={14} weight="regular" className={cn("shrink-0 text-text-muted")} />
        </Link>
        <div className={cn("mx-1 mb-1 border-t border-border-default")} />
        {visibleBottomItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            onClick={() => onClose?.()}
            className={cn(
              "flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-surface",
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
        <Button
          intent="ghost"
          size="md"
          colorScheme="error"
          onClick={() => void handleLogout()}
          state={loggingOut ? "loading" : "default"}
          leftIcon={<SignOutIcon size={16} />}
          className={cn("justify-start gap-3 border-0 text-sm")}
        >
          Log Out
        </Button>
      </div>
    </>
  );

  return (
    <>
      <aside className={cn("hidden h-full w-56 shrink-0 flex-col md:flex")}>{navContent}</aside>

      <div
        className={cn("fixed inset-0 z-50 md:hidden", open ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => onClose?.()}
          className={cn("absolute inset-0 bg-black/35 transition-opacity", open ? "opacity-100" : "opacity-0")}
        />
        <aside
          className={cn(
            "relative flex h-full w-72 max-w-[85vw] flex-col bg-bg-surface shadow-md transition-transform",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className={cn("flex items-center justify-between px-5 py-3")}>
            <Text as="span" size="base" weight="bold">
              Navigation
            </Text>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => onClose?.()}
              className={cn(
                "rounded-md border border-border-default px-2 py-1 text-xs text-text-secondary hover:bg-bg-surface-hover",
              )}
            >
              Close
            </button>
          </div>
          {navContent}
        </aside>
      </div>
    </>
  );
}
