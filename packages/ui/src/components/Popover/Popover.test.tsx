import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Popover } from "./Popover";

describe("Popover", () => {
  it("renders trigger", () => {
    render(<Popover trigger={<button type="button">Open</button>}>Content</Popover>);
    expect(screen.getByRole("button", { name: /open/i })).toBeInTheDocument();
  });

  it("renders only trigger when disabled", () => {
    render(
      <Popover trigger={<button type="button">Only</button>} enabled={false}>
        Content
      </Popover>,
    );
    expect(screen.getByRole("button", { name: /only/i })).toBeInTheDocument();
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("opens content on trigger click", async () => {
    render(<Popover trigger={<button type="button">Show</button>}>Popover content</Popover>);
    fireEvent.click(screen.getByRole("button", { name: /show/i }));
    expect(await screen.findByText("Popover content")).toBeInTheDocument();
  });
});
