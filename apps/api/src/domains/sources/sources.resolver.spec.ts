import { SourceProfileRegistryService } from "@api/domains/sources/source-profile-registry.service";
import { SourceRunEventTypeEnum } from "@api/domains/sources/source-run-event-type.enum";
import { SourceRunStatusEnum } from "@api/domains/sources/source-run-status.enum";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SourcesResolver } from "./sources.resolver";
import { SourcesService } from "./sources.service";

describe("SourcesResolver", () => {
  const service: Pick<
    SourcesService,
    | "sourceRunEvents"
    | "listSourceTemplates"
    | "listSourceTemplatesForSourceProfile"
  > = {
    sourceRunEvents: vi.fn(),
    listSourceTemplates: vi.fn(),
    listSourceTemplatesForSourceProfile: vi.fn(),
  };

  const sourceProfileRegistry = new SourceProfileRegistryService();

  const resolver = new SourcesResolver(
    service as SourcesService,
    sourceProfileRegistry,
  );

  const user = { userId: "user-1" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sourceProfiles returns all registered source profiles when not filtered", async () => {
    await expect(resolver.sourceProfiles(user, false)).resolves.toEqual([
      { sourceProfileId: "remoteyeah", name: "RemoteYeah" },
    ]);
    expect(service.listSourceTemplates).not.toHaveBeenCalled();
  });

  it("sourceProfiles with onlyWithSourceTemplate keeps profiles that have a template", async () => {
    vi.mocked(service.listSourceTemplates).mockResolvedValue([
      {
        id: "tmpl-1",
        sourceProfileId: "remoteyeah",
        scheduleCron: null,
        scheduleEnabled: false,
        surfaceUrl: "https://example.com",
        createdAt: new Date("2026-05-01T12:00:00.000Z"),
        runs: [],
      },
    ]);

    await expect(resolver.sourceProfiles(user, true)).resolves.toEqual([
      {
        sourceProfileId: "remoteyeah",
        name: "RemoteYeah",
        templates: [
          {
            id: "tmpl-1",
            sourceProfileId: "remoteyeah",
            scheduleCron: null,
            scheduleEnabled: false,
            surfaceUrl: "https://example.com",
            createdAt: new Date("2026-05-01T12:00:00.000Z"),
            runs: [],
          },
        ],
      },
    ]);
    expect(service.listSourceTemplates).toHaveBeenCalledWith("user-1");
  });

  it("templates resolves from the source profile row when already attached", async () => {
    const templates = [
      {
        id: "tmpl-1",
        sourceProfileId: "remoteyeah",
        scheduleCron: null,
        scheduleEnabled: false,
        surfaceUrl: "https://example.com",
        createdAt: new Date("2026-05-01T12:00:00.000Z"),
        runs: [],
      },
    ];

    expect(
      resolver.templates(
        { sourceProfileId: "remoteyeah", name: "RemoteYeah", templates },
        user,
      ),
    ).toBe(templates);
    expect(service.listSourceTemplatesForSourceProfile).not.toHaveBeenCalled();
  });

  it("templates loads profile-scoped templates when not attached", async () => {
    vi.mocked(service.listSourceTemplatesForSourceProfile).mockResolvedValue(
      [],
    );

    await expect(
      resolver.templates(
        { sourceProfileId: "remoteyeah", name: "RemoteYeah" },
        user,
      ),
    ).resolves.toEqual([]);
    expect(service.listSourceTemplatesForSourceProfile).toHaveBeenCalledWith(
      "user-1",
      "remoteyeah",
    );
  });

  it("sourceTemplatesForSourceProfile delegates to the service", async () => {
    vi.mocked(service.listSourceTemplatesForSourceProfile).mockResolvedValue(
      [],
    );

    await expect(
      resolver.sourceTemplatesForSourceProfile(user, "remoteyeah"),
    ).resolves.toEqual([]);
    expect(service.listSourceTemplatesForSourceProfile).toHaveBeenCalledWith(
      "user-1",
      "remoteyeah",
    );
  });

  it("sourceProfiles with onlyWithSourceTemplate drops profiles without a template", async () => {
    vi.mocked(service.listSourceTemplates).mockResolvedValue([]);

    await expect(resolver.sourceProfiles(user, true)).resolves.toEqual([]);
  });

  it("sourceRunEvents scopes subscription by authenticated user", () => {
    const iterable: AsyncIterable<never> = {
      [Symbol.asyncIterator]: () => ({
        next: async () => ({ value: undefined, done: true }),
      }),
    };
    vi.mocked(service.sourceRunEvents).mockReturnValue(iterable);

    const out = resolver.sourceRunEvents({ userId: "user-1" });

    expect(service.sourceRunEvents).toHaveBeenCalledWith("user-1");
    expect(out).toBe(iterable);
  });

  it("sourceRunEvents returns SourceRunEvent payload shape", async () => {
    const payload = {
      type: SourceRunEventTypeEnum.SOURCE_RUN_CREATED,
      occurredAt: new Date("2026-05-01T12:00:00.000Z"),
      run: {
        id: "run-1",
        templateId: "tmpl-1",
        sourceProfileId: "remoteyeah",
        surfaceUrl: "https://example.com",
        status: SourceRunStatusEnum.RUNNING,
        startedAt: new Date("2026-05-01T12:00:00.000Z"),
        sourceProfile: "database" as const,
      },
    };

    vi.mocked(service.sourceRunEvents).mockReturnValue({
      [Symbol.asyncIterator]: () => {
        let yielded = false;
        return {
          next: async () => {
            if (yielded) {
              return { value: undefined, done: true };
            }
            yielded = true;
            return { value: { sourceRunEvents: payload }, done: false };
          },
        };
      },
    });

    const iterator = resolver
      .sourceRunEvents({ userId: "user-1" })
      [Symbol.asyncIterator]();
    const first = await iterator.next();

    expect(first.value).toMatchObject({
      sourceRunEvents: {
        type: SourceRunEventTypeEnum.SOURCE_RUN_CREATED,
        run: {
          id: "run-1",
          sourceProfileId: "remoteyeah",
          status: SourceRunStatusEnum.RUNNING,
        },
      },
    });
  });
});
