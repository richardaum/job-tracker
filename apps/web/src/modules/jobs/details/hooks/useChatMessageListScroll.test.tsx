import { render, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useChatMessageListScroll } from "./useChatMessageListScroll";

type HarnessProps = {
  conversationId: string | null;
  messageCount: number;
  isStreaming: boolean;
  streamContent: string;
};

function ScrollHarness({ conversationId, messageCount, isStreaming, streamContent }: HarnessProps) {
  const { scrollContainerRef } = useChatMessageListScroll({ conversationId, messageCount, isStreaming, streamContent });

  return <div ref={scrollContainerRef} data-testid="scroll-container" />;
}

function mockScrollContainer() {
  const scrollTo = Element.prototype.scrollTo as ReturnType<typeof vi.fn>;

  Object.defineProperty(HTMLDivElement.prototype, "scrollHeight", {
    configurable: true,
    get() {
      return 1_000;
    },
  });

  return scrollTo;
}

describe("useChatMessageListScroll", () => {
  it("snaps to bottom when a conversation opens", () => {
    const scrollTo = mockScrollContainer();

    render(<ScrollHarness conversationId="conv-1" messageCount={2} isStreaming={false} streamContent="" />);

    expect(scrollTo).toHaveBeenCalledWith({ top: 1_000, behavior: "auto" });
  });

  it("smoothly follows new messages after the initial snap", () => {
    const scrollTo = mockScrollContainer();

    const { rerender } = render(
      <ScrollHarness conversationId="conv-1" messageCount={1} isStreaming={false} streamContent="" />,
    );

    scrollTo.mockClear();

    rerender(<ScrollHarness conversationId="conv-1" messageCount={2} isStreaming={false} streamContent="" />);

    expect(scrollTo).toHaveBeenCalledWith({ top: 1_000, behavior: "smooth" });
  });

  it("resets to an instant snap when the conversation changes", () => {
    const scrollTo = mockScrollContainer();

    const { rerender } = render(
      <ScrollHarness conversationId="conv-1" messageCount={1} isStreaming={false} streamContent="" />,
    );

    scrollTo.mockClear();

    rerender(<ScrollHarness conversationId="conv-2" messageCount={3} isStreaming={false} streamContent="" />);

    expect(scrollTo).toHaveBeenCalledWith({ top: 1_000, behavior: "auto" });
    expect(scrollTo).not.toHaveBeenCalledWith({ top: 1_000, behavior: "smooth" });
  });

  it("follows streaming chunks without animation", () => {
    const scrollTo = mockScrollContainer();

    const { rerender } = render(
      <ScrollHarness conversationId="conv-1" messageCount={1} isStreaming={true} streamContent="Hel" />,
    );

    scrollTo.mockClear();

    rerender(<ScrollHarness conversationId="conv-1" messageCount={1} isStreaming={true} streamContent="Hello" />);

    expect(scrollTo).toHaveBeenCalledWith({ top: 1_000, behavior: "auto" });
    expect(scrollTo).not.toHaveBeenCalledWith({ top: 1_000, behavior: "smooth" });
  });

  it("snaps instantly when streaming finishes instead of animating", () => {
    const scrollTo = mockScrollContainer();

    const { rerender } = render(
      <ScrollHarness conversationId="conv-1" messageCount={2} isStreaming={true} streamContent="Hello" />,
    );

    scrollTo.mockClear();

    rerender(<ScrollHarness conversationId="conv-1" messageCount={3} isStreaming={false} streamContent="" />);

    expect(scrollTo).toHaveBeenCalledWith({ top: 1_000, behavior: "auto" });
    expect(scrollTo).not.toHaveBeenCalledWith({ top: 1_000, behavior: "smooth" });
  });

  it("returns the scroll container ref", () => {
    const { result } = renderHook(() =>
      useChatMessageListScroll({ conversationId: "conv-1", messageCount: 1, isStreaming: false, streamContent: "" }),
    );

    expect(result.current.scrollContainerRef).toBeDefined();
  });
});
