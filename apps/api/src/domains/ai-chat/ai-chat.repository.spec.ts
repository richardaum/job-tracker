import { AiConversationEntity } from "@api/database/entities/ai-conversation.entity";
import { AiMessageEntity } from "@api/database/entities/ai-message.entity";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Repository } from "typeorm";

import { AiChatRepository } from "./ai-chat.repository";

describe("AiChatRepository", () => {
  let conversations: Record<string, ReturnType<typeof vi.fn>>;
  let messages: Record<string, ReturnType<typeof vi.fn>>;
  let repo: AiChatRepository;

  beforeEach(() => {
    conversations = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      createQueryBuilder: vi.fn(),
    };
    messages = { find: vi.fn(), create: vi.fn(), save: vi.fn(), delete: vi.fn() };
    repo = new AiChatRepository(
      conversations as unknown as Repository<AiConversationEntity>,
      messages as unknown as Repository<AiMessageEntity>,
    );
  });

  it("lists and finds conversations scoped to the user", async () => {
    conversations.find.mockResolvedValue([]);
    conversations.findOne.mockResolvedValue(null);
    await repo.findConversationsByJobId("job", "user");
    await expect(repo.findConversationById("conv", "user")).resolves.toBeNull();
    expect(conversations.find).toHaveBeenCalledWith({
      where: { jobId: "job", userId: "user" },
      order: { updatedAt: "DESC" },
    });
  });

  it("creates conversations, messages, and message batches", async () => {
    const conversation = { id: "conv" };
    const message = { id: "message" };
    conversations.create.mockReturnValue(conversation);
    conversations.save.mockResolvedValue(conversation);
    messages.create.mockReturnValueOnce(message).mockReturnValueOnce([message]);
    messages.save.mockResolvedValue(message).mockResolvedValueOnce(message).mockResolvedValueOnce([message]);
    await expect(repo.createConversation({ jobId: "job" })).resolves.toBe(conversation);
    await expect(repo.createMessage({ conversationId: "conv" })).resolves.toBe(message);
    await expect(repo.createMessagesBatch([{ conversationId: "conv" }])).resolves.toEqual([message]);
  });

  it("deletes messages with an owned conversation and returns null otherwise", async () => {
    const conversation = { id: "conv" };
    conversations.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(conversation);
    await expect(repo.deleteConversation("conv", "user")).resolves.toBeNull();
    await expect(repo.deleteConversation("conv", "user")).resolves.toBe(conversation);
    expect(messages.delete).toHaveBeenCalledWith({ conversationId: "conv" });
    expect(conversations.delete).toHaveBeenCalledWith({ id: "conv", userId: "user" });
  });

  it("lists messages and updates conversation metadata", async () => {
    messages.find.mockResolvedValue([]);
    await repo.findMessagesByConversationId("conv");
    await repo.updateConversationTitle("conv", "Title");
    await repo.updateGeneratingStatus("conv", { status: AsyncMetadataStatusEnum.Processing, timestamp: new Date() });
    expect(messages.find).toHaveBeenCalledWith({ where: { conversationId: "conv" }, order: { createdAt: "ASC" } });
  });

  it("marks stale generations failed", async () => {
    const qb = { update: vi.fn(), set: vi.fn(), where: vi.fn(), andWhere: vi.fn(), execute: vi.fn() };
    qb.update.mockReturnValue(qb);
    qb.set.mockReturnValue(qb);
    qb.where.mockReturnValue(qb);
    qb.andWhere.mockReturnValue(qb);
    qb.execute.mockResolvedValue({ affected: 2 });
    conversations.createQueryBuilder.mockReturnValue(qb);
    await expect(repo.resetStaleGeneratingStatus()).resolves.toBe(2);
    expect(qb.where).toHaveBeenCalledWith("generating_status->>'status' = :status", {
      status: AsyncMetadataStatusEnum.Processing,
    });
  });
});
