import { cn } from "@job-tracker/ui";
import { act, render, screen } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";

import { PasteListenerProvider } from "./PasteListenerProvider";

// Mock next/navigation
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

// Mock GraphQL hooks
vi.mock("@/gql/hooks", () => ({
  ApplicationQuickFilter: { Draft: "DRAFT" },
  JobsDocument: { __brand: "DocumentNode" },
  useCreateDraftCaptureJobMutation: () => [
    vi.fn(() => Promise.resolve({ data: { createJob: { id: "1" } } })),
    { loading: false },
  ],
}));

// Mock toast queue
vi.mock("@/modules/jobs/shared/hooks/useToastQueue", () => ({
  useToastQueue: () => ({ enqueueToast: vi.fn() }),
}));

function dispatchPasteEvent(clipboardData: Record<string, string> = {}) {
  const event = new Event("paste", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "clipboardData", {
    value: { getData: (type: string) => clipboardData[type] || "" },
  });
  Object.defineProperty(event, "preventDefault", { value: vi.fn() });
  window.dispatchEvent(event);
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
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", {
      value: { getData: () => "pasted text" },
    });
    Object.defineProperty(event, "preventDefault", { value: vi.fn() });

    editor.dispatchEvent(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("skips paste when target is an input", () => {
    render(
      <TestWrapper>
        <input data-testid="input" />
      </TestWrapper>,
    );

    const input = screen.getByTestId("input");
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", {
      value: { getData: () => "pasted text" },
    });
    Object.defineProperty(event, "preventDefault", { value: vi.fn() });

    input.dispatchEvent(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("skips paste when target is a textarea", () => {
    render(
      <TestWrapper>
        <textarea data-testid="textarea" />
      </TestWrapper>,
    );

    const textarea = screen.getByTestId("textarea");
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", {
      value: { getData: () => "pasted text" },
    });
    Object.defineProperty(event, "preventDefault", { value: vi.fn() });

    textarea.dispatchEvent(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("skips paste when activeElement is inside ProseMirror", () => {
    render(
      <TestWrapper>
        <div data-testid="wrapper">
          <div
            className={cn("ProseMirror")}
            contentEditable="true"
            data-testid="prosemirror"
          />
        </div>
      </TestWrapper>,
    );

    const prosemirror = screen.getByTestId("prosemirror");
    act(() => {
      prosemirror.focus();
    });

    const wrapper = screen.getByTestId("wrapper");
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", {
      value: { getData: () => "pasted text" },
    });
    Object.defineProperty(event, "preventDefault", { value: vi.fn() });

    wrapper.dispatchEvent(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("skips paste when activeElement is a nested child of ProseMirror", () => {
    render(
      <TestWrapper>
        <div
          className={cn("ProseMirror")}
          contentEditable="true"
          data-testid="prosemirror"
        >
          <p data-testid="paragraph">Some text</p>
        </div>
      </TestWrapper>,
    );

    const paragraph = screen.getByTestId("paragraph");
    act(() => {
      paragraph.focus();
    });

    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", {
      value: { getData: () => "pasted text" },
    });
    Object.defineProperty(event, "preventDefault", { value: vi.fn() });

    paragraph.dispatchEvent(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("triggers dialog when pasting outside editors", async () => {
    render(
      <TestWrapper>
        <div data-testid="page-content">Page content</div>
      </TestWrapper>,
    );

    await act(async () => {
      dispatchPasteEvent({ "text/plain": "https://example.com/job-posting" });
    });

    expect(await screen.findByText(/paste detected/i)).toBeInTheDocument();
  });
});
