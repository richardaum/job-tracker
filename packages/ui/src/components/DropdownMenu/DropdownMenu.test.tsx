import { SignOutIcon, UserIcon } from "@phosphor-icons/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "./DropdownMenu";

describe("DropdownMenu", () => {
  it("opens content from trigger click", async () => {
    render(
      <DropdownMenu trigger={<button type="button">Open menu</button>}>
        <DropdownMenuItem icon={<UserIcon size={14} weight="regular" />}>View profile</DropdownMenuItem>
      </DropdownMenu>,
    );

    fireEvent.pointerDown(screen.getByRole("button", { name: /open menu/i }));
    expect(await screen.findByText("View profile")).toBeInTheDocument();
  });

  it("calls onSelect when item is selected", async () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu trigger={<button type="button">Open menu</button>}>
        <DropdownMenuItem onSelect={onSelect} icon={<SignOutIcon size={14} weight="regular" />}>
          Sign out
        </DropdownMenuItem>
        <DropdownMenuSeparator />
      </DropdownMenu>,
    );

    fireEvent.pointerDown(screen.getByRole("button", { name: /open menu/i }));
    fireEvent.click(await screen.findByText("Sign out"));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
