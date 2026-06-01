import * as RadixRadioGroup from "@radix-ui/react-radio-group";
import { cn } from "@ui/lib/cn";

export interface RadioOption {
  label: string;
  value: string;
}

export interface RadioProps {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  orientation?: "horizontal" | "vertical";
}

export function Radio({
  options,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  name,
  orientation = "horizontal",
}: RadioProps) {
  return (
    <RadixRadioGroup.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      name={name}
      orientation={orientation}
      className={cn("flex gap-4", orientation === "vertical" ? "flex-col" : "flex-row")}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn("flex cursor-pointer items-center gap-2", disabled && "cursor-not-allowed opacity-60")}
        >
          <RadixRadioGroup.Item
            value={option.value}
            id={`radio-${option.value}`}
            className={cn(
              "flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-default bg-bg-surface transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-60",
              "data-[state=checked]:border-border-brand data-[state=checked]:bg-bg-brand",
            )}
          >
            <RadixRadioGroup.Indicator className={cn("flex size-2 rounded-full bg-text-inverted")} />
          </RadixRadioGroup.Item>
          <span className={cn("text-sm text-text-primary")}>{option.label}</span>
        </label>
      ))}
    </RadixRadioGroup.Root>
  );
}
