import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ResumeType } from "@/gql/hooks";

import ResumesList from "./ResumesList";

vi.mock("@/modules/resumes/list/components/ResumeCard", () => ({
  ResumeCard: ({
    resume,
    onDelete,
    onSetAsDefault,
  }: {
    resume: Pick<
      ResumeType,
      "id" | "title" | "content" | "isDefault" | "createdAt" | "updatedAt"
    >;
    onDelete?: (id: string, title: string) => void;
    onSetAsDefault?: (id: string) => void;
  }) => (
    <div data-testid="resume-card">
      <span data-testid="card-title">{resume.title}</span>
      <button
        aria-label={`delete-${resume.id}`}
        onClick={() => onDelete?.(resume.id, resume.title)}
      />
      <button
        aria-label={`star-${resume.id}`}
        onClick={() => onSetAsDefault?.(resume.id)}
      />
    </div>
  ),
}));

function createResume(
  overrides: Partial<
    Pick<
      ResumeType,
      "id" | "title" | "content" | "isDefault" | "createdAt" | "updatedAt"
    >
  > = {},
): Pick<
  ResumeType,
  "id" | "title" | "content" | "isDefault" | "createdAt" | "updatedAt"
> {
  return {
    id: "res-1",
    title: "Test Resume",
    content: '{"type":"doc","content":[]}',
    isDefault: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("ResumesList", () => {
  it("loading — renders skeleton (no cards)", () => {
    render(
      <ResumesList
        resumes={[]}
        loading={true}
        onDelete={async () => {}}
        onSetAsDefault={async () => {}}
      />,
    );
    expect(screen.queryByTestId("resume-card")).not.toBeInTheDocument();
  });

  it("empty — renders empty state", () => {
    render(
      <ResumesList
        resumes={[]}
        loading={false}
        onDelete={async () => {}}
        onSetAsDefault={async () => {}}
      />,
    );
    expect(screen.getByText("No resumes yet.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Add your first resume to start tracking your profile versions.",
      ),
    ).toBeInTheDocument();
  });

  it("error — renders error text", () => {
    render(
      <ResumesList
        resumes={[]}
        loading={false}
        error={new Error("Network error")}
        onDelete={async () => {}}
        onSetAsDefault={async () => {}}
      />,
    );
    expect(
      screen.getByText("Failed to load resumes. Please refresh the page."),
    ).toBeInTheDocument();
  });

  it("data — renders Stack of ResumeCard components", () => {
    const resumes = [
      createResume({ id: "res-1", title: "Resume A" }),
      createResume({ id: "res-2", title: "Resume B" }),
    ];
    render(
      <ResumesList
        resumes={resumes}
        loading={false}
        onDelete={async () => {}}
        onSetAsDefault={async () => {}}
      />,
    );
    const cards = screen.getAllByTestId("resume-card");
    expect(cards).toHaveLength(2);
    expect(screen.getByText("Resume A")).toBeInTheDocument();
    expect(screen.getByText("Resume B")).toBeInTheDocument();
  });

  it("calls onDelete when delete triggered", () => {
    const onDelete = vi.fn();
    const resume = createResume({ id: "res-1", title: "My Resume" });
    render(
      <ResumesList
        resumes={[resume]}
        loading={false}
        onDelete={onDelete}
        onSetAsDefault={async () => {}}
      />,
    );
    const deleteBtn = screen.getByLabelText("delete-res-1");
    deleteBtn.click();
    expect(onDelete).toHaveBeenCalledWith("res-1", "My Resume");
  });

  it("calls onSetAsDefault when star triggered", () => {
    const onSetAsDefault = vi.fn();
    const resume = createResume({ id: "res-1", title: "My Resume" });
    render(
      <ResumesList
        resumes={[resume]}
        loading={false}
        onDelete={async () => {}}
        onSetAsDefault={onSetAsDefault}
      />,
    );
    const starBtn = screen.getByLabelText("star-res-1");
    starBtn.click();
    expect(onSetAsDefault).toHaveBeenCalledWith("res-1");
  });
});
