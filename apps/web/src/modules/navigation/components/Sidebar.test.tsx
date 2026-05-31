import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { CurrentUser } from "@/hooks/useCurrentUser";

import { Sidebar } from "./Sidebar";

const pushMock = vi.fn();
const replaceMock = vi.fn();
const pathnameMock = vi.fn(() => "/jobs");

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  usePathname: () => pathnameMock(),
}));

vi.mock("next/image", () => ({
  default: (props: { alt?: string; src?: string }) => (
    <span data-testid="mock-image" aria-label={props.alt ?? ""} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
    "aria-label": ariaLabel,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
    "aria-label"?: string;
    [key: string]: unknown;
  }) => (
    <a href={href} onClick={onClick} aria-label={ariaLabel} data-testid={`link-${href}`} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/api-endpoints", () => ({
  getApiBaseUrl: () => "http://localhost:3101",
}));

const clearStoreMock = vi.fn().mockResolvedValue(undefined);

vi.mock("@apollo/client/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@apollo/client/react")>();
  return { ...actual, useApolloClient: () => ({ clearStore: clearStoreMock }) };
});

vi.mock("@/modules/navigation/components/AppBrandMark", () => ({
  AppBrandMark: ({ size: _size }: { size?: number }) => <span data-testid="brand-mark" />,
}));

vi.mock("@/modules/navigation/components/ObfuscatedText", () => ({
  ObfuscatedText: ({ text }: { text: string; obfuscatedText: string }) => <span>{text}</span>,
}));

const mockUser: CurrentUser = {
  __typename: "UserType" as const,
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  role: "USER",
  avatarUrl: null,
  accounts: [],
};

describe("Sidebar", () => {
  it("user card is Link with href=/profile", () => {
    render(<Sidebar user={mockUser} />);
    const userLinks = screen.getAllByTestId("link-/profile");
    expect(userLinks.length).toBeGreaterThanOrEqual(1);
    expect(userLinks[0]).toHaveAttribute("href", "/profile");
  });

  it("user card shows user name and email", () => {
    render(<Sidebar user={mockUser} />);
    const names = screen.getAllByText("John Doe");
    expect(names.length).toBeGreaterThanOrEqual(1);
    const emails = screen.getAllByText("john@example.com");
    expect(emails.length).toBeGreaterThanOrEqual(1);
  });

  it("user card shows initials circle when no avatarUrl", () => {
    render(<Sidebar user={mockUser} />);
    const initials = screen.getAllByText("JD");
    expect(initials.length).toBeGreaterThanOrEqual(1);
  });

  it("user card shows avatar image when avatarUrl present", () => {
    const userWithAvatar: CurrentUser = {
      ...mockUser,
      avatarUrl: "https://example.com/avatar.jpg",
    };
    render(<Sidebar user={userWithAvatar} />);
    const imgs = screen.getAllByTestId("mock-image");
    expect(imgs.length).toBeGreaterThanOrEqual(1);
  });

  it("user card click closes mobile sidebar via onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Sidebar user={mockUser} onClose={onClose} />);

    const userLinks = screen.getAllByTestId("link-/profile");
    await user.click(userLinks[0]!);
    expect(onClose).toHaveBeenCalled();
  });

  it('"Resumes" not in nav items', () => {
    render(<Sidebar user={mockUser} />);
    expect(screen.queryAllByText("Resumes")).toHaveLength(0);
  });

  it('Settings link has href="/profile/settings"', () => {
    render(<Sidebar user={mockUser} />);
    const settingsLinks = screen.getAllByTestId("link-/profile/settings");
    expect(settingsLinks.length).toBeGreaterThanOrEqual(1);
    expect(settingsLinks[0]).toHaveAttribute("href", "/profile/settings");
  });

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

  it("renders main nav items", () => {
    render(<Sidebar user={mockUser} />);
    expect(screen.getAllByText("Jobs").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Sources").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Companies").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Salary Calculator").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Admin").length).toBeGreaterThanOrEqual(1);
  });

  it("renders bottom items — Help Center and Settings", () => {
    render(<Sidebar user={mockUser} />);
    expect(screen.getAllByText("Help Center").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Settings").length).toBeGreaterThanOrEqual(1);
  });

  it("renders logout button", () => {
    render(<Sidebar user={mockUser} />);
    expect(screen.getAllByText("Log Out").length).toBeGreaterThanOrEqual(1);
  });
});
