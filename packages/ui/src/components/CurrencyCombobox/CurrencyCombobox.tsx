import { AnchoredCombobox } from "@ui/components/Combobox/AnchoredCombobox";
import { Text } from "@ui/components/Typography/Text";
import { cn } from "@ui/lib/cn";
import { useCallback, useEffect, useRef } from "react";
import type { FocusEventHandler } from "react";

export type CurrencyPreset = {
  /** ISO 4217 code */
  code: string;
  name: string;
  /** Unicode regional flag / flag emoji for the option row */
  flag: string;
};

/** Major reserve / FX-traded currencies for quick pick; custom codes can still be typed. */
export const MAIN_MARKET_CURRENCY_PRESETS: CurrencyPreset[] = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "BRL", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
];

export interface CurrencyComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onOpenChange?: (open: boolean) => void;
  presets?: CurrencyPreset[];
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  state?: "default" | "error";
  id?: string;
  autoComplete?: string;
  maxLength?: number;
}

export function CurrencyCombobox({
  value,
  onValueChange,
  onBlur,
  onOpenChange,
  presets = MAIN_MARKET_CURRENCY_PRESETS,
  placeholder,
  disabled,
  size = "md",
  state = "default",
  id,
  autoComplete = "one-time-code",
  maxLength = 3,
}: CurrencyComboboxProps) {
  const currentFlag = presets.find((p) => p.code === value)?.flag;
  const normalizedQuery = value.trim().toLowerCase();
  const lastValidValueRef = useRef<string>(value);

  const filteredPresets = !normalizedQuery
    ? presets
    : presets.filter(
        (preset) =>
          preset.code.toLowerCase().includes(normalizedQuery) || preset.name.toLowerCase().includes(normalizedQuery),
      );
  const isValidCode = useCallback(
    (candidate: string): boolean => presets.some((preset) => preset.code === candidate),
    [presets],
  );

  useEffect(() => {
    if (isValidCode(value)) {
      lastValidValueRef.current = value;
    }
  }, [isValidCode, value]);

  const handleInputBlur: FocusEventHandler<HTMLInputElement> = (event) => {
    if (!isValidCode(value)) {
      onValueChange(lastValidValueRef.current);
    }

    onBlur?.(event);
  };

  const handleRootOpenChange = (open: boolean) => {
    onOpenChange?.(open);
    if (!open && !isValidCode(value)) {
      onValueChange(lastValidValueRef.current);
    }
  };

  return (
    <AnchoredCombobox.Root
      value={value}
      onValueChange={onValueChange}
      onOpenChange={handleRootOpenChange}
      hasItems={filteredPresets.length > 0}
      disabled={disabled}
      normalizeInput={(raw) => raw.toUpperCase().slice(0, maxLength)}
    >
      <AnchoredCombobox.Input
        placeholder={placeholder}
        size={size}
        state={state}
        id={id}
        ignoreBlurWithinMenu
        onBlur={handleInputBlur}
        autoComplete={autoComplete}
        maxLength={maxLength}
        spellCheck={false}
        leading={currentFlag ? <span aria-hidden>{currentFlag}</span> : undefined}
      />
      <AnchoredCombobox.Portal>
        <AnchoredCombobox.Content className={cn("z-100 p-0.5")}>
          <AnchoredCombobox.List className={cn("gap-px py-px")}>
            {filteredPresets.map((preset) => (
              <AnchoredCombobox.Item
                key={preset.code}
                textValue={`${preset.code} ${preset.name}`}
                onSelect={() => {
                  onValueChange(preset.code);
                }}
                className={cn(
                  "flex w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-sm px-2 py-1 text-left outline-none hover:bg-bg-surface-hover data-highlighted:bg-bg-surface-hover",
                )}
              >
                <span className={cn("shrink-0 text-base leading-none")} aria-hidden>
                  {preset.flag}
                </span>
                <span className={cn("flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden whitespace-nowrap")}>
                  <Text as="span" size="sm" weight="medium" className={cn("shrink-0")}>
                    {preset.code}
                  </Text>
                  <Text as="span" size="sm" color="muted" className={cn("min-w-0 truncate")}>
                    {preset.name}
                  </Text>
                </span>
              </AnchoredCombobox.Item>
            ))}
          </AnchoredCombobox.List>
        </AnchoredCombobox.Content>
      </AnchoredCombobox.Portal>
    </AnchoredCombobox.Root>
  );
}
