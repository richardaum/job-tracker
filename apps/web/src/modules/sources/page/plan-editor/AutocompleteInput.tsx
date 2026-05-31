"use client";

import { cn, Input, Popover } from "@job-tracker/ui";
import { useRef } from "react";
import type { KeyboardEvent } from "react";

export interface AutocompleteOption {
  label: string;
  value: string;
}

type AutocompleteInputProps = {
  value: string;
  onChange: (value: string, cursor: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: AutocompleteOption[];
  selectedIndex: number;
  onSelectedIndexChange: (index: number) => void;
  onSelect?: (option: AutocompleteOption) => void;
  onCursorChange?: (cursor: number) => void;
  placeholder?: string;
  state?: "default" | "error";
  inputClassName?: string;
};

export function AutocompleteInput({
  value,
  onChange,
  open,
  onOpenChange,
  options,
  selectedIndex,
  onSelectedIndexChange,
  onSelect,
  onCursorChange,
  placeholder,
  state,
  inputClassName,
}: AutocompleteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || options.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      onSelectedIndexChange(Math.min(selectedIndex + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      onSelectedIndexChange(Math.max(selectedIndex - 1, 0));
    } else if (
      event.key === "Enter" &&
      selectedIndex >= 0 &&
      options[selectedIndex]
    ) {
      event.preventDefault();
      onSelect?.(options[selectedIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      onOpenChange(false);
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        <div className={cn("relative")}>
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) =>
              onChange(e.target.value, e.target.selectionStart ?? 0)
            }
            onKeyDown={handleKeyDown}
            onSelect={
              onCursorChange
                ? function (e) {
                    onCursorChange(
                      (e.target as HTMLInputElement).selectionStart ?? 0,
                    );
                  }
                : undefined
            }
            onKeyUp={
              onCursorChange
                ? function (e) {
                    onCursorChange(
                      (e.target as HTMLInputElement).selectionStart ?? 0,
                    );
                  }
                : undefined
            }
            placeholder={placeholder}
            state={state}
            className={inputClassName}
          />
        </div>
      }
      align="start"
      sideOffset={4}
    >
      <div className={cn("min-w-48")}>
        {options.length === 0 && (
          <div className={cn("px-2 py-1.5 text-xs text-text-muted")}>
            No matching options
          </div>
        )}
        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            tabIndex={-1}
            className={cn(
              "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs focus:outline-none",
              index === selectedIndex
                ? "bg-bg-surface-hover text-text-primary"
                : "text-text-primary hover:bg-bg-surface-hover",
            )}
            onClick={() => onSelect?.(option)}
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => onSelectedIndexChange(index)}
          >
            <span className={cn("font-mono text-text-primary")}>
              {option.value}
            </span>
            <span className={cn("text-text-muted ml-auto text-[11px]")}>
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </Popover>
  );
}
