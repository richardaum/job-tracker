import "@testing-library/jest-dom";

import { vi } from "vitest";

/**
 * ProseMirror / TipTap rely on layout APIs that jsdom does not implement. Without these
 * stubs, `@testing-library/user-event` on ProseMirror often throws (e.g.
 * `elementFromPoint`, `getClientRects`) or misbehaves — see
 * https://github.com/ueberdosis/tiptap/discussions/4008
 */
const zeroRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  toJSON: () => ({ ...zeroRect }),
} as DOMRect;

const emptyClientRects = {
  length: 0,
  item: () => null,
  [Symbol.iterator]: (): IterableIterator<DOMRect> => [][Symbol.iterator](),
} as unknown as DOMRectList;

function stubGetBoundingClientRect() {
  return zeroRect;
}

function stubGetClientRects() {
  return emptyClientRects;
}

globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

HTMLElement.prototype.getBoundingClientRect = stubGetBoundingClientRect;
HTMLElement.prototype.getClientRects = stubGetClientRects;
Range.prototype.getBoundingClientRect = stubGetBoundingClientRect;
Range.prototype.getClientRects = stubGetClientRects;

Document.prototype.elementFromPoint = vi.fn(() => null);
