import { SourceRunEventTypeEnum } from "@api/domains/sources/source-run-event-type.enum";
import { SourceRunStatusEnum } from "@api/domains/sources/source-run-status.enum";
import type { ScopedEventBus } from "@api/lib/domain-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SourceRunReported } from "./sources.events";
import { SourcesResolver } from "./sources.resolver";
import type { SourcesService } from "./sources.service";
import type { SourcesEventBus } from "./sources-event.bus";

describe("SourcesResolver", () => {
  const service: Pick<SourcesService, "listSourceTemplates"> = { listSourceTemplates: vi.fn() };

  const eventBus: Pick<SourcesEventBus, "forUser"> = { forUser: vi.fn() };

  const resolver = new SourcesResolver(service as SourcesService, eventBus as SourcesEventBus);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sourceRunEvents yields events for the authenticated user", async () => {
    const events = [
      new SourceRunReported("user-1", {
        type: SourceRunEventTypeEnum.SourceRunCreated,
        occurredAt: new Date("2026-05-01T12:00:01.000Z"),
        run: {
          id: "run-1",
          templateId: "t1",
          planId: "p1",
          surfaceUrl: "https://example.com",
          status: SourceRunStatusEnum.Pending,
          startedAt: new Date("2026-05-01T12:00:01.000Z"),
          jobCount: 0,
        },
      }),
    ];

    let index = 0;
    async function* makeIter(): AsyncGenerator<SourceRunReported> {
      while (index < events.length) yield events[index++];
    }
    vi.mocked(eventBus.forUser).mockReturnValue({ eventsOf: () => makeIter() } as unknown as ScopedEventBus);

    const iterator = resolver.sourceRunEvents({ userId: "user-1" })[Symbol.asyncIterator]();
    const first = await iterator.next();

    expect(first.done).toBe(false);
    expect(first.value).toMatchObject({ type: SourceRunEventTypeEnum.SourceRunCreated, run: { id: "run-1" } });

    expect(eventBus.forUser).toHaveBeenCalledWith("user-1");
  });
});
