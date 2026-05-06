import * as Menu from "@radix-ui/react-menu";
import type { InputProps } from "@ui/components/Input/Input";
import { Input as TextInput } from "@ui/components/Input/Input";
import { cn } from "@ui/lib/cn";
import { returnComboboxFocusToInputOnFirstItemArrowUp } from "@ui/lib/focusRadixMenuItem";
import { useMenuAnchoredCombobox } from "@ui/lib/menuAnchoredCombobox";
import React, {
  createContext,
  type Dispatch,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  type SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const MENU_CONTENT_BASE = cn(
  "min-w-(--radix-popper-anchor-width) max-h-60 overflow-auto rounded-md border border-border-subtle bg-bg-surface shadow-md",
);

type AnchoredComboboxContextValue = {
  value: string;
  onValueChange: (next: string) => void;
  normalizeInput: (raw: string) => string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  menuOpen: boolean;
  disabled?: boolean;
  hasItems: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  menuContentRef: RefObject<HTMLDivElement | null>;
  anchoredMenuDismissLayerProps: ReturnType<
    typeof useMenuAnchoredCombobox
  >["anchoredMenuDismissLayerProps"];
  createInputKeyDownHandler: ReturnType<
    typeof useMenuAnchoredCombobox
  >["createInputKeyDownHandler"];
};

const AnchoredComboboxContext =
  createContext<AnchoredComboboxContextValue | null>(null);

function useAnchoredComboboxCtx(): AnchoredComboboxContextValue {
  const ctx = useContext(AnchoredComboboxContext);
  if (!ctx) {
    throw new Error(
      "`AnchoredCombobox` primitives must render inside `<AnchoredCombobox.Root>`.",
    );
  }
  return ctx;
}

export type AnchoredComboboxRootProps = {
  children: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  hasItems: boolean;
  disabled?: boolean;
  normalizeInput?: (raw: string) => string;
};

function Root({
  children,
  value,
  onValueChange,
  onOpenChange,
  hasItems,
  disabled,
  normalizeInput = (raw: string): string => raw,
}: AnchoredComboboxRootProps) {
  const [open, setOpen] = useState(false);
  const {
    inputRef,
    menuContentRef,
    anchoredMenuDismissLayerProps,
    createInputKeyDownHandler,
  } = useMenuAnchoredCombobox();

  const menuOpen = open && hasItems;

  const contextValue = useMemo(
    (): AnchoredComboboxContextValue => ({
      value,
      onValueChange,
      normalizeInput,
      open,
      setOpen,
      menuOpen,
      disabled,
      hasItems,
      inputRef,
      menuContentRef,
      anchoredMenuDismissLayerProps,
      createInputKeyDownHandler,
    }),
    [
      anchoredMenuDismissLayerProps,
      createInputKeyDownHandler,
      disabled,
      hasItems,
      inputRef,
      menuContentRef,
      menuOpen,
      normalizeInput,
      onValueChange,
      open,
      value,
    ],
  );

  return (
    <AnchoredComboboxContext.Provider value={contextValue}>
      <Menu.Root
        modal={false}
        open={menuOpen}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          onOpenChange?.(nextOpen);
        }}
      >
        {children}
      </Menu.Root>
    </AnchoredComboboxContext.Provider>
  );
}

export type AnchoredComboboxInputProps = Omit<
  InputProps,
  | "value"
  | "defaultValue"
  | "onChange"
  | "onKeyDown"
  | "onClick"
  | "ref"
  | "disabled"
> & { ignoreBlurWithinMenu?: boolean };

/** Anchors the input under `Menu.Root` and wires menu open + keyboard routing. */
function ComboInput(props: AnchoredComboboxInputProps): React.ReactElement {
  const { ignoreBlurWithinMenu = false, onBlur, ...inputProps } = props;
  const {
    value,
    onValueChange,
    normalizeInput,
    open,
    setOpen,
    disabled,
    hasItems,
    menuOpen,
    inputRef,
    createInputKeyDownHandler,
  } = useAnchoredComboboxCtx();

  const onInputKeyDown = createInputKeyDownHandler({
    disabled,
    hasItems,
    open,
    menuOpen,
    setOpen,
  });

  return (
    <Menu.Anchor asChild>
      <TextInput
        {...inputProps}
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onValueChange(normalizeInput(e.target.value));
          if (!open) setOpen(true);
        }}
        onClick={() => {
          if (hasItems && !open) setOpen(true);
        }}
        onKeyDown={onInputKeyDown}
        onBlur={(event) => {
          if (ignoreBlurWithinMenu) {
            const relatedRole =
              (event.relatedTarget as HTMLElement | null)?.getAttribute(
                "role",
              ) ?? null;
            if (relatedRole === "menuitem" || relatedRole === "menu") {
              return;
            }
          }
          onBlur?.(event);
        }}
        disabled={disabled}
      />
    </Menu.Anchor>
  );
}

function ComboPortal({ children }: { children: ReactNode }) {
  return <Menu.Portal>{children}</Menu.Portal>;
}

export type AnchoredComboboxContentProps = {
  children: ReactNode;
  className?: string;
};

function ComboContent({ children, className }: AnchoredComboboxContentProps) {
  const { menuContentRef, anchoredMenuDismissLayerProps } =
    useAnchoredComboboxCtx();

  return (
    <Menu.Content
      ref={menuContentRef}
      align="start"
      sideOffset={4}
      {...anchoredMenuDismissLayerProps}
      className={cn(MENU_CONTENT_BASE, className)}
    >
      {children}
    </Menu.Content>
  );
}

export type AnchoredComboboxListProps = {
  children: ReactNode;
  className?: string;
};

function ComboList({ children, className }: AnchoredComboboxListProps) {
  return <div className={cn("flex flex-col", className)}>{children}</div>;
}

export type AnchoredComboboxItemProps = React.ComponentPropsWithoutRef<
  typeof Menu.Item
>;

function ComboItem({
  className,
  onKeyDown,
  ...props
}: AnchoredComboboxItemProps): React.ReactElement {
  const { menuContentRef, inputRef } = useAnchoredComboboxCtx();

  const mergedKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      returnComboboxFocusToInputOnFirstItemArrowUp(
        e,
        menuContentRef.current,
        inputRef.current,
      );
      onKeyDown?.(e);
    },
    [menuContentRef, inputRef, onKeyDown],
  );

  return (
    <Menu.Item className={className} {...props} onKeyDown={mergedKeyDown} />
  );
}

/**
 * Compound primitives for a Radix `Menu`-anchored text combobox:
 * compose `Root` → (`Input`, `Portal` → `Content` → `List` → `Item`…).
 */
export const AnchoredCombobox = {
  Root,
  Input: ComboInput,
  Portal: ComboPortal,
  Content: ComboContent,
  List: ComboList,
  Item: ComboItem,
};
