import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders children in the document", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders with explicit intent classes", () => {
    render(<Button intent="secondary">Secondary action</Button>);
    expect(screen.getByRole("button", { name: /secondary action/i })).toHaveClass("bg-bg-surface");
  });

  it("renders outlined intent with transparent background", () => {
    render(<Button intent="outlined">Outline</Button>);
    expect(screen.getByRole("button", { name: /outline/i })).toHaveClass("bg-transparent");
  });

  it("is disabled while loading", () => {
    render(<Button state="loading">Saving</Button>);
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });

  it("renders ghost with error color scheme", () => {
    render(
      <Button intent="ghost" colorScheme="error">
        Danger
      </Button>,
    );
    const btn = screen.getByRole("button", { name: /danger/i });
    expect(btn.className).toContain("text-text-error");
    expect(btn.className).toContain("hover:bg-bg-error-subtle");
  });

  it("renders ghost with success color scheme", () => {
    render(
      <Button intent="ghost" colorScheme="success">
        All good
      </Button>,
    );
    const btn = screen.getByRole("button", { name: /all good/i });
    expect(btn.className).toContain("text-text-success");
    expect(btn.className).toContain("hover:bg-bg-success-subtle");
  });

  it("ignores colorScheme on secondary intent", () => {
    render(
      <Button intent="secondary" colorScheme="error">
        Secondary
      </Button>,
    );
    const btn = screen.getByRole("button", { name: /secondary/i });
    expect(btn.className).toContain("bg-bg-surface");
    expect(btn.className).toContain("text-text-primary");
  });
});
