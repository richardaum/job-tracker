import "@testing-library/jest-dom/vitest";

/// <reference types="vitest" />

class ResizeObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

if (!("ResizeObserver" in globalThis)) {
  globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;
}
