"use client";

import type { CardProps, TextProps } from "@job-tracker/ui";

import { EmptyStateActionHint } from "./internals/EmptyStateActionHint";
import { EmptyStateDefault } from "./internals/EmptyStateDefault";
import { EmptyStateFiltered } from "./internals/EmptyStateFiltered";
import { EmptyStatePanel } from "./internals/EmptyStatePanel";

type CardOptions = {
  className?: string;
  padding?: CardProps["padding"];
  layout?: "list" | "compact";
};

export type EmptyStateProps =
  | ({ variant: "default"; message: string; detail?: string } & CardOptions)
  | ({
      variant: "actionHint";
      headline: string;
      description?: string;
      actionLabel?: string;
      onAction: () => void;
    } & CardOptions)
  | ({
      variant: "filtered";
      hasActiveFilter: boolean;
      noMatchMessage: string;
      emptyListMessage: string;
      noMatchDetail?: string;
      emptyListDetail?: string;
    } & CardOptions)
  | {
      variant: "panel";
      message: string;
      size?: TextProps["size"];
      color?: Extract<TextProps["color"], "muted" | "secondary">;
    };

/**
 * Single entry for empty UI — use `variant` to pick layout. Do not import from `./internals/`.
 */
export function EmptyState(props: EmptyStateProps) {
  switch (props.variant) {
    case "default":
      return (
        <EmptyStateDefault
          message={props.message}
          detail={props.detail}
          className={props.className}
          padding={props.padding}
          layout={props.layout}
        />
      );
    case "actionHint":
      return (
        <EmptyStateActionHint
          headline={props.headline}
          description={props.description}
          actionLabel={props.actionLabel}
          onAction={props.onAction}
          className={props.className}
          padding={props.padding}
          layout={props.layout}
        />
      );
    case "filtered":
      return (
        <EmptyStateFiltered
          hasActiveFilter={props.hasActiveFilter}
          noMatchMessage={props.noMatchMessage}
          emptyListMessage={props.emptyListMessage}
          noMatchDetail={props.noMatchDetail}
          emptyListDetail={props.emptyListDetail}
          className={props.className}
          padding={props.padding}
          layout={props.layout}
        />
      );
    case "panel":
      return (
        <EmptyStatePanel
          message={props.message}
          size={props.size}
          color={props.color}
        />
      );
  }
}
