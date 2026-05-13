import { EventEmitter } from "node:events";

import { Injectable, Logger } from "@nestjs/common";

export type ApplicationCreatedEvent = { applicationId: string; userId: string };

@Injectable()
export class ApplicationEventBus {
  private readonly logger = new Logger(ApplicationEventBus.name);
  private readonly emitter = new EventEmitter();
  private readonly APPLICATION_CREATED = "application.created";

  emitApplicationCreated(applicationId: string, userId: string): void {
    const event: ApplicationCreatedEvent = { applicationId, userId };
    this.emitter.emit(this.APPLICATION_CREATED, event);
  }

  onApplicationCreated(
    handler: (event: ApplicationCreatedEvent) => void,
  ): void {
    this.emitter.on(this.APPLICATION_CREATED, handler);
  }
}
