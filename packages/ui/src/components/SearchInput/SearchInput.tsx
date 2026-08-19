"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input } from "@ui/components/Input/Input";
import { cn } from "@ui/lib/cn";
import { useEffect, useRef } from "react";
import type { ChangeEventHandler } from "react";

export interface SearchInputProps {
  placeholder: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  ariaLabel?: string;
  shortcutHint?: string | null;
  className?: string;
}

export function SearchInput({
  placeholder,
  value,
  onChange,
  ariaLabel,
  shortcutHint = null,
  className,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isInteractive = value !== undefined && onChange !== undefined;

  useEffect(() => {
    if (!shortcutHint) return;

    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.code === "Slash") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [shortcutHint]);

  return (
    <div
      className={cn(
        "flex w-full items-center gap-2 rounded-md border border-border-subtle bg-bg-field px-3 py-0 sm:max-w-sm",
        isInteractive && "transition-colors",
        isInteractive &&
          "focus-within:border-border-brand focus-within:ring-2 focus-within:ring-inset focus-within:ring-border-brand",
        className,
      )}
    >
      <MagnifyingGlassIcon size={14} weight="regular" className={cn("shrink-0 text-text-muted")} aria-hidden />
      <Input
        size="sm"
        value={value}
        onChange={onChange}
        ref={inputRef}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className={cn(
          "border-none bg-transparent p-0 shadow-none",
          "text-sm/normal focus-visible:border-transparent focus-visible:ring-0",
        )}
      />
      {shortcutHint ? (
        <span className={cn("rounded border border-border-subtle px-1.5 py-0.5 text-xs text-text-muted")}>
          {shortcutHint}
        </span>
      ) : null}
    </div>
  );
}
