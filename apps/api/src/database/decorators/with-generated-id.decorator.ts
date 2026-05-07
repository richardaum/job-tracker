import { randomUUID } from "node:crypto";

import { BeforeInsert } from "typeorm";

type EntityWithOptionalId = { id?: string };

export function WithGeneratedId(): ClassDecorator {
  return (target) => {
    const prototype = target.prototype as EntityWithOptionalId;

    if (typeof (prototype as { setId?: unknown }).setId !== "function") {
      Object.defineProperty(prototype, "setId", {
        value: function setId(this: EntityWithOptionalId): void {
          if (!this.id) {
            this.id = randomUUID();
          }
        },
        configurable: true,
        writable: true,
      });
    }

    BeforeInsert()(prototype, "setId");
  };
}
