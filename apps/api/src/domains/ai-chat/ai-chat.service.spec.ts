import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AiChatPubSub } from "./ai-chat.pubsub";
import { AiChatSubEventEnum } from "./ai-chat-sub-event.enum";
import { AiMessageRoleEnum } from "./ai-message-role.enum";
import { AiMessageStreamPhaseEnum } from "./ai-message-stream-phase.enum";
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
  role: AiMessageRoleEnum.User,
  content: "Hello",
  createdAt: new Date("2026-01-01"),
  ...overrides,
});

describe("AiChatService", () => {
  let service: AiChatService;
  let repo: AiChatRepository;
  let jobsRepo: JobsRepository;
  let pubSub: AiChatPubSub;

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

    pubSub = { publish: vi.fn(), asyncIterableIterator: vi.fn() } as unknown as AiChatPubSub;

    service = new AiChatService(repo, jobsRepo, pubSub);
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
    it("persists user message and publishes aiChatRequested", async () => {
      vi.mocked(repo.findConversationById).mockResolvedValue(makeConversation({ jobId: "job-1" }));
      vi.mocked(repo.createMessage).mockResolvedValue(makeMessage({ id: "user-msg-1", content: "What is this job?" }));

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
      expect(pubSub.publish).toHaveBeenCalledWith(
        AiChatSubEventEnum.AiChatRequested,
        expect.objectContaining({
          conversationId: "conv-1",
          userId: "user-1",
          content: "What is this job?",
          userMessageId: "user-msg-1",
        }),
      );
    });

    it("throws NotFoundException when conversation does not exist", async () => {
      vi.mocked(repo.findConversationById).mockResolvedValue(null);

      await expect(service.askQuestion("conv-1", "user-1", "test")).rejects.toThrow(NotFoundException);
    });
  });

  describe("subscribeStream", () => {
    it("yields Ready then filters pubsub events by conversationId", async () => {
      const pubSubEvents = [
        { conversationId: "conv-1", phase: AiMessageStreamPhaseEnum.Streaming, token: "Hi" },
        { conversationId: "conv-2", phase: AiMessageStreamPhaseEnum.Streaming, token: "other" },
        { conversationId: "conv-1", phase: AiMessageStreamPhaseEnum.Complete },
      ];

      async function* mockIterator() {
        for (const event of pubSubEvents) {
          yield event;
        }
      }

      vi.mocked(pubSub.asyncIterableIterator).mockReturnValue(mockIterator());

      const received = [];
      for await (const event of service.subscribeStream("conv-1")) {
        received.push(event);
      }

      expect(received).toEqual([
        { conversationId: "conv-1", phase: AiMessageStreamPhaseEnum.Ready },
        { conversationId: "conv-1", phase: AiMessageStreamPhaseEnum.Streaming, token: "Hi" },
        { conversationId: "conv-1", phase: AiMessageStreamPhaseEnum.Complete },
      ]);
      expect(pubSub.asyncIterableIterator).toHaveBeenCalledWith(AiChatSubEventEnum.AiMessageStreamed);
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
