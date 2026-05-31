import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FillJobStatusChanged, JobMatchStatusChanged, SummaryStatusChanged } from "./job.events";
import type { JobEventBus } from "./job-event.bus";
import type { JobsRepository } from "./jobs.repository";
import { JobsEventsResolver } from "./jobs-events.resolver";

describe("JobsEventsResolver", () => {
  const scopedBus = { eventsOf: vi.fn() };
  const eventBus: Pick<JobEventBus, "forJob"> = {
    forJob: vi.fn().mockReturnValue(scopedBus),
  };
  const jobsRepo: Pick<JobsRepository, "findOneByIdAndUserId"> = {
    findOneByIdAndUserId: vi.fn(),
  };

  let resolver: JobsEventsResolver;

  beforeEach(() => {
    vi.clearAllMocks();
    resolver = new JobsEventsResolver(eventBus as JobEventBus, jobsRepo as JobsRepository);
  });

  it("jobSummaryStatusChanged yields only matching SummaryStatusChanged events", async () => {
    vi.mocked(scopedBus.eventsOf).mockReturnValue({
      async *[Symbol.asyncIterator]() {
        yield new SummaryStatusChanged("job-1", "user-1", AsyncMetadataStatusEnum.COMPLETED);
        yield new SummaryStatusChanged("job-1", "user-1", AsyncMetadataStatusEnum.PROCESSING);
      },
    });
    vi.mocked(jobsRepo.findOneByIdAndUserId!).mockResolvedValue({
      summary: '{"type":"doc","content":[]}',
      summaryMetadata: {
        status: AsyncMetadataStatusEnum.COMPLETED,
        error: null,
        timestamp: new Date("2024-01-01"),
      },
    } as never);

    const iterator = resolver
      .jobSummaryStatusChanged("job-1", { userId: "user-1" })
      [Symbol.asyncIterator]();

    const first = await iterator.next();
    expect(first.value).toEqual({
      jobId: "job-1",
      status: AsyncMetadataStatusEnum.COMPLETED,
      summary: '{"type":"doc","content":[]}',
      summaryMetadata: {
        status: AsyncMetadataStatusEnum.COMPLETED,
        error: null,
        timestamp: new Date("2024-01-01"),
      },
    });

    const second = await iterator.next();
    expect(second.value).toMatchObject({
      jobId: "job-1",
      status: AsyncMetadataStatusEnum.PROCESSING,
    });

    expect(await iterator.next()).toEqual({ value: undefined, done: true });
    expect(eventBus.forJob).toHaveBeenCalledWith("user-1", "job-1");
    expect(scopedBus.eventsOf).toHaveBeenCalledWith(SummaryStatusChanged);
    expect(jobsRepo.findOneByIdAndUserId).toHaveBeenCalledOnce();
  });

  it("jobFillStatusChanged yields FillJobStatusChanged events", async () => {
    vi.mocked(scopedBus.eventsOf).mockReturnValue({
      async *[Symbol.asyncIterator]() {
        yield new FillJobStatusChanged("job-1", "user-1", AsyncMetadataStatusEnum.PROCESSING);
        yield new FillJobStatusChanged("job-1", "user-1", AsyncMetadataStatusEnum.COMPLETED);
        yield new FillJobStatusChanged(
          "job-1",
          "user-1",
          AsyncMetadataStatusEnum.FAILED,
          "timeout",
        );
      },
    });

    const iterator = resolver
      .jobFillStatusChanged("job-1", { userId: "user-1" })
      [Symbol.asyncIterator]();

    expect((await iterator.next()).value).toEqual({
      jobId: "job-1",
      status: AsyncMetadataStatusEnum.PROCESSING,
      error: undefined,
    });
    expect((await iterator.next()).value).toEqual({
      jobId: "job-1",
      status: AsyncMetadataStatusEnum.COMPLETED,
      error: undefined,
    });
    expect((await iterator.next()).value).toEqual({
      jobId: "job-1",
      status: AsyncMetadataStatusEnum.FAILED,
      error: "timeout",
    });
    expect(await iterator.next()).toEqual({ value: undefined, done: true });
    expect(eventBus.forJob).toHaveBeenCalledWith("user-1", "job-1");
    expect(scopedBus.eventsOf).toHaveBeenCalledWith(FillJobStatusChanged);
  });

  it("jobMatchStatusChanged yields only matching JobMatchStatusChanged events", async () => {
    vi.mocked(scopedBus.eventsOf).mockReturnValue({
      async *[Symbol.asyncIterator]() {
        yield new JobMatchStatusChanged(
          "job-1",
          "user-1",
          "match-a",
          AsyncMetadataStatusEnum.COMPLETED,
        );
        yield new JobMatchStatusChanged(
          "job-1",
          "user-1",
          "match-c",
          AsyncMetadataStatusEnum.PROCESSING,
        );
      },
    });

    const iterator = resolver
      .jobMatchStatusChanged("job-1", { userId: "user-1" })
      [Symbol.asyncIterator]();

    const first = await iterator.next();
    expect(first.value).toEqual({
      jobId: "job-1",
      matchId: "match-a",
      status: AsyncMetadataStatusEnum.COMPLETED,
    });

    const second = await iterator.next();
    expect(second.value).toEqual({
      jobId: "job-1",
      matchId: "match-c",
      status: AsyncMetadataStatusEnum.PROCESSING,
    });

    expect(await iterator.next()).toEqual({ value: undefined, done: true });
    expect(eventBus.forJob).toHaveBeenCalledWith("user-1", "job-1");
    expect(scopedBus.eventsOf).toHaveBeenCalledWith(JobMatchStatusChanged);
  });
});
