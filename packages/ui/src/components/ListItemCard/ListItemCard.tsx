import { Slot } from "@radix-ui/react-slot";
import { Card } from "@ui/components/Card/Card";
import { cn } from "@ui/lib/cn";
import React from "react";

/** Default `IconButton` chrome for list row actions (matches job list cards). */
export const listItemCardActionIconButtonClassName = cn(
  "size-6 text-text-muted/80 hover:text-text-muted",
);

/** Row title scale: `base` (jobs, companies, importers) vs `sm` (drafts, nested template rows). */
export type ListItemCardTitleSize = "base" | "sm";

function titleSizeClassName(size: ListItemCardTitleSize): string {
  return size === "sm" ? "text-sm" : "text-base";
}

function titleTextClassName(size: ListItemCardTitleSize): string {
  return cn(
    "min-w-0 truncate font-medium text-text-primary",
    titleSizeClassName(size),
  );
}

function titleInteractiveClassName(size: ListItemCardTitleSize): string {
  return cn(
    "inline-flex max-w-full min-w-0 rounded-sm font-medium text-text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-0",
    titleSizeClassName(size),
  );
}

export interface ListItemCardTitleProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Row title scale.
   * App usage: `base` for primary lists (jobs, companies, importers); `sm` for draft rows and nested template rows.
   */
  size?: ListItemCardTitleSize;
  /**
   * When true, applies hover/focus styles and interactive layout.
   * Automatically true if `asChild` is present.
   */
  interactive?: boolean;
  /** Set to true when passing an interactive element (like a link or button) as a child. */
  asChild?: boolean;
  children: React.ReactNode;
}

export function ListItemCardTitle({
  className,
  size = "base",
  interactive = false,
  asChild = false,
  children,
  ...props
}: ListItemCardTitleProps) {
  const isInteractive = interactive || asChild;
  const Comp = asChild ? Slot : "span";
  const baseClassName = isInteractive
    ? titleInteractiveClassName(size)
    : titleTextClassName(size);

  return (
    <Comp className={cn(baseClassName, className)} {...props}>
      {children}
    </Comp>
  );
}

export interface ListItemCardActionProps {
  className?: string;
  children: React.ReactNode;
}

export function ListItemCardAction({
  className,
  children,
}: ListItemCardActionProps) {
  return <div className={cn("shrink-0", className)}>{children}</div>;
}

export interface ListItemCardActionsProps {
  className?: string;
  children: React.ReactNode;
}

export function ListItemCardActions({
  children,
  className,
}: ListItemCardActionsProps) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <div className={cn("flex shrink-0 items-center gap-1", className)}>
      {items.map((child, index) =>
        React.isValidElement(child) && child.type === ListItemCardAction ? (
          child
        ) : (
          <ListItemCardAction key={index}>{child}</ListItemCardAction>
        ),
      )}
    </div>
  );
}

export interface ListItemCardProps {
  /**
   * Use `ListItemCard.Title` only — keeps row typography consistent.
   */
  title: React.ReactNode;
  /** Optional row actions; when present must be `<ListItemCard.Actions>...</ListItemCard.Actions>`. */
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

function warnIfListItemCardCompositionViolates(props: ListItemCardProps): void {
  const isDev =
    typeof process !== "undefined" && process.env.NODE_ENV === "development";
  if (!isDev) return;

  const titleSegments = React.Children.toArray(props.title);
  const invalidTitle = titleSegments.some(
    (child) => !React.isValidElement(child) || child.type !== ListItemCardTitle,
  );
  if (invalidTitle) {
    console.warn(
      "[ListItemCard] Pass `title` using only `ListItemCard.Title`.",
    );
  }

  const { actions } = props;
  if (actions == null) return;
  if (!React.isValidElement(actions) || actions.type !== ListItemCardActions) {
    console.warn(
      "[ListItemCard] Wrap row actions in `<ListItemCard.Actions>...</ListItemCard.Actions>`.",
    );
  }
}

function ListItemCardRoot({
  title,
  actions,
  meta,
  description,
  className,
}: ListItemCardProps) {
  warnIfListItemCardCompositionViolates({
    title,
    actions,
    meta,
    description,
    className,
  });

  return (
    <Card padding="sm" className={className}>
      <div
        className={cn(
          "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <div className={cn("flex min-w-0 flex-col gap-1")}>
          <div className={cn("flex min-w-0 flex-wrap items-center gap-2")}>
            {title}
            {actions}
          </div>
          {meta ? (
            <div className={cn("flex min-w-0 flex-wrap items-center gap-2")}>
              {meta}
            </div>
          ) : null}
          {description ? (
            <div className={cn("min-w-0")}>{description}</div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export const ListItemCard: typeof ListItemCardRoot & {
  Title: typeof ListItemCardTitle;
  Actions: typeof ListItemCardActions;
  Action: typeof ListItemCardAction;
  actionIconButtonClassName: typeof listItemCardActionIconButtonClassName;
} = Object.assign(ListItemCardRoot, {
  Title: ListItemCardTitle,
  Actions: ListItemCardActions,
  Action: ListItemCardAction,
  actionIconButtonClassName: listItemCardActionIconButtonClassName,
});
