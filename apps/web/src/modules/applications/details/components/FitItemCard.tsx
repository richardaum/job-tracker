"use client";

import { Badge, cn, Text, Tooltip } from "@job-tracker/ui";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  MinusCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import React from "react";

export interface FitItem {
  verdict: string;
  source: string;
  weight?: string | null;
  requirement: string;
  jdQuote: string;
  sourceQuotes: string[];
  suggestion?: string | null;
}

export function FitItemCard({ item }: { item: FitItem }) {
  const isFit = item.verdict === "fit";
  const isGap = item.verdict === "gap";
  const isUnclear = item.verdict === "unclear";

  // Filter out quotes that are identical to the requirement title to avoid visual duplication
  // as a safety measure for existing/AI data.
  const displayQuotes = item.sourceQuotes.filter(
    (quote) =>
      quote.trim().toLowerCase() !== item.requirement.trim().toLowerCase(),
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-3",
        isFit && "border-green-200",
        isGap && "border-red-200",
        isUnclear && "border-yellow-200",
      )}
    >
      <div className={cn("flex items-center gap-2")}>
        {isFit && (
          <CheckCircleIcon
            size={16}
            weight="fill"
            className={cn("text-green-500 shrink-0")}
          />
        )}
        {isGap && (
          <XCircleIcon
            size={16}
            weight="fill"
            className={cn("text-red-500 shrink-0")}
          />
        )}
        {isUnclear && (
          <MinusCircleIcon
            size={16}
            weight="fill"
            className={cn("text-yellow-500 shrink-0")}
          />
        )}
        <Badge intent={isFit ? "success" : isGap ? "error" : "warning"}>
          {item.verdict}
        </Badge>
        <Badge intent="default">{item.source}</Badge>

        {item.weight === "high" && (
          <Tooltip content="High priority">
            <ArrowUpIcon
              size={16}
              weight="bold"
              className={cn("text-green-500 shrink-0")}
            />
          </Tooltip>
        )}
        {item.weight === "low" && (
          <Tooltip content="Low priority">
            <ArrowDownIcon
              size={16}
              weight="bold"
              className={cn("text-text-muted shrink-0")}
            />
          </Tooltip>
        )}
        {item.weight && item.weight !== "high" && item.weight !== "low" && (
          <Badge intent="default">{item.weight}</Badge>
        )}
      </div>

      <Text size="sm" weight="medium">
        {item.requirement}
      </Text>

      <blockquote
        className={cn(
          "border-l-2 pl-3 text-sm italic text-text-secondary",
          isFit && "border-green-400",
          isGap && "border-red-400",
          isUnclear && "border-yellow-400",
        )}
      >
        {item.jdQuote}
      </blockquote>

      {displayQuotes.length > 0 && (
        <div className={cn("flex flex-col gap-1")}>
          {displayQuotes.map((quote, i) => (
            <blockquote
              key={i}
              className={cn(
                "border-l-2 border-blue-400 pl-3 text-sm text-text-secondary",
              )}
            >
              {quote}
            </blockquote>
          ))}
        </div>
      )}

      {item.suggestion && (
        <Text size="sm" color="muted">
          Suggestion: {item.suggestion}
        </Text>
      )}
    </div>
  );
}
