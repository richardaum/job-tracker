import { cn } from "@ui/lib/cn";
import type { JSX, KeyboardEventHandler, ReactNode, RefObject } from "react";

type MenuPanelProps = {
  menuRef: RefObject<HTMLElement | null>;
  onKeyDown: KeyboardEventHandler<HTMLElement>;
  children: ReactNode;
  ariaLabel: string;
};

export function MenuPanel({
  menuRef,
  onKeyDown,
  children,
  ariaLabel,
}: MenuPanelProps): JSX.Element {
  return (
    <main
      ref={menuRef}
      className={cn(
        "box-border w-[240px] rounded-none bg-zinc-50 p-1.5 text-zinc-900 shadow-none outline-none focus-visible:outline-none dark:bg-zinc-900 dark:text-zinc-100",
      )}
      role="menu"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {children}
    </main>
  );
}
