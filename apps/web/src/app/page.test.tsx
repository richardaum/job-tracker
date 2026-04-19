import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the Job Tracker heading", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: /job tracker/i })).toBeInTheDocument();
  });
});
