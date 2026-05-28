"use client";

import { cn } from "@job-tracker/ui";
import { useState } from "react";

function ValueDisplay({ value }: { value: unknown }) {
  if (typeof value === "string") {
    return <span className={cn("text-text-success")}>"{value}"</span>;
  }
  if (typeof value === "number") {
    return <span className={cn("text-text-info")}>{value}</span>;
  }
  if (typeof value === "boolean") {
    return <span className={cn("text-text-warning")}>{String(value)}</span>;
  }
  if (value === null) {
    return <span className={cn("text-text-disabled")}>null</span>;
  }
  return <span>{String(value)}</span>;
}

function CollapseIcon({ expanded }: { expanded: boolean }) {
  return (
    <span className={cn("w-3 shrink-0 text-xs")}>{expanded ? "▼" : "▶"}</span>
  );
}

function ObjectView({
  data,
  label,
  defaultExpanded = false,
}: {
  data: Record<string, unknown>;
  label?: string;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const entries = Object.entries(data);
  const count = entries.length;

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex cursor-pointer items-center gap-1 text-left hover:opacity-75",
        )}
      >
        <CollapseIcon expanded={expanded} />
        {label ? (
          <span className={cn("font-medium text-text-secondary")}>
            {label}:{" "}
          </span>
        ) : null}
        <span className={cn("text-text-disabled text-xs")}>
          {"{"}
          {count} {count === 1 ? "key" : "keys"}
          {"}"}
        </span>
      </button>
      {expanded && (
        <div className={cn("border-l border-border-subtle pl-3 ml-1")}>
          {entries.map(([key, value]) => (
            <div key={key} className={cn("py-0.5")}>
              <TreeNodeDisplay
                label={key}
                value={value}
                defaultExpanded={defaultExpanded}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ArrayView({
  data,
  label,
  defaultExpanded = false,
}: {
  data: unknown[];
  label?: string;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const count = data.length;

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex cursor-pointer items-center gap-1 text-left hover:opacity-75",
        )}
      >
        <CollapseIcon expanded={expanded} />
        {label ? (
          <span className={cn("font-medium text-text-secondary")}>
            {label}:{" "}
          </span>
        ) : null}
        <span className={cn("text-text-disabled text-xs")}>
          {"["}
          {count} {count === 1 ? "item" : "items"}
          {"]"}
        </span>
      </button>
      {expanded && (
        <div className={cn("border-l border-border-subtle pl-3 ml-1")}>
          {data.map((item, index) => (
            <div key={index} className={cn("py-0.5")}>
              <TreeNodeDisplay
                label={String(index)}
                value={item}
                defaultExpanded={defaultExpanded}
                compact
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TreeNodeDisplay({
  label,
  value,
  defaultExpanded = false,
  compact,
}: {
  label: string;
  value: unknown;
  defaultExpanded?: boolean;
  compact?: boolean;
}) {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return (
      <ObjectView
        data={value as Record<string, unknown>}
        label={label}
        defaultExpanded={defaultExpanded}
      />
    );
  }

  if (Array.isArray(value)) {
    return (
      <ArrayView data={value} label={label} defaultExpanded={defaultExpanded} />
    );
  }

  if (compact) {
    return (
      <span>
        <span className={cn("text-text-disabled text-xs mr-1")}>{label}:</span>
        <ValueDisplay value={value} />
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-1")}>
      <span className={cn("font-medium text-text-secondary")}>{label}:</span>
      <ValueDisplay value={value} />
    </div>
  );
}

export function JsonTreeView({ data }: { data: unknown }) {
  if (typeof data !== "object" || data === null) {
    return <ValueDisplay value={data} />;
  }

  if (Array.isArray(data)) {
    return <ArrayView data={data} defaultExpanded />;
  }

  return <ObjectView data={data as Record<string, unknown>} defaultExpanded />;
}
