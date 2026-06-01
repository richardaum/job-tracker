import { useState } from "react";

interface UseControllableStateOptions<T> {
  value?: T;
  defaultValue: T;
  onChange?: (nextValue: T) => void;
}

export function useControllableState<T>({ value, defaultValue, onChange }: UseControllableStateOptions<T>) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;

  const setValue = (nextValue: T) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  };

  return [currentValue, setValue] as const;
}
