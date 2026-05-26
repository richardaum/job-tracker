import { SourceProfileRegistryService } from "@api/domains/sources/source-profile-registry.service";
import { SourceRunEventTypeEnum } from "@api/domains/sources/source-run-event-type.enum";
import { SourceRunStatusEnum } from "@api/domains/sources/source-run-status.enum";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SourcesResolver } from "./sources.resolver";
import type { SourcesService } from "./sources.service";
import type { SourcesEventsPublisher } from "./sources-events.publisher";

describe("SourcesResolver", () => {
  const service: Pick<
    SourcesService,
    "listSourceTemplates" | "listSourceTemplatesForSourceProfile"
  > = {
    listSourceTemplates: vi.fn(),
    listSourceTemplatesForSourceProfile: vi.fn(),
  };

  const eventsPublisher: Pick<SourcesEventsPublisher, "subscribe"> = {
    subscribe: vi.fn(),
  };

  const sourceProfileRegistry = new SourceProfileRegistryService();

  const resolver = new SourcesResolver(
    service as SourcesService,
    sourceProfileRegistry,
    eventsPublisher as SourcesEventsPublisher,
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

  it("sourceRunEvents filters events by authenticated user", async () => {
    vi.mocked(eventsPublisher.subscribe).mockReturnValue({
      [Symbol.asyncIterator]: () => {
        let index = 0;
        const events = [
          {
            userId: "other-user",
            payload: {
              type: SourceRunEventTypeEnum.SOURCE_RUN_CREATED,
              occurredAt: new Date("2026-05-01T12:00:00.000Z"),
              run: {
                id: "run-other",
                templateId: "t2",
                sourceProfileId: "remoteyeah",
                surfaceUrl: "https://example.com",
                status: SourceRunStatusEnum.RUNNING,
                startedAt: new Date("2026-05-01T12:00:00.000Z"),
                sourceProfile: "database" as const,
              },
            },
          },
          {
            userId: "user-1",
            payload: {
              type: SourceRunEventTypeEnum.SOURCE_RUN_CREATED,
              occurredAt: new Date("2026-05-01T12:00:01.000Z"),
              run: {
                id: "run-1",
                templateId: "t1",
                sourceProfileId: "remoteyeah",
                surfaceUrl: "https://example.com",
                status: SourceRunStatusEnum.RUNNING,
                startedAt: new Date("2026-05-01T12:00:01.000Z"),
                sourceProfile: "database" as const,
              },
            },
          },
        ];

        return {
          next: async () => {
            if (index >= events.length) {
              return { value: undefined, done: true };
            }
            const value = events[index];
            index += 1;
            return { value, done: false };
          },
        };
      },
    });

    const iterator = resolver
      .sourceRunEvents({ userId: "user-1" })
      [Symbol.asyncIterator]();
    const first = await iterator.next();

    expect(first.done).toBe(false);
    expect(first.value).toMatchObject({
      sourceRunEvents: {
        type: SourceRunEventTypeEnum.SOURCE_RUN_CREATED,
        run: { id: "run-1", sourceProfileId: "remoteyeah" },
      },
    });
  });
});
