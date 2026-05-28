import { SourceRunEventTypeEnum } from "@api/domains/sources/source-run-event-type.enum";
import { SourceRunStatusEnum } from "@api/domains/sources/source-run-status.enum";
import type { ScopedEventBus } from "@api/lib/domain-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SourceRunReported } from "./sources.events";
import { SourcesResolver } from "./sources.resolver";
import type { SourcesService } from "./sources.service";
import type { SourcesEventBus } from "./sources-event.bus";

describe("SourcesResolver", () => {
  const service: Pick<
    SourcesService,
    "listSourceTemplates" | "listSourceTemplatesForSourceProfile"
  > = {
    listSourceTemplates: vi.fn(),
    listSourceTemplatesForSourceProfile: vi.fn(),
  };

  const eventBus: Pick<SourcesEventBus, "forUser"> = { forUser: vi.fn() };

  const planService = {
    listSourceProfileDescriptors: vi
      .fn()
      .mockResolvedValue([
        { sourceProfileId: "remoteyeah", name: "RemoteYeah" },
      ]),
  };

  const resolver = new SourcesResolver(
    service as SourcesService,
    planService as never,
    eventBus as SourcesEventBus,
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

  it("sourceRunEvents yields events for the authenticated user", async () => {
    const events = [
      new SourceRunReported("user-1", {
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
      }),
    ];

    let index = 0;
    async function* makeIter(): AsyncGenerator<SourceRunReported> {
      while (index < events.length) yield events[index++];
    }
    vi.mocked(eventBus.forUser).mockReturnValue({
      eventsOf: () => makeIter(),
    } as unknown as ScopedEventBus);

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

    expect(eventBus.forUser).toHaveBeenCalledWith("user-1");
  });
});
