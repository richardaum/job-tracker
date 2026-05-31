import { XIcon } from "@phosphor-icons/react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { cn } from "@ui/lib/cn";
import { useId } from "react";
import type { ReactNode } from "react";

export type SideDetailsSide = "left" | "right";

export type SideDetailsLayout = "overlay" | "inline";

export interface SideDetailsProps {
  /**
   * `overlay` — modal slide-over (Radix Dialog). `inline` — column in the document flow next to a list or main pane.
   */
  layout?: SideDetailsLayout;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  children: ReactNode;
  /** Visible heading row; maps to Radix Dialog.Title when overlay, or `<h2>` when inline. */
  title?: ReactNode;
  /**
   * Plain accessible name used when no visible `title` is provided, or alongside a custom `header`.
   */
  accessibilityTitle?: string;
  /** Optional muted line under the default title row. */
  description?: ReactNode;
  /** Replaces the default title + description header block while keeping close chrome. */
  header?: ReactNode;
  /** Pinned footer under the scrolling body (actions, summaries, etc.). */
  footer?: ReactNode;
  side?: SideDetailsSide;
  showCloseButton?: boolean;
  contentClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  overlayClassName?: string;
}

function resolveAccessibilityTitle(params: { accessibilityTitle?: string; title?: ReactNode }): string {
  if (params.accessibilityTitle?.trim()) return params.accessibilityTitle.trim();
  if (typeof params.title === "string" && params.title.trim()) return params.title.trim();
  return "Details";
}

function closeIconButtonClassName() {
  return cn(
    "inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset focus-visible:ring-offset-0",
  );
}

export function SideDetails({
  layout = "overlay",
  open,
  onOpenChange,
  children,
  title,
  accessibilityTitle,
  description,
  header,
  footer,
  side = "right",
  showCloseButton = true,
  contentClassName,
  bodyClassName,
  footerClassName,
  overlayClassName,
}: SideDetailsProps) {
  const titleId = useId();
  const a11yTitle = resolveAccessibilityTitle({ accessibilityTitle, title });

  const hasDescription = typeof description === "string" ? Boolean(description.trim()) : Boolean(description);

  const usesDefaultHeader = header === undefined;
  const showTitleRow = Boolean(title ?? description);

  const headerChromeClassName = showTitleRow || header !== undefined ? cn("pb-3") : cn("pb-0 pt-3");

  const columnClassName = cn(
    "relative flex min-h-0 max-w-md flex-col border-border-subtle bg-bg-surface focus:outline-none sm:max-w-lg",
    layout === "overlay"
      ? cn("fixed top-0 z-50 size-full max-h-dvh shadow-md", side === "right" ? "right-0 border-l" : "left-0 border-r")
      : cn(
          "w-full min-h-0 flex-1 border-t lg:flex-none lg:border-t-0 lg:shrink-0",
          side === "right" ? "lg:border-l" : "lg:border-r",
        ),
    contentClassName,
  );

  const requestClose = () => onOpenChange(false);

  const defaultHeaderContent = usesDefaultHeader && showTitleRow && (
    <div className={cn("space-y-1")}>
      {title !== undefined ? (
        layout === "overlay" ? (
          <RadixDialog.Title className={cn("text-md font-semibold text-text-primary")}>{title}</RadixDialog.Title>
        ) : (
          <h2 id={titleId} className={cn("text-md font-semibold text-text-primary")}>
            {title}
          </h2>
        )
      ) : layout === "overlay" ? (
        <RadixDialog.Title className={cn("sr-only")}>{a11yTitle}</RadixDialog.Title>
      ) : (
        <h2 id={titleId} className={cn("sr-only")}>
          {a11yTitle}
        </h2>
      )}
      {hasDescription ? (
        layout === "overlay" ? (
          <RadixDialog.Description asChild>
            <div className={cn("text-sm text-text-secondary")}>{description}</div>
          </RadixDialog.Description>
        ) : (
          <div className={cn("text-sm text-text-secondary")}>{description}</div>
        )
      ) : null}
    </div>
  );

  const hiddenTitleFallback =
    usesDefaultHeader &&
    !showTitleRow &&
    (layout === "overlay" ? (
      <RadixDialog.Title className={cn("sr-only")}>{a11yTitle}</RadixDialog.Title>
    ) : (
      <h2 id={titleId} className={cn("sr-only")}>
        {a11yTitle}
      </h2>
    ));

  const customHeaderBlock =
    !usesDefaultHeader &&
    (layout === "overlay" ? (
      <>
        <RadixDialog.Title className={cn("sr-only")}>{a11yTitle}</RadixDialog.Title>
        <div>{header}</div>
      </>
    ) : (
      <>
        <h2 id={titleId} className={cn("sr-only")}>
          {a11yTitle}
        </h2>
        <div>{header}</div>
      </>
    ));

  const scrollAndFooter = (
    <>
      <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden border-t border-border-subtle")}>
        <div className={cn("flex-1 overflow-auto px-6 py-4", bodyClassName)}>{children}</div>
      </div>
      {footer ? (
        <div className={cn("shrink-0 border-t border-border-subtle px-6 py-4", footerClassName)}>{footer}</div>
      ) : null}
    </>
  );

  const closeButton = showCloseButton ? (
    layout === "overlay" ? (
      <RadixDialog.Close aria-label="Close side panel" className={closeIconButtonClassName()}>
        <XIcon size={18} weight="regular" />
      </RadixDialog.Close>
    ) : (
      <button type="button" aria-label="Close side panel" className={closeIconButtonClassName()} onClick={requestClose}>
        <XIcon size={18} weight="regular" />
      </button>
    )
  ) : null;

  const closeControl = closeButton ? (
    <div className={cn("flex h-lh shrink-0 items-center text-md leading-normal font-semibold")}>{closeButton}</div>
  ) : null;

  const headerStack = (
    <div className={cn("flex shrink-0 items-start gap-2 border-border-subtle pl-6 pr-4 pt-4", headerChromeClassName)}>
      <div className={cn("flex min-w-0 flex-1 flex-col gap-3")}>
        {defaultHeaderContent}
        {hiddenTitleFallback}
        {customHeaderBlock}
      </div>
      {closeControl}
    </div>
  );

  if (layout === "inline") {
    if (!open) return null;

    return (
      <aside className={columnClassName} aria-labelledby={titleId}>
        {headerStack}
        {scrollAndFooter}
      </aside>
    );
  }

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange} modal>
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className={cn("fixed inset-0 z-40 bg-(--semantic-color-overlay-backdrop)", overlayClassName)}
        />
        <RadixDialog.Content
          className={columnClassName}
          {...(!hasDescription ? { "aria-describedby": undefined } : {})}
        >
          {headerStack}
          {scrollAndFooter}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
