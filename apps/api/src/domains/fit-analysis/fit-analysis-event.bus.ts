import { EventEmitter } from "node:events";

import { FitAnalysisStatus } from "@api/database/entities/fit-analysis.entity";
import { Injectable } from "@nestjs/common";

export type FitStatusChangedEvent = {
  fitId: string;
  userId: string;
  status: FitAnalysisStatus;
};

@Injectable()
export class FitAnalysisEventBus {
  private readonly emitter = new EventEmitter();
  private readonly FIT_STATUS_CHANGED = "fit.status.changed";

  emitFitStatusChanged(
    fitId: string,
    userId: string,
    status: FitAnalysisStatus,
  ): void {
    const event: FitStatusChangedEvent = { fitId, userId, status };
    this.emitter.emit(this.FIT_STATUS_CHANGED, event);
  }

  onFitStatusChanged(handler: (event: FitStatusChangedEvent) => void): void {
    this.emitter.on(this.FIT_STATUS_CHANGED, handler);
  }

  removeFitStatusChangedListener(
    handler: (event: FitStatusChangedEvent) => void,
  ): void {
    this.emitter.off(this.FIT_STATUS_CHANGED, handler);
  }
}
