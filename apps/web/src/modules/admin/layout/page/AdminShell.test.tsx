import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Role } from "@/gql/graphql";

const replaceMock = vi.fn();
const pushMock = vi.fn();
const useCurrentUserMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/registrations",
  useRouter: () => ({ replace: replaceMock, push: pushMock }),
}));

vi.mock("@/hooks/useCurrentUser", () => ({ useCurrentUser: () => useCurrentUserMock() }));

import { AdminShell } from "./AdminShell";

describe("AdminShell", () => {
  it("renders the Users tab as active when navigated to the legacy /admin/registrations path", () => {
    useCurrentUserMock.mockReturnValue({ user: { id: "admin-1", role: Role.Admin }, loading: false });

    render(
      <AdminShell>
        <div>Registrations content</div>
      </AdminShell>,
    );

    const usersTab = screen.getByRole("tab", { name: /users/i });
    expect(usersTab).toHaveAttribute("data-state", "active");
    expect(screen.getByText("Registrations content")).toBeInTheDocument();
  });
});
