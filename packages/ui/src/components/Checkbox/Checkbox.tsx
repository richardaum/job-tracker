import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { cn } from "@ui/lib/cn";

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  value?: string;
  state?: "default" | "error";
  size?: "sm" | "md";
}

const sizeClasses: Record<NonNullable<CheckboxProps["size"]>, string> = { sm: "size-4", md: "size-5" };

const stateClasses: Record<NonNullable<CheckboxProps["state"]>, string> = {
  default: "border-border-default data-[state=checked]:border-border-brand data-[state=checked]:bg-bg-brand",
  error: "border-border-error data-[state=checked]:border-border-error data-[state=checked]:bg-bg-error-subtle",
};

function toBoolean(value: boolean | "indeterminate"): boolean {
  return value === true;
}

export function Checkbox({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  required = false,
  id,
  name,
  value,
  state = "default",
  size = "md",
}: CheckboxProps) {
  return (
    <RadixCheckbox.Root
      id={id}
      name={name}
      value={value}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onCheckedChange ? (next) => onCheckedChange(toBoolean(next)) : undefined}
      disabled={disabled}
      required={required}
      className={cn(
        `inline-flex cursor-pointer items-center justify-center rounded-sm border bg-bg-surface text-text-inverted shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses[size]} ${stateClasses[state]}`,
      )}
    >
      <RadixCheckbox.Indicator className={cn("text-[10px] font-bold leading-none text-text-inverted")}>
        ✓
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}
