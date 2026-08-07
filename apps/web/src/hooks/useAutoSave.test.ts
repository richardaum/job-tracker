import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAutoSave } from "./useAutoSave";

describe("useAutoSave", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("saves only after the value stays unchanged for the configured delay", async () => {
    vi.useFakeTimers();
    const save = vi.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(({ value }) => useAutoSave({ value, save, delayMs: 800 }), {
      initialProps: { value: "Initial description" },
    });

    rerender({ value: "First edit" });
    rerender({ value: "Final edit" });

    expect(result.current.autoSaveStatus).toBe("pending");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith("Final edit");
    expect(result.current.autoSaveStatus).toBe("saved");
  });

  it("saves the newest value after an in-flight save completes", async () => {
    vi.useFakeTimers();
    let finishFirstSave: (() => void) | undefined;
    const save = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            finishFirstSave = resolve;
          }),
      )
      .mockResolvedValueOnce(undefined);
    const { rerender } = renderHook(({ value }) => useAutoSave({ value, save, delayMs: 800 }), {
      initialProps: { value: "Initial description" },
    });

    rerender({ value: "First edit" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    rerender({ value: "Latest edit" });

    await act(async () => {
      finishFirstSave?.();
      await Promise.resolve();
    });

    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith("Latest edit");
  });
});
