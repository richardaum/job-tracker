import { EventEmitter } from "node:events";

import { Injectable, Logger } from "@nestjs/common";

import { ApplicationSummaryStatus } from "./application-summary-status.enum";

export type ApplicationCreatedEvent = { applicationId: string; userId: string };
export type ApplicationUpdatedEvent = { applicationId: string; userId: string };
export type SummaryStatusChangedEvent = {
  applicationId: string;
  userId: string;
  status: ApplicationSummaryStatus;
};

@Injectable()
export class ApplicationEventBus {
  private readonly logger = new Logger(ApplicationEventBus.name);
  private readonly emitter = new EventEmitter();
  private readonly APPLICATION_CREATED = "application.created";
  private readonly APPLICATION_UPDATED = "application.updated";
  private readonly SUMMARY_STATUS_CHANGED = "summary.status.changed";

  emitApplicationCreated(applicationId: string, userId: string): void {
    const event: ApplicationCreatedEvent = { applicationId, userId };
    this.emitter.emit(this.APPLICATION_CREATED, event);
  }

  onApplicationCreated(
    handler: (event: ApplicationCreatedEvent) => void,
  ): void {
    this.emitter.on(this.APPLICATION_CREATED, handler);
  }

  emitApplicationUpdated(applicationId: string, userId: string): void {
    const event: ApplicationUpdatedEvent = { applicationId, userId };
    this.emitter.emit(this.APPLICATION_UPDATED, event);
  }

  onApplicationUpdated(
    handler: (event: ApplicationUpdatedEvent) => void,
  ): void {
    this.emitter.on(this.APPLICATION_UPDATED, handler);
  }

  removeApplicationUpdatedListener(
    handler: (event: ApplicationUpdatedEvent) => void,
  ): void {
    this.emitter.off(this.APPLICATION_UPDATED, handler);
  }

  emitSummaryStatusChanged(
    applicationId: string,
    userId: string,
    status: ApplicationSummaryStatus,
  ): void {
    const event: SummaryStatusChangedEvent = { applicationId, userId, status };
    this.emitter.emit(this.SUMMARY_STATUS_CHANGED, event);
  }

  onSummaryStatusChanged(
    handler: (event: SummaryStatusChangedEvent) => void,
  ): void {
    this.emitter.on(this.SUMMARY_STATUS_CHANGED, handler);
  }

  removeSummaryStatusChangedListener(
    handler: (event: SummaryStatusChangedEvent) => void,
  ): void {
    this.emitter.off(this.SUMMARY_STATUS_CHANGED, handler);
  }
}
