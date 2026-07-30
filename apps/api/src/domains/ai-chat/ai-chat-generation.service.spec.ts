import { JobStageEventsRepository } from "@api/domains/jobs/job-stage-events.repository";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import { MatchAnalysisRepository } from "@api/domains/match-analysis/match-analysis.repository";
import { NoteRepository } from "@api/domains/notes/notes.repository";
import { AiAccessService, OpenAIClient, PromptRendererService } from "@api/lib/ai";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AiChatGenerationService } from "./ai-chat-generation.service";
import { AiChatPubSub } from "./ai-chat.pubsub";

describe("AiChatGenerationService", () => {
  let service: AiChatGenerationService;
  let openAIClient: OpenAIClient;
  let promptRenderer: PromptRendererService;
  let aiAccess: AiAccessService;
  let jobsRepo: JobsRepository;
  let matchAnalysisRepo: MatchAnalysisRepository;
  let notesRepo: NoteRepository;
  let stageEventsRepo: JobStageEventsRepository;
  let pubSub: AiChatPubSub;

  beforeEach(() => {
    openAIClient = { getClientFor: vi.fn() } as unknown as OpenAIClient;

    promptRenderer = { render: vi.fn().mockReturnValue("rendered prompt") } as unknown as PromptRendererService;

    aiAccess = { resolveClientKey: vi.fn() } as unknown as AiAccessService;

    jobsRepo = { findOneByIdAndUserId: vi.fn() } as unknown as JobsRepository;

    matchAnalysisRepo = { findByJobId: vi.fn() } as unknown as MatchAnalysisRepository;

    notesRepo = { findByJobIdAndUserId: vi.fn() } as unknown as NoteRepository;

    stageEventsRepo = { findStageEventsByJobIdAndUserId: vi.fn() } as unknown as JobStageEventsRepository;

    pubSub = { publish: vi.fn() } as unknown as AiChatPubSub;

    service = new AiChatGenerationService(
      openAIClient,
      promptRenderer,
      aiAccess,
      jobsRepo,
      matchAnalysisRepo,
      notesRepo,
      stageEventsRepo,
      pubSub,
    );
  });

  describe("generateAnswer", () => {
    it("should call aiAccess.resolveClientKey with userId", async () => {
      const userId = "user-123";
      const jobId = "job-123";
      const conversationId = "conv-123";
      const question = "What is this role?";

      vi.mocked(jobsRepo.findOneByIdAndUserId).mockResolvedValue({ id: jobId } as never);
      vi.mocked(matchAnalysisRepo.findByJobId).mockResolvedValue(null);
      vi.mocked(notesRepo.findByJobIdAndUserId).mockResolvedValue([]);
      vi.mocked(stageEventsRepo.findStageEventsByJobIdAndUserId).mockResolvedValue([]);

      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({ choices: [{ delta: { content: "This is a great role." } }] }),
          },
        },
      };

      vi.mocked(aiAccess.resolveClientKey).mockResolvedValue("test-key");
      vi.mocked(openAIClient.getClientFor).mockReturnValue(mockClient as never);

      // Mock the stream by returning an empty async generator after the mock call
      const mockStream = (async function* () {
        yield { choices: [{ delta: { content: "This is a great role." } }] };
      })();

      vi.mocked(mockClient.chat.completions.create).mockResolvedValue(mockStream as never);

      await service.generateAnswer(conversationId, userId, jobId, question);

      expect(aiAccess.resolveClientKey).toHaveBeenCalledWith(userId);
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
      expect(aiAccess.resolveClientKey).not.toHaveBeenCalled();
    });
  });

  describe("generateTitle", () => {
    it("should call aiAccess.resolveClientKey with userId", async () => {
      const userId = "user-123";
      const question = "What is this role?";

      const mockClient = {
        chat: {
          completions: { create: vi.fn().mockResolvedValue({ choices: [{ message: { content: "Role Overview" } }] }) },
        },
      };

      vi.mocked(aiAccess.resolveClientKey).mockResolvedValue("test-key");
      vi.mocked(openAIClient.getClientFor).mockReturnValue(mockClient as never);

      const result = await service.generateTitle(userId, question);

      expect(aiAccess.resolveClientKey).toHaveBeenCalledWith(userId);
      expect(openAIClient.getClientFor).toHaveBeenCalledWith("test-key");
      expect(result).toBe("Role Overview");
    });

    it("should return default title on empty response", async () => {
      const userId = "user-123";
      const question = "What is this role?";

      const mockClient = {
        chat: { completions: { create: vi.fn().mockResolvedValue({ choices: [{ message: { content: null } }] }) } },
      };

      vi.mocked(aiAccess.resolveClientKey).mockResolvedValue("test-key");
      vi.mocked(openAIClient.getClientFor).mockReturnValue(mockClient as never);

      const result = await service.generateTitle(userId, question);

      expect(result).toBe("New conversation");
    });
  });
});
