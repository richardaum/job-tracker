import { BellIcon } from "@phosphor-icons/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("renders an accessible icon button", () => {
    render(
      <IconButton
        icon={<BellIcon size={16} weight="regular" />}
        label="Notify"
        tooltip="Notify"
      />,
    );
    expect(screen.getByRole("button", { name: /notify/i })).toBeInTheDocument();
  });

  it("calls onClick when pressed", () => {
    const onClick = vi.fn();
    render(
      <IconButton
        icon={<BellIcon size={16} weight="regular" />}
        label="Notify"
        tooltip="Notify"
        onClick={onClick}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /notify/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
