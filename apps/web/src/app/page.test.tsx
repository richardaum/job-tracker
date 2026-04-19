import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the Job Tracker heading", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: /job tracker/i })).toBeInTheDocument();
  });
});
