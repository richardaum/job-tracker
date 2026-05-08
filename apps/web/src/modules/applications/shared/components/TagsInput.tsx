"use client";

import { cn, Tooltip } from "@job-tracker/ui";
import { XIcon } from "@phosphor-icons/react";
import React, { useRef, useState } from "react";

export interface TagWithMetadata {
  label: string;
  metadata?: string;
}

interface TagsInputProps {
  value: TagWithMetadata[];
  onChange: (tags: TagWithMetadata[]) => void;
  disabled?: boolean;
  id?: string;
}

export function TagsInput({ value, onChange, disabled, id }: TagsInputProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function commit(raw: string) {
    const tagLabel = raw.trim();
    if (
      tagLabel &&
      !value.some((t) => t.label.toLowerCase() === tagLabel.toLowerCase())
    ) {
      onChange([...value, { label: tagLabel }]);
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

  function remove(tagLabel: string) {
    onChange(value.filter((t) => t.label !== tagLabel));
  }

  function metadataText(tag: TagWithMetadata) {
    return tag.metadata?.trim() || undefined;
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
      {value.map((tag) => {
        const tooltipContent = metadataText(tag);
        return (
          <Tooltip
            key={tag.label}
            content={tooltipContent}
            side="top"
            enabled={Boolean(tooltipContent)}
          >
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded border border-border-subtle bg-bg-surface-hover py-0.5 pl-1.5 pr-0.5 text-xs text-text-secondary",
              )}
            >
              {tooltipContent ? (
                <span
                  aria-hidden
                  className={cn(
                    "size-1.5 shrink-0 rounded-full bg-text-muted/70",
                  )}
                />
              ) : null}
              <span className={cn("max-w-40 truncate")}>{tag.label}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(tag.label);
                }}
                disabled={disabled}
                aria-label={`Remove tag ${tag.label}`}
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded hover:bg-black/15 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-brand",
                )}
              >
                <XIcon size={10} weight="bold" />
              </button>
            </span>
          </Tooltip>
        );
      })}
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
