import React, { useMemo } from "react";

import { cn } from "@ui/lib/cn";
import { AnchoredCombobox } from "../Combobox/AnchoredCombobox";
import { Text } from "../Typography/Text";

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
];

export interface CurrencyComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
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
  presets = MAIN_MARKET_CURRENCY_PRESETS,
  placeholder,
  disabled,
  size = "md",
  state = "default",
  id,
  autoComplete = "one-time-code",
  maxLength = 3,
}: CurrencyComboboxProps) {
  const normalizedQuery = value.trim().toLowerCase();

  const filteredPresets = useMemo(() => {
    if (!normalizedQuery) return presets;
    return presets.filter(
      (p) =>
        p.code.toLowerCase().includes(normalizedQuery) ||
        p.name.toLowerCase().includes(normalizedQuery),
    );
  }, [presets, normalizedQuery]);

  return (
    <AnchoredCombobox.Root
      value={value}
      onValueChange={onValueChange}
      hasItems={filteredPresets.length > 0}
      disabled={disabled}
      normalizeInput={(raw) => raw.toUpperCase().slice(0, maxLength)}
    >
      <AnchoredCombobox.Input
        placeholder={placeholder}
        size={size}
        state={state}
        id={id}
        autoComplete={autoComplete}
        maxLength={maxLength}
        spellCheck={false}
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
                <span
                  className={cn("shrink-0 text-base leading-none")}
                  aria-hidden
                >
                  {preset.flag}
                </span>
                <span
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden whitespace-nowrap",
                  )}
                >
                  <Text
                    as="span"
                    size="sm"
                    weight="medium"
                    className={cn("shrink-0")}
                  >
                    {preset.code}
                  </Text>
                  <Text
                    as="span"
                    size="sm"
                    color="muted"
                    className={cn("min-w-0 truncate")}
                  >
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
