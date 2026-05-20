"use client";

import { Card, cn, Text } from "@job-tracker/ui";
import React from "react";

import { FitVerdict } from "@/gql/hooks";

import { RelevanceIcon } from "./RelevanceIcon";
import { SourceBadge } from "./SourceBadge";
import { VerdictBadge } from "./VerdictBadge";

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
  const isFit = item.verdict === FitVerdict.Fit;
  const isGap = item.verdict === FitVerdict.Gap;
  const isUnclear = item.verdict === FitVerdict.Unclear;

  const displayQuotes = item.sourceQuotes.filter(
    (quote) =>
      quote.trim().toLowerCase() !== item.requirement.trim().toLowerCase(),
  );

  return (
    <Card className={cn("flex flex-col gap-2")} padding="sm">
      <div className={cn("flex items-center gap-1")}>
        <VerdictBadge verdict={item.verdict} />
        <div className={cn("ml-auto flex items-center gap-2")}>
          <SourceBadge
            source={item.source}
            resumeId={resumeId}
            onPreferenceClick={onPreferenceClick}
          />
          <RelevanceIcon weight={item.weight} type={item.type} />
        </div>
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
    </Card>
  );
}
