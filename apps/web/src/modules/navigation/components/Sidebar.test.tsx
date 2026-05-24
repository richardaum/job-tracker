import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Sidebar } from "./Sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/jobs",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock("next/image", () => ({
  default: (props: { alt?: string }) => (
    <span data-testid="mock-image" aria-label={props.alt ?? ""} />
  ),
}));

vi.mock("@/lib/apollo-client", () => ({
  apolloClient: { clearStore: vi.fn() },
}));

const mockUser = {
  id: "u1",
  name: "Test User",
  email: "test@example.com",
  role: "user",
  avatarUrl: null as string | null,
};

describe("Sidebar", () => {
  it("does not render a Matches nav link", () => {
    render(<Sidebar user={mockUser} />);
    expect(screen.queryByRole("link", { name: "Matches" })).toBeNull();
  });

  it("does not include /matches in any menu link href", () => {
    render(<Sidebar user={mockUser} />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((el) => el.getAttribute("href"));
    expect(hrefs.filter((h) => h?.startsWith("/matches"))).toEqual([]);
  });
});
