import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { GoogleLoginButton } from "./GoogleLoginButton";

describe("GoogleLoginButton", () => {
  it("renders button label", () => {
    render(<GoogleLoginButton />);
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  it("fires onClick handler", () => {
    const handleClick = vi.fn();
    render(<GoogleLoginButton onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
