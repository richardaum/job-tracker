import { cn } from "@ui/lib/cn";
import type { JSX, MouseEventHandler, ReactNode } from "react";

const menuItemClassNames = {
  base: "h-[34px] w-full cursor-pointer rounded-none border-0 bg-transparent px-2.5 text-left text-[13px] font-normal leading-none text-zinc-900 outline-none active:bg-zinc-300 focus:outline-none focus-visible:outline-none dark:text-zinc-100 dark:active:bg-zinc-700",
  hoverEnabled: "hover:bg-zinc-200 dark:hover:bg-zinc-800",
  keyboardFocus: "focus-visible:bg-zinc-200 dark:focus-visible:bg-zinc-800",
};

type MenuActionButtonProps = {
  itemRef: (node: HTMLButtonElement | null) => void;
  isKeyboardMode: boolean;
  onMouseEnter: () => void;
  onClick: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
};

export function MenuActionButton({
  itemRef,
  isKeyboardMode,
  onMouseEnter,
  onClick,
  children,
}: MenuActionButtonProps): JSX.Element {
  return (
    <button
      type="button"
      className={cn(
        menuItemClassNames.base,
        !isKeyboardMode && menuItemClassNames.hoverEnabled,
        isKeyboardMode && menuItemClassNames.keyboardFocus,
      )}
      role="menuitem"
      ref={itemRef}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
