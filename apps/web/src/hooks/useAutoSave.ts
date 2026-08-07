import { tryRun } from "@job-tracker/try-run";
import { useEffect, useRef, useState } from "react";

const DEFAULT_DELAY_MS = 800;

export type AutoSaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

type UseAutoSaveOptions<Value> = {
  value: Value;
  save: (value: Value) => Promise<void>;
  delayMs?: number;
  isEqual?: (left: Value, right: Value) => boolean;
  onSaved?: () => void;
  onError?: () => void;
};

const areValuesEqual = <Value>(left: Value, right: Value) => Object.is(left, right);

/**
 * Persists a changing value after a short idle period. Only one request runs at
 * a time; if the value changes while saving, the newest value is saved next.
 */
export function useAutoSave<Value>({
  value,
  save,
  delayMs = DEFAULT_DELAY_MS,
  isEqual = areValuesEqual,
  onSaved,
  onError,
}: UseAutoSaveOptions<Value>) {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const latestValueRef = useRef(value);
  const savedValueRef = useRef(value);
  const isSavingRef = useRef(false);
  const saveRef = useRef(save);
  const onSavedRef = useRef(onSaved);
  const onErrorRef = useRef(onError);
  const isEqualRef = useRef(isEqual);
  const mountedRef = useRef(true);

  async function saveLatestValue() {
    if (isSavingRef.current) {
      return;
    }

    const valueToSave = latestValueRef.current;
    if (isEqualRef.current(valueToSave, savedValueRef.current)) {
      return;
    }

    isSavingRef.current = true;
    if (mountedRef.current) {
      setStatus("saving");
    }

    const [error] = await tryRun(saveRef.current(valueToSave));
    isSavingRef.current = false;

    if (error) {
      if (mountedRef.current) {
        setStatus("error");
      }
      onErrorRef.current?.();
    } else {
      savedValueRef.current = valueToSave;
      onSavedRef.current?.();
      if (mountedRef.current) {
        setStatus(isEqualRef.current(latestValueRef.current, valueToSave) ? "saved" : "pending");
      }
    }

    if (!isEqualRef.current(latestValueRef.current, valueToSave)) {
      void saveLatestValue();
    }
  }

  useEffect(() => {
    saveRef.current = save;
    onSavedRef.current = onSaved;
    onErrorRef.current = onError;
    isEqualRef.current = isEqual;
  }, [isEqual, onError, onSaved, save]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    latestValueRef.current = value;

    if (isEqual(value, savedValueRef.current)) {
      return;
    }

    setStatus("pending");
    const timeout = window.setTimeout(() => void saveLatestValue(), delayMs);
    return () => window.clearTimeout(timeout);
  }, [delayMs, isEqual, value]);

  return { autoSaveStatus: status };
}
