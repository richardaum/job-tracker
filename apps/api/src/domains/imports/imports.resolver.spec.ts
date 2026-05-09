import { ImportRunEventTypeEnum } from "@api/domains/imports/import-run-event-type.enum";
import { ImportRunStatusEnum } from "@api/domains/imports/import-run-status.enum";
import { PlanRegistryService } from "@api/domains/imports/plan-registry.service";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ImportsResolver } from "./imports.resolver";
import { ImportsService } from "./imports.service";

describe("ImportsResolver", () => {
  const service: Pick<
    ImportsService,
    "importRunEvents" | "listImportTemplates" | "listImportTemplatesForImporter"
  > = {
    importRunEvents: vi.fn(),
    listImportTemplates: vi.fn(),
    listImportTemplatesForImporter: vi.fn(),
  };

  const planRegistry = new PlanRegistryService();

  const resolver = new ImportsResolver(service as ImportsService, planRegistry);

  const user = { userId: "user-1" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("importers returns all registered importers when not filtered", async () => {
    await expect(resolver.importers(user, false)).resolves.toEqual([
      { importerId: "remoteyeah", name: "RemoteYeah" },
    ]);
    expect(service.listImportTemplates).not.toHaveBeenCalled();
  });

  it("importers with onlyWithImportTemplate keeps importers that have a template", async () => {
    vi.mocked(service.listImportTemplates).mockResolvedValue([
      {
        id: "tmpl-1",
        importerId: "remoteyeah",
        scheduleCron: null,
        scheduleEnabled: false,
        surfaceUrl: "https://example.com",
        createdAt: new Date("2026-05-01T12:00:00.000Z"),
        runs: [],
      },
    ]);

    await expect(resolver.importers(user, true)).resolves.toEqual([
      {
        importerId: "remoteyeah",
        name: "RemoteYeah",
        templates: [
          {
            id: "tmpl-1",
            importerId: "remoteyeah",
            scheduleCron: null,
            scheduleEnabled: false,
            surfaceUrl: "https://example.com",
            createdAt: new Date("2026-05-01T12:00:00.000Z"),
            runs: [],
          },
        ],
      },
    ]);
    expect(service.listImportTemplates).toHaveBeenCalledWith("user-1");
  });

  it("templates resolves from the importer row when already attached", async () => {
    const templates = [
      {
        id: "tmpl-1",
        importerId: "remoteyeah",
        scheduleCron: null,
        scheduleEnabled: false,
        surfaceUrl: "https://example.com",
        createdAt: new Date("2026-05-01T12:00:00.000Z"),
        runs: [],
      },
    ];

    expect(
      resolver.templates(
        { importerId: "remoteyeah", name: "RemoteYeah", templates },
        user,
      ),
    ).toBe(templates);
    expect(service.listImportTemplatesForImporter).not.toHaveBeenCalled();
  });

  it("templates loads importer-scoped templates when not attached", async () => {
    vi.mocked(service.listImportTemplatesForImporter).mockResolvedValue([]);

    await expect(
      resolver.templates(
        { importerId: "remoteyeah", name: "RemoteYeah" },
        user,
      ),
    ).resolves.toEqual([]);
    expect(service.listImportTemplatesForImporter).toHaveBeenCalledWith(
      "user-1",
      "remoteyeah",
    );
  });

  it("importTemplatesForImporter delegates to the service", async () => {
    vi.mocked(service.listImportTemplatesForImporter).mockResolvedValue([]);

    await expect(
      resolver.importTemplatesForImporter(user, "remoteyeah"),
    ).resolves.toEqual([]);
    expect(service.listImportTemplatesForImporter).toHaveBeenCalledWith(
      "user-1",
      "remoteyeah",
    );
  });

  it("importers with onlyWithImportTemplate drops importers without a template", async () => {
    vi.mocked(service.listImportTemplates).mockResolvedValue([]);

    await expect(resolver.importers(user, true)).resolves.toEqual([]);
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
        templateId: "tmpl-1",
        importerId: "remoteyeah",
        surfaceUrl: "https://example.com",
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
