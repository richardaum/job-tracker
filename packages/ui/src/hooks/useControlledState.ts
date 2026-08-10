"use client";

import { useState } from "react";

export function useControlledState<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (value: T) => void] {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue ?? internalValue;

  function setValue(next: T) {
    if (controlledValue === undefined) {
      setInternalValue(next);
    }
    onChange?.(next);
  }

  return [value, setValue];
}
