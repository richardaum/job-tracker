import { beforeEach, describe, expect, it, vi } from "vitest";

import { LogService } from "./log.service";

describe("LogService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("debug logs to console with level=debug", () => {
    const log = new LogService({ level: "debug" });
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    // eslint-disable-next-line testing-library/no-debugging-utils
    log.debug("test message", "extra", 42);

    expect(spy).toHaveBeenCalledWith("test message", "extra", 42);
  });

  it("debug does nothing when level=off", () => {
    const log = new LogService({ level: "off" });
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    // eslint-disable-next-line testing-library/no-debugging-utils
    log.debug("should not appear");

    expect(spy).not.toHaveBeenCalled();
  });

  it("warn logs to console.warn with level=warn", () => {
    const log = new LogService({ level: "warn" });
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

    log.warn("warning", { detail: "something" });

    expect(spy).toHaveBeenCalledWith("warning", { detail: "something" });
  });

  it("warn is suppressed when level=error (higher than warn)", () => {
    const log = new LogService({ level: "error" });
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

    log.warn("should not appear");

    expect(spy).not.toHaveBeenCalled();
  });

  it("error logs to console.error with level=error", () => {
    const log = new LogService({ level: "error" });
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    log.error("error!", new Error("boom"));

    expect(spy).toHaveBeenCalledWith("error!", expect.any(Error));
  });

  it("error is suppressed when level=off", () => {
    const log = new LogService({ level: "off" });
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    log.error("silent");

    expect(spy).not.toHaveBeenCalled();
  });

  it("includes prefix in log output", () => {
    const log = new LogService({ prefix: "[Test]", level: "debug" });
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    // eslint-disable-next-line testing-library/no-debugging-utils
    log.debug("hello");

    expect(spy).toHaveBeenCalledWith("[Test]", "hello");
  });

  it("defaults to 'off' level when no params", () => {
    const log = new LogService();
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    // eslint-disable-next-line testing-library/no-debugging-utils
    log.debug("nope");

    expect(spy).not.toHaveBeenCalled();
  });

  it("error logs when level=warn (error is more severe)", () => {
    const log = new LogService({ level: "warn" });
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    log.error("critical");

    expect(spy).toHaveBeenCalledWith("critical");
  });
});
