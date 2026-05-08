import { ImportRunEventTypeEnum } from "@api/domains/imports/import-run-event-type.enum";
import { ImportRunStatusEnum } from "@api/domains/imports/import-run-status.enum";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ImportsResolver } from "./imports.resolver";
import { ImportsService } from "./imports.service";

describe("ImportsResolver", () => {
  const service: Pick<ImportsService, "importRunEvents"> = {
    importRunEvents: vi.fn(),
  };

  const resolver = new ImportsResolver(service as ImportsService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("importRunEvents scopes subscription by authenticated user", () => {
    const iterable: AsyncIterable<never> = {
      [Symbol.asyncIterator]: () => ({
        next: async () => ({ value: undefined, done: true }),
      }),
    };
    vi.mocked(service.importRunEvents).mockReturnValue(iterable);

    const out = resolver.importRunEvents({ userId: "user-1" });

    expect(service.importRunEvents).toHaveBeenCalledWith("user-1");
    expect(out).toBe(iterable);
  });

  it("importRunEvents returns ImportRunEvent payload shape", async () => {
    const payload = {
      type: ImportRunEventTypeEnum.IMPORT_RUN_CREATED,
      occurredAt: new Date("2026-05-01T12:00:00.000Z"),
      run: {
        id: "run-1",
        importerId: "remoteyeah",
        importerName: "RemoteYeah",
        entryUrl: "https://remoteyeah.com/board",
        status: ImportRunStatusEnum.RUNNING,
        startedAt: new Date("2026-05-01T12:00:00.000Z"),
        importerSource: "database" as const,
      },
    };

    vi.mocked(service.importRunEvents).mockReturnValue({
      [Symbol.asyncIterator]: () => {
        let yielded = false;
        return {
          next: async () => {
            if (yielded) {
              return { value: undefined, done: true };
            }
            yielded = true;
            return { value: { importRunEvents: payload }, done: false };
          },
        };
      },
    });

    const iterator = resolver
      .importRunEvents({ userId: "user-1" })
      [Symbol.asyncIterator]();
    const first = await iterator.next();

    expect(first.value).toMatchObject({
      importRunEvents: {
        type: ImportRunEventTypeEnum.IMPORT_RUN_CREATED,
        run: {
          id: "run-1",
          importerId: "remoteyeah",
          status: ImportRunStatusEnum.RUNNING,
        },
      },
    });
  });
});
