import { EventEmitter } from "node:events";

import { DraftApplicationConversionStatus } from "@api/database/entities/draft-application.entity";
import { Injectable } from "@nestjs/common";

export type DraftConversionStatusChangedEvent = {
  draftId: string;
  userId: string;
  status: DraftApplicationConversionStatus;
};

export type DraftConversionRequestedEvent = { draftId: string; userId: string };

@Injectable()
export class DraftApplicationEventBus {
  private readonly emitter = new EventEmitter();
  private readonly DRAFT_CONVERSION_STATUS_CHANGED =
    "draft.conversion.status.changed";
  private readonly DRAFT_CONVERSION_REQUESTED = "draft.conversion.requested";

  emitDraftConversionStatusChanged(
    draftId: string,
    userId: string,
    status: DraftApplicationConversionStatus,
  ): void {
    const event: DraftConversionStatusChangedEvent = {
      draftId,
      userId,
      status,
    };
    this.emitter.emit(this.DRAFT_CONVERSION_STATUS_CHANGED, event);
  }

  onDraftConversionStatusChanged(
    handler: (event: DraftConversionStatusChangedEvent) => void,
  ): void {
    this.emitter.on(this.DRAFT_CONVERSION_STATUS_CHANGED, handler);
  }

  removeDraftConversionStatusChangedListener(
    handler: (event: DraftConversionStatusChangedEvent) => void,
  ): void {
    this.emitter.off(this.DRAFT_CONVERSION_STATUS_CHANGED, handler);
  }

  emitDraftConversionRequested(draftId: string, userId: string): void {
    const event: DraftConversionRequestedEvent = { draftId, userId };
    this.emitter.emit(this.DRAFT_CONVERSION_REQUESTED, event);
  }

  onDraftConversionRequested(
    handler: (event: DraftConversionRequestedEvent) => void,
  ): void {
    this.emitter.on(this.DRAFT_CONVERSION_REQUESTED, handler);
  }
}
