import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Wizard, WizardMain, WizardSidebar } from "./Wizard";

const steps = [
  { id: "step1", title: "First step", description: "Begin here" },
  { id: "step2", title: "Second step" },
  { id: "step3", title: "Third step", description: "Finish" },
];

describe("Wizard", () => {
  it("renders all steps in sidebar", () => {
    render(
      <Wizard steps={steps} currentStep={0}>
        <WizardSidebar />
        <WizardMain>Content</WizardMain>
      </Wizard>,
    );
    expect(screen.getByText("First step")).toBeInTheDocument();
    expect(screen.getByText("Second step")).toBeInTheDocument();
    expect(screen.getByText("Third step")).toBeInTheDocument();
  });

  it("renders step descriptions when provided", () => {
    render(
      <Wizard steps={steps} currentStep={0}>
        <WizardSidebar />
        <WizardMain>Content</WizardMain>
      </Wizard>,
    );
    expect(screen.getByText("Begin here")).toBeInTheDocument();
    expect(screen.getByText("Finish")).toBeInTheDocument();
  });

  it("highlights current step as active", () => {
    render(
      <Wizard steps={steps} currentStep={1}>
        <WizardSidebar />
        <WizardMain>Content</WizardMain>
      </Wizard>,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons[1].className).toContain("bg-bg-brand-subtle");
  });

  it("calls onStepChange when a step is clicked", () => {
    const handleStepChange = vi.fn();
    render(
      <Wizard steps={steps} currentStep={0} onStepChange={handleStepChange}>
        <WizardSidebar />
        <WizardMain>Content</WizardMain>
      </Wizard>,
    );
    fireEvent.click(screen.getByText("Second step"));
    expect(handleStepChange).toHaveBeenCalledWith(1);
  });

  it("renders main content", () => {
    render(
      <Wizard steps={steps} currentStep={0}>
        <WizardSidebar />
        <WizardMain>Main content area</WizardMain>
      </Wizard>,
    );
    expect(screen.getByText("Main content area")).toBeInTheDocument();
  });

  it("throws when used without Wizard wrapper", () => {
    expect(() => render(<WizardSidebar />)).toThrow("Wizard components must be used inside <Wizard>.");
  });
});
