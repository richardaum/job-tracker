import { AiMessageEntity } from "@api/database/entities/ai-message.entity";
import { describe, expect, it } from "vitest";

describe("AiMessageEntity", () => {
  it("maps all fields correctly", () => {
    const entity = new AiMessageEntity();
    entity.id = "msg-1";
    entity.conversationId = "conv-1";
    entity.role = "user";
    entity.content = "Hello";

    expect(entity.id).toBe("msg-1");
    expect(entity.conversationId).toBe("conv-1");
    expect(entity.role).toBe("user");
    expect(entity.content).toBe("Hello");
  });

  it("sets createdAt to a Date object", () => {
    const now = new Date();
    const entity = new AiMessageEntity();
    entity.createdAt = now;

    expect(entity.createdAt).toBeInstanceOf(Date);
  });

  it("does not have an updatedAt property", () => {
    const entity = new AiMessageEntity();
    entity.id = "msg-1";

    expect(entity).not.toHaveProperty("updatedAt");
  });
});
