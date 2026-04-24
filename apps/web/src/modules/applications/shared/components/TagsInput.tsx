"use client";

import React, { useRef, useState } from "react";
import { cn } from "@job-tracker/ui";
import { XIcon } from "@phosphor-icons/react";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
  id?: string;
}

export function TagsInput({ value, onChange, disabled, id }: TagsInputProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function commit(raw: string) {
    const tag = raw.trim();
    if (tag && !value.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      onChange([...value, tag]);
    }
    setDraft("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function handleBlur() {
    if (draft.trim()) commit(draft);
  }

  function remove(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div
      className={cn(
        "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-border-subtle bg-bg-surface px-2.5 py-1.5 transition-colors",
        "focus-within:border-border-brand focus-within:ring-1 focus-within:ring-border-brand",
        disabled && "cursor-not-allowed opacity-50",
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className={cn(
            "inline-flex items-center gap-1 rounded border border-border-subtle bg-bg-surface-hover py-0.5 pl-1.5 pr-0.5 text-xs text-text-secondary",
          )}
        >
          <span className="max-w-40 truncate">{tag}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              remove(tag);
            }}
            disabled={disabled}
            aria-label={`Remove tag ${tag}`}
            className={cn(
              "flex size-4 shrink-0 items-center justify-center rounded hover:bg-black/15 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-brand",
            )}
          >
            <XIcon size={10} weight="bold" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={draft}
        autoComplete="off"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={value.length === 0 ? "Type a tag and press Enter" : ""}
        className={cn(
          "min-w-24 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted disabled:cursor-not-allowed",
        )}
      />
    </div>
  );
}
