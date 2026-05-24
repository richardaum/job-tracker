"use client";

import { authMutationRequestInit } from "@job-tracker/auth";
import { Button, cn, Text } from "@job-tracker/ui";
import {
  BriefcaseIcon,
  BuildingsIcon,
  CalculatorIcon,
  DownloadSimpleIcon,
  FilesIcon,
  GearIcon,
  MagnifyingGlassIcon,
  QuestionIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";

import type { CurrentUser } from "@/hooks/useCurrentUser";
import { getApiBaseUrl } from "@/lib/api-endpoints";
import { apolloClient } from "@/lib/apollo-client";
import { AppBrandMark } from "@/modules/navigation/components/AppBrandMark";
import { ObfuscatedText } from "@/modules/navigation/components/ObfuscatedText";

const API_URL = getApiBaseUrl();

const navItems = [
  { href: "/jobs", label: "Jobs", icon: BriefcaseIcon },
  { href: "/resumes", label: "Resumes", icon: FilesIcon },
  { href: "/sources", label: "Sources", icon: DownloadSimpleIcon },
  { href: "/companies", label: "Companies", icon: BuildingsIcon },
  {
    href: "/tools/salary-calculator",
    label: "Salary Calculator",
    icon: CalculatorIcon,
  },
];

const bottomItems = [
  { href: "#", label: "Help Center", icon: QuestionIcon },
  { href: "#", label: "Settings", icon: GearIcon },
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
  const [loggingOut, setLoggingOut] = useState(false);
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((namePart) => namePart[0])
    .join("")
    .toUpperCase();

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch(
        `${API_URL}/auth/logout`,
        authMutationRequestInit({ method: "POST", credentials: "include" }),
      );
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
          Job Tracker
        </Text>
      </div>

      {/* Search */}
      <div className={cn("px-3 pb-4")}>
        <div
          className={cn(
            "flex items-center gap-2 rounded-md border border-border-default bg-bg-surface px-3 py-2 shadow-sm",
          )}
        >
          <MagnifyingGlassIcon
            size={14}
            weight="regular"
            className={cn("shrink-0 text-text-muted")}
          />
          <Text as="span" size="sm" color="muted" className={cn("flex-1")}>
            Search here...
          </Text>
          <span
            className={cn(
              "rounded border border-border-subtle px-1.5 py-0.5 text-xs text-text-muted",
            )}
          >
            ⌘/
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className={cn("flex flex-1 flex-col px-3")}>
        <Text
          size="xs"
          weight="semibold"
          className={cn("mb-2 px-2 uppercase tracking-wider")}
        >
          Menu
        </Text>
        <div className={cn("flex flex-col gap-0.5")}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => onClose?.()}
                className={cn(
                  "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-bg-brand text-text-inverted"
                    : "text-text-secondary hover:bg-bg-surface",
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
        <div className={cn("mx-1 mb-1 border-t border-border-default")} />
        <div
          className={cn(
            "mb-1 flex min-w-0 items-center gap-3 rounded-md px-4 py-2",
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
          <div className={cn("min-w-0")}>
            <Text size="sm" weight="semibold" className={cn("truncate")}>
              {user.name}
            </Text>
            <Text size="xs" color="muted" className={cn("truncate")}>
              <ObfuscatedText
                text={user.email}
                obfuscatedText={obfuscateEmail(user.email)}
              />
            </Text>
          </div>
        </div>
        <div className={cn("mx-1 mb-1 border-t border-border-default")} />
        {bottomItems.map(({ href, label, icon: Icon }) => (
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
          onClick={() => void handleLogout()}
          state={loggingOut ? "loading" : "default"}
          className={cn(
            "flex w-full items-center justify-start gap-3 rounded-md px-4 py-2 text-left text-sm font-medium text-text-error transition-colors hover:bg-bg-error-subtle hover:text-text-error",
          )}
          leftIcon={<SignOutIcon size={16} />}
        >
          Log Out
        </Button>
      </div>
    </>
  );

  return (
    <>
      <aside className={cn("hidden h-full w-56 shrink-0 flex-col md:flex")}>
        {navContent}
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => onClose?.()}
          className={cn(
            "absolute inset-0 bg-black/35 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
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
