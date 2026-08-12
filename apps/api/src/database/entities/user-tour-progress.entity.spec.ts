import { TourProgressStatusEnum } from "@api/domains/welcome-tour/tour-progress-status.enum";
import { describe, expect, it } from "vitest";
import { getMetadataArgsStorage } from "typeorm";

import { UserTourProgressEntity } from "./user-tour-progress.entity";

describe("UserTourProgressEntity", () => {
  function getColumnMetadata(propertyName: string) {
    return getMetadataArgsStorage().columns.find(
      (column) => column.target === UserTourProgressEntity && column.propertyName === propertyName,
    );
  }

  it("defaults a new progress record to the first tour version and in-progress status", () => {
    expect(getColumnMetadata("tourVersion")?.options.default).toBe(1);
    expect(getColumnMetadata("status")?.options.default).toBe(TourProgressStatusEnum.InProgress);
  });

  it("allows a progress record to resume at a stable step identifier", () => {
    const progress = new UserTourProgressEntity();
    progress.currentStepId = "job-creation";

    expect(progress.currentStepId).toBe("job-creation");
  });

  it("makes terminal timestamps nullable until the tour ends", () => {
    expect(getColumnMetadata("completedAt")?.options.nullable).toBe(true);
    expect(getColumnMetadata("skippedAt")?.options.nullable).toBe(true);
  });
});
