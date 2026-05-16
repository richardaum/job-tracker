import { cn } from "@job-tracker/ui";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi } from "vitest";
import React from "react";

import { PasteListenerProvider } from "./PasteListenerProvider";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock GraphQL hooks
vi.mock("@/gql/hooks", () => ({
  DraftApplicationsListDocument: { __brand: "DocumentNode" },
  useCreateDraftApplicationMutation: () => [
    vi.fn(() => Promise.resolve({ data: { createDraftApplication: { id: "1" } } })),
    { loading: false },
  ],
}));

// Mock toast queue
vi.mock("@/modules/applications/shared/hooks/useToastQueue", () => ({
  useToastQueue: () => ({ enqueueToast: vi.fn() }),
}));

function createPasteEvent(clipboardData: Record<string, string> = {}) {
  const event = new Event("paste", { bubbles: true }) as unknown as ClipboardEvent;
  (event as unknown as { clipboardData: { getData: (type: string) => string } }).clipboardData = {
    getData: (type: string) => clipboardData[type] || "",
  };
  return event;
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <PasteListenerProvider>{children}</PasteListenerProvider>;
}

describe("PasteListenerProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips paste when target is inside contenteditable", () => {
    render(
      <TestWrapper>
        <div contentEditable="true" data-testid="editor" />
      </TestWrapper>,
    );

    const editor = screen.getByTestId("editor");
    const pasteEvent = createPasteEvent({ "text/plain": "pasted text" });

    fireEvent(editor, pasteEvent);
    expect(pasteEvent.defaultPrevented).toBe(false);
  });

  it("skips paste when target is an input", () => {
    render(
      <TestWrapper>
        <input data-testid="input" />
      </TestWrapper>,
    );

    const input = screen.getByTestId("input");
    const pasteEvent = createPasteEvent({ "text/plain": "pasted text" });

    fireEvent(input, pasteEvent);
    expect(pasteEvent.defaultPrevented).toBe(false);
  });

  it("skips paste when target is a textarea", () => {
    render(
      <TestWrapper>
        <textarea data-testid="textarea" />
      </TestWrapper>,
    );

    const textarea = screen.getByTestId("textarea");
    const pasteEvent = createPasteEvent({ "text/plain": "pasted text" });

    fireEvent(textarea, pasteEvent);
    expect(pasteEvent.defaultPrevented).toBe(false);
  });

  it("skips paste when activeElement is inside ProseMirror", () => {
    render(
      <TestWrapper>
        <div>
          <div className={cn("ProseMirror")} contentEditable="true" data-testid="prosemirror" />
        </div>
      </TestWrapper>,
    );

    const prosemirror = screen.getByTestId("prosemirror");
    act(() => {
      prosemirror.focus();
    });

    const wrapper = screen.getByTestId("prosemirror").parentElement!;
    const pasteEvent = createPasteEvent({ "text/plain": "pasted text" });

    fireEvent(wrapper, pasteEvent);
    expect(pasteEvent.defaultPrevented).toBe(false);
  });

  it("skips paste when activeElement is a nested child of ProseMirror", () => {
    render(
      <TestWrapper>
        <div className={cn("ProseMirror")} contentEditable="true" data-testid="prosemirror">
          <p data-testid="paragraph">Some text</p>
        </div>
      </TestWrapper>,
    );

    const paragraph = screen.getByTestId("paragraph");
    act(() => {
      paragraph.focus();
    });

    const pasteEvent = createPasteEvent({ "text/plain": "pasted text" });

    fireEvent(paragraph, pasteEvent);
    expect(pasteEvent.defaultPrevented).toBe(false);
  });

  it("triggers dialog when pasting outside editors", () => {
    render(
      <TestWrapper>
        <div data-testid="page-content">Page content</div>
      </TestWrapper>,
    );

    const pageContent = screen.getByTestId("page-content");
    const pasteEvent = createPasteEvent({
      "text/plain": "https://example.com/job-posting",
    });

    fireEvent(pageContent, pasteEvent);
    expect(pasteEvent.defaultPrevented).toBe(true);
    expect(screen.getByText(/paste detected/i)).toBeInTheDocument();
  });
});
