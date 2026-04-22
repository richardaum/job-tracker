"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BriefcaseIcon,
  GearIcon,
  MagnifyingGlassIcon,
  QuestionIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { Text } from "@job-tracker/ui";
import { NEXT_PUBLIC_API_URL } from "@/env/client";

const API_URL = NEXT_PUBLIC_API_URL ?? "http://localhost:3101";

const navItems = [
  { href: "/applications", label: "Applications", icon: BriefcaseIcon },
];

const bottomItems = [
  { href: "#", label: "Help Center", icon: QuestionIcon },
  { href: "#", label: "Settings", icon: GearIcon },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    onClose?.();
    router.replace("/login");
  }

  const navContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5">
        <BriefcaseIcon size={22} weight="fill" className="text-text-brand" />
        <Text as="span" size="base" weight="bold">
          Job Tracker
        </Text>
      </div>

      {/* Search */}
      <div className="px-3 pb-4">
        <div className="flex items-center gap-2 rounded-md border border-border-subtle bg-bg-surface px-3 py-2">
          <MagnifyingGlassIcon
            size={14}
            weight="regular"
            className="shrink-0 text-text-muted"
          />
          <Text as="span" size="sm" color="muted" className="flex-1">
            Search here...
          </Text>
          <span className="rounded border border-border-subtle px-1.5 py-0.5 text-xs text-text-muted">
            ⌘/
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col px-3">
        <Text
          size="xs"
          weight="semibold"
          className="mb-2 px-2 uppercase tracking-wider"
        >
          Menu
        </Text>
        <div className="flex flex-col gap-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => onClose?.()}
                className={[
                  "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-bg-brand text-text-inverted"
                    : "text-text-secondary hover:bg-bg-surface",
                ].join(" ")}
              >
                <Icon size={16} weight={isActive ? "fill" : "regular"} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom items */}
      <div className="flex flex-col gap-0.5 px-3 py-4">
        {bottomItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            onClick={() => onClose?.()}
            className="flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-surface"
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-left text-sm font-medium text-text-error transition-colors hover:bg-bg-error-subtle"
        >
          <SignOutIcon size={16} />
          Log Out
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden h-full w-56 shrink-0 flex-col md:flex">
        {navContent}
      </aside>

      <div
        className={[
          "fixed inset-0 z-50 md:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => onClose?.()}
          className={[
            "absolute inset-0 bg-black/35 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
        <aside
          className={[
            "relative flex h-full w-72 max-w-[85vw] flex-col bg-bg-surface shadow-md transition-transform",
            open ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="flex items-center justify-between px-5 py-3">
            <Text as="span" size="base" weight="bold">
              Navigation
            </Text>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => onClose?.()}
              className="rounded-md border border-border-subtle px-2 py-1 text-xs text-text-secondary hover:bg-bg-surface-hover"
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
