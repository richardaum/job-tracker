import { JobStageEventsRepository } from "@api/domains/jobs/job-stage-events.repository";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import { MatchAnalysisRepository } from "@api/domains/match-analysis/match-analysis.repository";
import { NoteRepository } from "@api/domains/notes/notes.repository";
import { AiUsageSourceEnum } from "@api/domains/ai-usage/ai-usage-source.enum";
import { AiUsageService } from "@api/domains/ai-usage/ai-usage.service";
import { AiAccessService, OpenAIClient, PromptRendererService } from "@api/lib/ai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AiChatGenerationService } from "./ai-chat-generation.service";
import { AiChatPubSub } from "./ai-chat.pubsub";

describe("AiChatGenerationService", () => {
  let service: AiChatGenerationService;
  let openAIClient: OpenAIClient;
  let promptRenderer: PromptRendererService;
  let aiAccess: AiAccessService;
  let aiUsage: AiUsageService;
  let jobsRepo: JobsRepository;
  let matchAnalysisRepo: MatchAnalysisRepository;
  let notesRepo: NoteRepository;
  let stageEventsRepo: JobStageEventsRepository;
  let pubSub: AiChatPubSub;

  beforeEach(() => {
    openAIClient = { getClientFor: vi.fn() } as unknown as OpenAIClient;

    promptRenderer = { render: vi.fn().mockReturnValue("rendered prompt") } as unknown as PromptRendererService;

    aiAccess = { resolveClientAccess: vi.fn() } as unknown as AiAccessService;

    aiUsage = { record: vi.fn().mockResolvedValue(undefined) } as unknown as AiUsageService;

    jobsRepo = { findOneByIdAndUserId: vi.fn() } as unknown as JobsRepository;

    matchAnalysisRepo = { findByJobId: vi.fn() } as unknown as MatchAnalysisRepository;

    notesRepo = { findByJobIdAndUserId: vi.fn() } as unknown as NoteRepository;

    stageEventsRepo = { findStageEventsByJobIdAndUserId: vi.fn() } as unknown as JobStageEventsRepository;

    pubSub = { publish: vi.fn() } as unknown as AiChatPubSub;

    service = new AiChatGenerationService(
      openAIClient,
      promptRenderer,
      aiAccess,
      aiUsage,
      jobsRepo,
      matchAnalysisRepo,
      notesRepo,
      stageEventsRepo,
      pubSub,
    );
  });

  describe("generateAnswer", () => {
    it("builds the streamed request from the full job context", async () => {
      vi.mocked(jobsRepo.findOneByIdAndUserId).mockResolvedValue({
        id: "job-123",
        title: "Engineer",
        description: "Build products",
        company: { name: "Acme", description: "A company", industry: "Software" },
      } as never);
      vi.mocked(matchAnalysisRepo.findByJobId).mockResolvedValue({
        summary: "Strong fit",
        items: [{ category: "skill", requirement: "TypeScript" }, { detail: "Remote" }],
      } as never);
      vi.mocked(notesRepo.findByJobIdAndUserId).mockResolvedValue([
        { content: "Referral", createdAt: new Date("2026-08-20T12:00:00Z") },
      ] as never);
      vi.mocked(stageEventsRepo.findStageEventsByJobIdAndUserId).mockResolvedValue([
        {
          toStage: "INTERVIEW",
          fromStage: "APPLIED",
          reason: "Recruiter call",
          createdAt: new Date("2026-08-20T13:00:00Z"),
        },
      ] as never);
      vi.mocked(aiAccess.resolveClientAccess).mockResolvedValue({
        key: "personal-key",
        source: AiUsageSourceEnum.PersonalKey,
      });
      const create = vi.fn().mockResolvedValue((async function* () {})());
      vi.mocked(openAIClient.getClientFor).mockReturnValue({ chat: { completions: { create } } } as never);

      await service.generateAnswer("conv-123", "user-123", "job-123", "Question");

      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            expect.objectContaining({ role: "system", content: expect.stringContaining("[skill] TypeScript") }),
            { role: "user", content: "Question" },
          ],
        }),
      );
      const systemMessage = vi.mocked(create).mock.calls[0][0].messages[0].content;
      expect(systemMessage).toContain("Name: Acme");
      expect(systemMessage).toContain("Strong fit");
      expect(systemMessage).toContain("Referral");
      expect(systemMessage).toContain("APPLIED → INTERVIEW (reason: Recruiter call)");
    });

    it("should call aiAccess.resolveClientAccess with userId", async () => {
      const userId = "user-123";
      const jobId = "job-123";
      const conversationId = "conv-123";
      const question = "What is this role?";

      vi.mocked(jobsRepo.findOneByIdAndUserId).mockResolvedValue({ id: jobId } as never);
      vi.mocked(matchAnalysisRepo.findByJobId).mockRejectedValue(new Error("not available"));
      vi.mocked(notesRepo.findByJobIdAndUserId).mockRejectedValue(new Error("not available"));
      vi.mocked(stageEventsRepo.findStageEventsByJobIdAndUserId).mockRejectedValue(new Error("not available"));

      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({ choices: [{ delta: { content: "This is a great role." } }] }),
          },
        },
      };

      vi.mocked(aiAccess.resolveClientAccess).mockResolvedValue({
        key: "test-key",
        source: AiUsageSourceEnum.PersonalKey,
      });
      vi.mocked(openAIClient.getClientFor).mockReturnValue(mockClient as never);

      // Mock the stream by returning an empty async generator after the mock call
      const mockStream = (async function* () {
        yield { choices: [{ delta: { content: "This is a great role." } }] };
      })();

      vi.mocked(mockClient.chat.completions.create).mockResolvedValue(mockStream as never);

      await service.generateAnswer(conversationId, userId, jobId, question);

      expect(aiAccess.resolveClientAccess).toHaveBeenCalledWith(userId);
      expect(openAIClient.getClientFor).toHaveBeenCalledWith("test-key");
    });

    it("should return empty string when job not found", async () => {
      const userId = "user-123";
      const jobId = "job-123";
      const conversationId = "conv-123";
      const question = "What is this role?";

      vi.mocked(jobsRepo.findOneByIdAndUserId).mockResolvedValue(null);

      const result = await service.generateAnswer(conversationId, userId, jobId, question);

      expect(result).toBe("");
      expect(aiAccess.resolveClientAccess).not.toHaveBeenCalled();
    });

    it("records one final stream usage payload and requests usage chunks", async () => {
      vi.mocked(jobsRepo.findOneByIdAndUserId).mockResolvedValue({ id: "job-123" } as never);
      vi.mocked(matchAnalysisRepo.findByJobId).mockResolvedValue(null);
      vi.mocked(notesRepo.findByJobIdAndUserId).mockResolvedValue([]);
      vi.mocked(stageEventsRepo.findStageEventsByJobIdAndUserId).mockResolvedValue([]);
      vi.mocked(aiAccess.resolveClientAccess).mockResolvedValue({ key: "trial-key", source: AiUsageSourceEnum.Trial });
      const create = vi.fn().mockResolvedValue(
        (async function* () {
          yield { choices: [{ delta: { content: "Answer" } }], usage: null };
          yield { choices: [], usage: { prompt_tokens: 41, completion_tokens: 7, total_tokens: 48 } };
        })(),
      );
      vi.mocked(openAIClient.getClientFor).mockReturnValue({ chat: { completions: { create } } } as never);

      await expect(service.generateAnswer("conv-123", "user-123", "job-123", "Question")).resolves.toBe("Answer");

      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ stream: true, stream_options: { include_usage: true } }),
      );
      expect(aiUsage.record).toHaveBeenCalledTimes(1);
      expect(aiUsage.record).toHaveBeenCalledWith("user-123", AiUsageSourceEnum.Trial, {
        inputTokens: 41,
        outputTokens: 7,
        totalTokens: 48,
      });
    });

    it("does not record stream usage when the final usage chunk is missing", async () => {
      vi.mocked(jobsRepo.findOneByIdAndUserId).mockResolvedValue({ id: "job-123" } as never);
      vi.mocked(matchAnalysisRepo.findByJobId).mockResolvedValue(null);
      vi.mocked(notesRepo.findByJobIdAndUserId).mockResolvedValue([]);
      vi.mocked(stageEventsRepo.findStageEventsByJobIdAndUserId).mockResolvedValue([]);
      vi.mocked(aiAccess.resolveClientAccess).mockResolvedValue({
        key: "personal-key",
        source: AiUsageSourceEnum.PersonalKey,
      });
      const stream = (async function* () {
        yield { choices: [{ delta: { content: "Answer" } }] };
      })();
      vi.mocked(openAIClient.getClientFor).mockReturnValue({
        chat: { completions: { create: vi.fn().mockResolvedValue(stream) } },
      } as never);

      await service.generateAnswer("conv-123", "user-123", "job-123", "Question");

      expect(aiUsage.record).not.toHaveBeenCalled();
    });

    it("returns the streamed answer when usage persistence fails", async () => {
      vi.mocked(jobsRepo.findOneByIdAndUserId).mockResolvedValue({ id: "job-123" } as never);
      vi.mocked(matchAnalysisRepo.findByJobId).mockResolvedValue(null);
      vi.mocked(notesRepo.findByJobIdAndUserId).mockResolvedValue([]);
      vi.mocked(stageEventsRepo.findStageEventsByJobIdAndUserId).mockResolvedValue([]);
      vi.mocked(aiAccess.resolveClientAccess).mockResolvedValue({ key: "trial-key", source: AiUsageSourceEnum.Trial });
      vi.mocked(aiUsage.record).mockRejectedValue(new Error("database unavailable"));
      const stream = (async function* () {
        yield { choices: [{ delta: { content: "Answer" } }] };
        yield { choices: [], usage: { prompt_tokens: 8, completion_tokens: 2, total_tokens: 10 } };
      })();
      vi.mocked(openAIClient.getClientFor).mockReturnValue({
        chat: { completions: { create: vi.fn().mockResolvedValue(stream) } },
      } as never);

      await expect(service.generateAnswer("conv-123", "user-123", "job-123", "Question")).resolves.toBe("Answer");
    });

    it("does not record usage when streaming fails before completion", async () => {
      vi.mocked(jobsRepo.findOneByIdAndUserId).mockResolvedValue({ id: "job-123" } as never);
      vi.mocked(matchAnalysisRepo.findByJobId).mockResolvedValue(null);
      vi.mocked(notesRepo.findByJobIdAndUserId).mockResolvedValue([]);
      vi.mocked(stageEventsRepo.findStageEventsByJobIdAndUserId).mockResolvedValue([]);
      vi.mocked(aiAccess.resolveClientAccess).mockResolvedValue({ key: "trial-key", source: AiUsageSourceEnum.Trial });
      const stream = (async function* () {
        yield {
          choices: [{ delta: { content: "Partial" } }],
          usage: { prompt_tokens: 20, completion_tokens: 1, total_tokens: 21 },
        };
        throw new Error("stream disconnected");
      })();
      vi.mocked(openAIClient.getClientFor).mockReturnValue({
        chat: { completions: { create: vi.fn().mockResolvedValue(stream) } },
      } as never);

      await expect(service.generateAnswer("conv-123", "user-123", "job-123", "Question")).rejects.toThrow(
        "stream disconnected",
      );
      expect(aiUsage.record).not.toHaveBeenCalled();
    });
  });

  describe("generateTitle", () => {
    it("should call aiAccess.resolveClientAccess with userId", async () => {
      const userId = "user-123";
      const question = "What is this role?";

      const mockClient = {
        chat: {
          completions: { create: vi.fn().mockResolvedValue({ choices: [{ message: { content: "Role Overview" } }] }) },
        },
      };

      vi.mocked(aiAccess.resolveClientAccess).mockResolvedValue({
        key: "test-key",
        source: AiUsageSourceEnum.PersonalKey,
      });
      vi.mocked(openAIClient.getClientFor).mockReturnValue(mockClient as never);

      const result = await service.generateTitle(userId, question);

      expect(aiAccess.resolveClientAccess).toHaveBeenCalledWith(userId);
      expect(openAIClient.getClientFor).toHaveBeenCalledWith("test-key");
      expect(result).toBe("Role Overview");
      expect(aiUsage.record).not.toHaveBeenCalled();
    });

    it("should return default title on empty response", async () => {
      const userId = "user-123";
      const question = "What is this role?";

      const mockClient = {
        chat: { completions: { create: vi.fn().mockResolvedValue({ choices: [{ message: { content: null } }] }) } },
      };

      vi.mocked(aiAccess.resolveClientAccess).mockResolvedValue({
        key: "test-key",
        source: AiUsageSourceEnum.PersonalKey,
      });
      vi.mocked(openAIClient.getClientFor).mockReturnValue(mockClient as never);

      const result = await service.generateTitle(userId, question);

      expect(result).toBe("New conversation");
    });

    it("records exact title-generation usage", async () => {
      vi.mocked(aiAccess.resolveClientAccess).mockResolvedValue({
        key: "personal-key",
        source: AiUsageSourceEnum.PersonalKey,
      });
      vi.mocked(openAIClient.getClientFor).mockReturnValue({
        chat: {
          completions: {
            create: vi
              .fn()
              .mockResolvedValue({
                choices: [{ message: { content: "Role Overview" } }],
                usage: { prompt_tokens: 13, completion_tokens: 4, total_tokens: 17 },
              }),
          },
        },
      } as never);

      await service.generateTitle("user-123", "What is this role?");

      expect(aiUsage.record).toHaveBeenCalledWith("user-123", AiUsageSourceEnum.PersonalKey, {
        inputTokens: 13,
        outputTokens: 4,
        totalTokens: 17,
      });
    });
  });
});
