"use client";

import { Card, cn, Text, Tooltip } from "@job-tracker/ui";
import { ArrowDownIcon, ArrowUpIcon } from "@phosphor-icons/react";
import React from "react";

import { SourceBadge } from "@/modules/applications/details/components/SourceBadge";
import { TypeBadge } from "@/modules/applications/details/components/TypeBadge";
import { VerdictBadge } from "@/modules/applications/details/components/VerdictBadge";

export interface FitItem {
  verdict: string;
  source: string;
  weight?: string | null;
  type?: string | null;
  requirement: string;
  jdQuote: string;
  sourceQuotes: string[];
  suggestion?: string | null;
}

export function FitItemCard({
  item,
  resumeId,
  onPreferenceClick,
}: {
  item: FitItem;
  resumeId?: string;
  onPreferenceClick?: () => void;
}) {
  const isFit = item.verdict === "fit";
  const isGap = item.verdict === "gap";
  const isUnclear = item.verdict === "unclear";

  const displayQuotes = item.sourceQuotes.filter(
    (quote) =>
      quote.trim().toLowerCase() !== item.requirement.trim().toLowerCase(),
  );

  return (
    <Card className={cn("flex flex-col gap-2")} padding="sm">
      <div className={cn("flex items-center gap-2")}>
        <VerdictBadge verdict={item.verdict} />
        <SourceBadge
          source={item.source}
          resumeId={resumeId}
          onPreferenceClick={onPreferenceClick}
        />
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
          <Text size="sm" color="muted">
            {item.weight}
          </Text>
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

      {item.type && item.source === "resume" && <TypeBadge type={item.type} />}
    </Card>
  );
}
