"use client";

import { cn, Text } from "@job-tracker/ui";
import { useCallback, useRef, useState } from "react";

function guessType(v: string) {
  if (v === "null") return null;
  if (v === "true") return true;
  if (v === "false") return false;
  const n = Number(v);
  if (!Number.isNaN(n) && v.trim() !== "") return n;
  return v;
}

function ValueCell({
  value,
  onSave,
}: {
  value: unknown;
  onSave: (next: unknown) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));
  const inputRef = useRef<HTMLInputElement>(null);

  function commit() {
    setEditing(false);
    const next = guessType(draft);
    onSave(next);
  }

  function startEdit() {
    setDraft(String(value ?? ""));
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        className={cn(
          "w-full min-w-0 bg-transparent font-mono text-sm outline-none",
          typeof value === "string" && "text-text-success",
          typeof value === "number" && "text-text-info",
          typeof value === "boolean" && "text-text-warning",
          value === null && "text-text-disabled",
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      className={cn(
        "w-full min-w-0 cursor-text text-left font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-1 rounded-sm",
        typeof value === "string" && "text-text-success",
        typeof value === "number" && "text-text-info",
        typeof value === "boolean" && "text-text-warning",
        value === null && "text-text-disabled",
      )}
    >
      {value === null ? "null" : String(value)}
    </button>
  );
}

function CollapseIcon({ expanded }: { expanded: boolean }) {
  return (
    <span className={cn("w-3 shrink-0 select-none text-xs")}>
      {expanded ? "▼" : "▶"}
    </span>
  );
}

function branchMeta(value: unknown): string {
  if (typeof value === "object" && value !== null) {
    if (Array.isArray(value))
      return `[${value.length} item${value.length === 1 ? "" : "s"}]`;
    const keys = Object.keys(value);
    return `{${keys.length} key${keys.length === 1 ? "" : "s"}}`;
  }
  return "";
}

function TreeNode({
  label,
  value,
  path,
  onValueChange,
  defaultExpanded = false,
}: {
  label: string;
  value: unknown;
  path: string;
  onValueChange: (path: string, value: unknown) => void;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isArray = Array.isArray(value);

  if (typeof value === "object" && value !== null) {
    const entries = isArray
      ? value.map((v: unknown, i: number) => [String(i), v] as const)
      : Object.entries(value as Record<string, unknown>);

    return (
      <div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex w-full cursor-pointer items-center gap-1 text-left hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-1 rounded-sm",
          )}
        >
          <CollapseIcon expanded={expanded} />
          {label ? (
            <span className={cn("font-medium text-text-secondary")}>
              {label}:
            </span>
          ) : null}
          <span className={cn("text-text-disabled text-xs")}>
            {branchMeta(value)}
          </span>
        </button>
        {expanded && (
          <div className={cn("border-l border-border-subtle pl-3 ml-1")}>
            {entries.map(([key, val]) => (
              <div key={key} className={cn("py-0.5")}>
                <TreeNode
                  label={key}
                  value={val}
                  path={`${path}/${key}`}
                  onValueChange={onValueChange}
                  defaultExpanded={defaultExpanded}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1")}>
      {label ? (
        <span className={cn("shrink-0 font-medium text-text-secondary")}>
          {label}:
        </span>
      ) : null}
      <div className={cn("min-w-0 flex-1")}>
        <ValueCell value={value} onSave={(next) => onValueChange(path, next)} />
      </div>
    </div>
  );
}

function updateAt(obj: unknown, path: string, value: unknown): unknown {
  if (path === "#" || path === "") return value;
  const parts = path.split("/").filter(Boolean);

  function setIn(data: unknown, index: number): unknown {
    if (index === parts.length) return value;
    const k = parts[index];
    if (Array.isArray(data)) {
      const next = [...data];
      next[Number(k)] = setIn(next[Number(k)], index + 1);
      return next;
    }
    if (typeof data === "object" && data !== null) {
      return {
        ...(data as Record<string, unknown>),
        [k]: setIn((data as Record<string, unknown>)[k], index + 1),
      };
    }
    return data;
  }

  return setIn(obj, 0);
}

export function HeadlessJsonEditor({
  data,
  onChange,
}: {
  data: unknown;
  onChange: (next: unknown) => void;
}) {
  const handleChange = useCallback(
    (path: string, value: unknown) => {
      onChange(updateAt(data, path, value));
    },
    [data, onChange],
  );

  if (typeof data !== "object" || data === null) {
    return <Text color="error">Invalid data</Text>;
  }

  return (
    <div className={cn("font-mono text-sm/relaxed")}>
      <TreeNode
        label=""
        value={data}
        path="#"
        onValueChange={handleChange}
        defaultExpanded
      />
    </div>
  );
}
