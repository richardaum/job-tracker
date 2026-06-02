import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AiChatEventBus } from "./ai-chat-event.bus";
import { AiChatGenerationService } from "./ai-chat-generation.service";
import { AiChatRepository } from "./ai-chat.repository";
import { AiChatService } from "./ai-chat.service";

const makeConversation = (overrides: Record<string, unknown> = {}) => ({
  id: "conv-1",
  jobId: "job-1",
  userId: "user-1",
  title: "New conversation",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  ...overrides,
});

const makeMessage = (overrides: Record<string, unknown> = {}) => ({
  id: "msg-1",
  conversationId: "conv-1",
  role: "user",
  content: "Hello",
  createdAt: new Date("2026-01-01"),
  ...overrides,
});

describe("AiChatService", () => {
  let service: AiChatService;
  let repo: AiChatRepository;
  let jobsRepo: JobsRepository;
  let generationService: AiChatGenerationService;
  let eventBus: AiChatEventBus;

  beforeEach(() => {
    repo = {
      findConversationsByJobId: vi.fn(),
      findConversationById: vi.fn(),
      createConversation: vi.fn(),
      deleteConversation: vi.fn(),
      findMessagesByConversationId: vi.fn(),
      createMessagesBatch: vi.fn(),
    } as unknown as AiChatRepository;

    jobsRepo = {
      findOneByIdAndUserId: vi.fn(),
    } as unknown as JobsRepository;

    generationService = {
      generateAnswer: vi.fn(),
    } as unknown as AiChatGenerationService;

    eventBus = {
      emit: vi.fn(),
    } as unknown as AiChatEventBus;

    service = new AiChatService(repo, jobsRepo, generationService, eventBus);
  });

  describe("createConversation", () => {
    it("creates a conversation when job exists", async () => {
      vi.mocked(jobsRepo.findOneByIdAndUserId).mockResolvedValue({ id: "job-1" } as never);
      vi.mocked(repo.createConversation).mockResolvedValue(makeConversation());

      const result = await service.createConversation("job-1", "user-1");

      expect(result.id).toBe("conv-1");
      expect(repo.createConversation).toHaveBeenCalledWith({ jobId: "job-1", userId: "user-1" });
    });

    it("throws NotFoundException when job does not exist", async () => {
      vi.mocked(jobsRepo.findOneByIdAndUserId).mockResolvedValue(null);

      await expect(service.createConversation("job-1", "user-1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("listConversations", () => {
    it("returns conversations for an owned job", async () => {
      vi.mocked(jobsRepo.findOneByIdAndUserId).mockResolvedValue({ id: "job-1" } as never);
      vi.mocked(repo.findConversationsByJobId).mockResolvedValue([makeConversation()]);

      const result = await service.listConversations("job-1", "user-1");

      expect(result).toHaveLength(1);
    });

    it("throws NotFoundException when job does not exist", async () => {
      vi.mocked(jobsRepo.findOneByIdAndUserId).mockResolvedValue(null);

      await expect(service.listConversations("job-1", "user-1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("deleteConversation", () => {
    it("deletes conversation and returns payload", async () => {
      vi.mocked(repo.deleteConversation).mockResolvedValue(makeConversation());

      const result = await service.deleteConversation("conv-1", "user-1");

      expect(result).toEqual({ success: true, deletedId: "conv-1" });
      expect(repo.deleteConversation).toHaveBeenCalledWith("conv-1", "user-1");
    });

    it("throws NotFoundException when conversation does not exist", async () => {
      vi.mocked(repo.deleteConversation).mockResolvedValue(null);

      await expect(service.deleteConversation("conv-1", "user-1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("askQuestion", () => {
    it("returns success and starts streaming when conversation exists", async () => {
      vi.mocked(repo.findConversationById).mockResolvedValue(makeConversation({ jobId: "job-1" }));
      vi.mocked(generationService.generateAnswer).mockResolvedValue("Full AI response");

      const result = await service.askQuestion("conv-1", "user-1", "What is this job?");

      expect(result).toEqual({ success: true });
      expect(generationService.generateAnswer).toHaveBeenCalledWith("conv-1", "user-1", "job-1", "What is this job?");
    });

    it("throws NotFoundException when conversation does not exist", async () => {
      vi.mocked(repo.findConversationById).mockResolvedValue(null);

      await expect(service.askQuestion("conv-1", "user-1", "test")).rejects.toThrow(NotFoundException);
    });
  });

  describe("listMessages", () => {
    it("returns messages when conversation exists", async () => {
      vi.mocked(repo.findConversationById).mockResolvedValue(makeConversation());
      vi.mocked(repo.findMessagesByConversationId).mockResolvedValue([makeMessage()]);

      const result = await service.listMessages("conv-1", "user-1");

      expect(result).toHaveLength(1);
    });

    it("throws NotFoundException when conversation does not exist", async () => {
      vi.mocked(repo.findConversationById).mockResolvedValue(null);

      await expect(service.listMessages("conv-1", "user-1")).rejects.toThrow(NotFoundException);
    });
  });
});
