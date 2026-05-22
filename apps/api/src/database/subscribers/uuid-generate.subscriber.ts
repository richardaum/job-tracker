import { randomUUID } from "node:crypto";

import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from "typeorm";

@EventSubscriber()
export class UuidGenerateSubscriber implements EntitySubscriberInterface {
  beforeInsert(event: InsertEvent<{ id?: string }>): void {
    if (!event.entity.id) {
      event.entity.id = randomUUID();
    }
  }
}
