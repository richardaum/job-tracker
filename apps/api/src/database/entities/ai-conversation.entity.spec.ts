import { AiConversationEntity } from "@api/database/entities/ai-conversation.entity";
import { describe, expect, it } from "vitest";

describe("AiConversationEntity", () => {
  it("accepts all fields with property names", () => {
    const now = new Date();
    const entity = new AiConversationEntity();
    entity.id = "conv-1";
    entity.jobId = "job-1";
    entity.userId = "user-1";
    entity.title = "Custom title";
    entity.createdAt = now;
    entity.updatedAt = now;

    expect(entity.id).toBe("conv-1");
    expect(entity.jobId).toBe("job-1");
    expect(entity.userId).toBe("user-1");
    expect(entity.title).toBe("Custom title");
    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.updatedAt).toBeInstanceOf(Date);
  });

  it("does not have a status field", () => {
    const entity = new AiConversationEntity();
    expect(entity).not.toHaveProperty("status");
  });
});
