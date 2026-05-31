import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ListItemCard } from "./ListItemCard";

describe("ListItemCard", () => {
  it("renders compound Title and Actions slots", () => {
    render(
      <ListItemCard
        title={<ListItemCard.Title>Acme role</ListItemCard.Title>}
        actions={
          <ListItemCard.Actions>
            <span data-testid="action-slot">⋯</span>
          </ListItemCard.Actions>
        }
      />,
    );
    expect(screen.getByText("Acme role")).toBeInTheDocument();
    expect(screen.getByTestId("action-slot")).toBeInTheDocument();
  });

  it("supports multiple controls inside Actions", () => {
    render(
      <ListItemCard
        title={<ListItemCard.Title>Docs</ListItemCard.Title>}
        actions={
          <ListItemCard.Actions>
            <button type="button">a</button>
            <button type="button">b</button>
          </ListItemCard.Actions>
        }
      />,
    );
    expect(screen.getByRole("button", { name: "a" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "b" })).toBeInTheDocument();
  });

  it("applies titleSize sm to Title", () => {
    render(
      <ListItemCard
        title={<ListItemCard.Title size="sm">Small title</ListItemCard.Title>}
      />,
    );
    const el = screen.getByText("Small title");
    expect(el).toHaveClass("text-sm");
    expect(el).not.toHaveClass("text-base");
  });

  it("applies interactive styles when interactive or asChild is set", () => {
    const { rerender } = render(
      <ListItemCard
        title={<ListItemCard.Title interactive>Interactive</ListItemCard.Title>}
      />,
    );
    expect(screen.getByText("Interactive")).toHaveClass("hover:underline");

    rerender(
      <ListItemCard
        title={
          <ListItemCard.Title asChild>
            <a href="/">Link</a>
          </ListItemCard.Title>
        }
      />,
    );
    expect(screen.getByRole("link")).toHaveClass("hover:underline");
  });
});
