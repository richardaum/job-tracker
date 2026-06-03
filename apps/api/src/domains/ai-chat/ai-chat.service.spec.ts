import { AiMessageRoleEnum } from "./ai-message-role.enum";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AiChatEventBus } from "./ai-chat-event.bus";
import { AiChatRepository } from "./ai-chat.repository";
import { AiChatService } from "./ai-chat.service";
import { AiChatRequested } from "./ai-chat.events";

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
  role: AiMessageRoleEnum.User,
  content: "Hello",
  createdAt: new Date("2026-01-01"),
  ...overrides,
});

describe("AiChatService", () => {
  let service: AiChatService;
  let repo: AiChatRepository;
  let jobsRepo: JobsRepository;
  let eventBus: AiChatEventBus;

  beforeEach(() => {
    repo = {
      findConversationsByJobId: vi.fn(),
      findConversationById: vi.fn(),
      createConversation: vi.fn(),
      deleteConversation: vi.fn(),
      findMessagesByConversationId: vi.fn(),
      createMessagesBatch: vi.fn(),
      createMessage: vi.fn(),
      updateGeneratingStatus: vi.fn(),
      resetStaleGeneratingStatus: vi.fn().mockResolvedValue(0),
    } as unknown as AiChatRepository;

    jobsRepo = { findOneByIdAndUserId: vi.fn() } as unknown as JobsRepository;

    eventBus = { emit: vi.fn() } as unknown as AiChatEventBus;

    service = new AiChatService(repo, jobsRepo, eventBus);
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
    it("persists user message and emits AiChatRequested", async () => {
      vi.mocked(repo.findConversationById).mockResolvedValue(makeConversation({ jobId: "job-1" }));

      const result = await service.askQuestion("conv-1", "user-1", "What is this job?");

      expect(result).toEqual({ success: true });
      expect(repo.createMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: "conv-1",
          role: AiMessageRoleEnum.User,
          content: "What is this job?",
        }),
      );
      expect(repo.updateGeneratingStatus).toHaveBeenCalledWith(
        "conv-1",
        expect.objectContaining({ status: "Processing" }),
      );
      expect(eventBus.emit).toHaveBeenCalledWith(expect.any(AiChatRequested));
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
