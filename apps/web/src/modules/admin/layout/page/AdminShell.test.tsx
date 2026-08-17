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
  it("renders the Registrations tab as active when navigated to /admin/registrations", () => {
    useCurrentUserMock.mockReturnValue({ user: { id: "admin-1", role: Role.Admin }, loading: false });

    render(
      <AdminShell>
        <div>Registrations content</div>
      </AdminShell>,
    );

    const registrationsTab = screen.getByRole("tab", { name: /registrations/i });
    expect(registrationsTab).toHaveAttribute("data-state", "active");
    expect(screen.getByText("Registrations content")).toBeInTheDocument();
  });
});
