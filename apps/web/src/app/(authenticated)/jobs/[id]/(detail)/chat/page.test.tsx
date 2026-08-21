import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AiChatPage from "./page";

const { getPostHogDistinctIdMock, getServerFeatureFlagMock, redirectMock } = vi.hoisted(() => ({
  getPostHogDistinctIdMock: vi.fn(),
  getServerFeatureFlagMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: redirectMock }));

vi.mock("@/lib/posthog-server", () => ({
  getPostHogDistinctId: () => getPostHogDistinctIdMock(),
  getServerFeatureFlag: (...args: unknown[]) => getServerFeatureFlagMock(...args),
}));

vi.mock("@/modules/jobs/details/components/AiChatContent", () => ({
  AiChatContent: ({ jobId }: { jobId: string }) => <div>AI Chat for {jobId}</div>,
}));

describe("AiChatPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPostHogDistinctIdMock.mockResolvedValue("user-1");
  });

  it("renders AI Chat when its feature flag is enabled", async () => {
    getServerFeatureFlagMock.mockResolvedValue(true);

    render(await AiChatPage({ params: Promise.resolve({ id: "job-1" }) }));

    expect(screen.getByText("AI Chat for job-1")).toBeInTheDocument();
    expect(getServerFeatureFlagMock).toHaveBeenCalledWith("ai-chat-enabled", "user-1");
  });

  it("redirects before rendering AI Chat when its feature flag is disabled", async () => {
    getServerFeatureFlagMock.mockResolvedValue(false);
    redirectMock.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(AiChatPage({ params: Promise.resolve({ id: "job-1" }) })).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/jobs/job-1");
  });
});
