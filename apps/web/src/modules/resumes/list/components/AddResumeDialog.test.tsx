import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AddResumeDialog } from "./AddResumeDialog";

const pushMock = vi.fn();
const createResumeMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

vi.mock("@/gql/hooks", async () => {
  const actual =
    await vi.importActual<typeof import("@/gql/hooks")>("@/gql/hooks");
  return { ...actual, useCreateResumeMutation: () => [createResumeMock] };
});

describe("AddResumeDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when open", () => {
    render(<AddResumeDialog open={true} onOpenChange={() => {}} />);
    expect(screen.getByText("Add Resume")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/e.g. Senior Software Engineer/i),
    ).toBeInTheDocument();
  });

  it("calls createResume and redirects on success", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    createResumeMock.mockResolvedValue({
      data: { createResume: { id: "res-1", title: "My Resume" } },
    });

    render(<AddResumeDialog open={true} onOpenChange={onOpenChange} />);

    const input = screen.getByPlaceholderText(/e.g. Senior Software Engineer/i);
    await user.type(input, "My Resume");

    const createButton = screen.getByRole("button", { name: "Create" });
    await user.click(createButton);

    await waitFor(() => {
      expect(createResumeMock).toHaveBeenCalledWith({
        variables: {
          input: { title: "My Resume", content: expect.any(String) },
        },
      });
      expect(pushMock).toHaveBeenCalledWith("/resumes/res-1");
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("disables create button when title is empty", () => {
    render(<AddResumeDialog open={true} onOpenChange={() => {}} />);
    const createButton = screen.getByRole("button", { name: "Create" });
    expect(createButton).toBeDisabled();
  });
});
