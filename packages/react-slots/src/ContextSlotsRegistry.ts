import type { ReactNode } from "react";

export class ContextSlotsRegistry {
  private _contents = new Map<symbol, ReactNode>();
  private _listeners = new Set<() => void>();

  get(id: symbol): ReactNode | undefined {
    return this._contents.get(id);
  }

  set(id: symbol, content: ReactNode) {
    this._contents.set(id, content);
    this._emit();
  }

  delete(id: symbol) {
    this._contents.delete(id);
    this._emit();
  }

  /** Stable reference for useSyncExternalStore — do not use `.bind()` (new function each call → resubscribe loop). */
  subscribe = (listener: () => void) => {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  };

  private _emit() {
    for (const listener of this._listeners) {
      listener();
    }
  }
}
