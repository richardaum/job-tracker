import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { GoogleLoginButton } from "./GoogleLoginButton";

describe("GoogleLoginButton", () => {
  it("renders button label", () => {
    render(<GoogleLoginButton />);
    expect(
      screen.getByRole("button", { name: /continue with google/i }),
    ).toBeInTheDocument();
  });

  it("fires onClick handler", () => {
    const handleClick = vi.fn();
    render(<GoogleLoginButton onClick={handleClick} />);
    screen.getByRole("button", { name: /continue with google/i }).click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
