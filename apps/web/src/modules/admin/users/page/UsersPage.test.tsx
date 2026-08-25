import { SlotsProvider } from "@job-tracker/react-slots";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Role, UserStatus } from "@/gql/graphql";
import { AdminSubtabsSlot } from "@/modules/admin/layout/admin-header.slots";

const useAdminUsersQueryMock = vi.fn();
const approveRegistrationMock = vi.fn().mockResolvedValue({});
const rejectRegistrationMock = vi.fn().mockResolvedValue({});
const resendApprovalEmailMock = vi.fn().mockResolvedValue({});
const removeUserMock = vi.fn().mockResolvedValue({});
const useFeatureFlagEnabledMock = vi.hoisted(() => vi.fn<(flagKey: string) => boolean>(() => true));

vi.mock("@/gql/hooks", () => ({
  useAdminUsersQuery: (options: unknown) => useAdminUsersQueryMock(options),
  useApproveRegistrationMutation: () => [approveRegistrationMock, { loading: false }],
  useRejectRegistrationMutation: () => [rejectRegistrationMock, { loading: false }],
  useResendApprovalEmailMutation: () => [resendApprovalEmailMock, { loading: false }],
  useRemoveUserMutation: () => [removeUserMock, { loading: false }],
}));

vi.mock("posthog-js/react", () => ({ useFeatureFlagEnabled: (flagKey: string) => useFeatureFlagEnabledMock(flagKey) }));

import UsersPage from "./UsersPage";

function renderPage() {
  return render(
    <SlotsProvider>
      <AdminSubtabsSlot.Slot />
      <UsersPage />
    </SlotsProvider>,
  );
}

async function openActionsMenu(name: string) {
  fireEvent.pointerDown(screen.getByRole("button", { name: new RegExp(`actions for ${name}`, "i") }));
  await screen.findByRole("menu");
}

const pendingUser = {
  id: "reg-1",
  name: "Pending Person",
  email: "pending@example.com",
  avatarUrl: null,
  role: Role.User,
  status: UserStatus.Pending,
  createdAt: "2026-01-01T00:00:00.000Z",
};

const activeUser = {
  id: "reg-2",
  name: "Active Person",
  email: "active@example.com",
  avatarUrl: null,
  role: Role.Admin,
  status: UserStatus.Active,
  createdAt: "2026-01-02T00:00:00.000Z",
};

describe("UsersPage", () => {
  const refetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    refetchMock.mockResolvedValue({});
    useFeatureFlagEnabledMock.mockReturnValue(true);
  });

  it("renders a skeleton while loading with no data yet", () => {
    useAdminUsersQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined, refetch: refetchMock });

    renderPage();

    expect(screen.queryByText(/no users found/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /actions for/i })).not.toBeInTheDocument();
  });

  it("renders the status filter tabs through the AdminSubtabsSlot slot", () => {
    useAdminUsersQueryMock.mockReturnValue({
      data: { registrations: [] },
      loading: false,
      error: undefined,
      refetch: refetchMock,
    });

    renderPage();

    expect(screen.getByRole("tab", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Pending" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Approved" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Rejected" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Deactivated" })).toBeInTheDocument();
  });

  it("renders an error state when the query fails", () => {
    useAdminUsersQueryMock.mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error("boom"),
      refetch: refetchMock,
    });

    renderPage();

    expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();
  });

  it("renders EmptyState when there are no users", () => {
    useAdminUsersQueryMock.mockReturnValue({
      data: { registrations: [] },
      loading: false,
      error: undefined,
      refetch: refetchMock,
    });

    renderPage();

    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });

  it("renders cards for whatever the query returns, with role and count", () => {
    useAdminUsersQueryMock.mockReturnValue({
      data: { registrations: [pendingUser, activeUser] },
      loading: false,
      error: undefined,
      refetch: refetchMock,
    });

    renderPage();

    expect(screen.getByText("Pending Person")).toBeInTheDocument();
    expect(screen.getByText("Active Person")).toBeInTheDocument();
    expect(screen.getByText("2 users")).toBeInTheDocument();
  });

  it("queries with no status by default, so the backend excludes deactivated users for All", () => {
    useAdminUsersQueryMock.mockReturnValue({
      data: { registrations: [activeUser] },
      loading: false,
      error: undefined,
      refetch: refetchMock,
    });

    renderPage();

    expect(useAdminUsersQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({ variables: expect.objectContaining({ status: undefined }) }),
    );
  });

  it("passes the selected status as a query variable when switching tabs", async () => {
    useAdminUsersQueryMock.mockReturnValue({
      data: { registrations: [] },
      loading: false,
      error: undefined,
      refetch: refetchMock,
    });

    renderPage();

    await userEvent.click(screen.getByRole("tab", { name: "Deactivated" }));

    expect(useAdminUsersQueryMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ variables: expect.objectContaining({ status: UserStatus.Deactivated }) }),
    );
  });

  it("passes the (debounced) search text as a query variable", async () => {
    useAdminUsersQueryMock.mockReturnValue({
      data: { registrations: [] },
      loading: false,
      error: undefined,
      refetch: refetchMock,
    });

    renderPage();

    fireEvent.change(screen.getByLabelText("Search users"), { target: { value: "ana" } });

    await waitFor(() => {
      expect(useAdminUsersQueryMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ variables: expect.objectContaining({ search: "ana" }) }),
      );
    });
  });

  it("shows Approve/Reject for a pending user's menu, but not Remove user", async () => {
    useAdminUsersQueryMock.mockReturnValue({
      data: { registrations: [pendingUser] },
      loading: false,
      error: undefined,
      refetch: refetchMock,
    });

    renderPage();

    await openActionsMenu("Pending Person");
    expect(screen.getByRole("menuitem", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Reject" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Remove user" })).not.toBeInTheDocument();
  });

  it("shows Resend approval email/Remove user for an active user's menu, but not Approve", async () => {
    useAdminUsersQueryMock.mockReturnValue({
      data: { registrations: [activeUser] },
      loading: false,
      error: undefined,
      refetch: refetchMock,
    });

    renderPage();

    await openActionsMenu("Active Person");
    expect(screen.getByRole("menuitem", { name: "Resend approval email" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Remove user" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Approve" })).not.toBeInTheDocument();
  });

  it("hides the resend approval email item when the feature flag is disabled", async () => {
    useFeatureFlagEnabledMock.mockReturnValue(false);
    useAdminUsersQueryMock.mockReturnValue({
      data: { registrations: [activeUser] },
      loading: false,
      error: undefined,
      refetch: refetchMock,
    });

    renderPage();

    await openActionsMenu("Active Person");
    expect(screen.queryByRole("menuitem", { name: "Resend approval email" })).not.toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Remove user" })).toBeInTheDocument();
  });

  it("calls approveRegistration with the correct userId and refetches", async () => {
    useAdminUsersQueryMock.mockReturnValue({
      data: { registrations: [pendingUser] },
      loading: false,
      error: undefined,
      refetch: refetchMock,
    });

    renderPage();

    await openActionsMenu("Pending Person");
    fireEvent.click(screen.getByRole("menuitem", { name: "Approve" }));

    await waitFor(() => {
      expect(approveRegistrationMock).toHaveBeenCalledWith({ variables: { userId: pendingUser.id } });
      expect(refetchMock).toHaveBeenCalled();
    });
  });

  it("calls rejectRegistration with the correct userId and refetches", async () => {
    useAdminUsersQueryMock.mockReturnValue({
      data: { registrations: [pendingUser] },
      loading: false,
      error: undefined,
      refetch: refetchMock,
    });

    renderPage();

    await openActionsMenu("Pending Person");
    fireEvent.click(screen.getByRole("menuitem", { name: "Reject" }));

    await waitFor(() => {
      expect(rejectRegistrationMock).toHaveBeenCalledWith({ variables: { userId: pendingUser.id } });
      expect(refetchMock).toHaveBeenCalled();
    });
  });

  it("calls resendApprovalEmail with the correct userId", async () => {
    useAdminUsersQueryMock.mockReturnValue({
      data: { registrations: [activeUser] },
      loading: false,
      error: undefined,
      refetch: refetchMock,
    });

    renderPage();

    await openActionsMenu("Active Person");
    fireEvent.click(screen.getByRole("menuitem", { name: "Resend approval email" }));

    await waitFor(() => {
      expect(resendApprovalEmailMock).toHaveBeenCalledWith({ variables: { userId: activeUser.id } });
    });
  });

  it("calls removeUser with the correct userId after confirming the dialog and refetches", async () => {
    useAdminUsersQueryMock.mockReturnValue({
      data: { registrations: [activeUser] },
      loading: false,
      error: undefined,
      refetch: refetchMock,
    });

    renderPage();

    await openActionsMenu("Active Person");
    fireEvent.click(screen.getByRole("menuitem", { name: "Remove user" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() => {
      expect(removeUserMock).toHaveBeenCalledWith({ variables: { userId: activeUser.id } });
      expect(refetchMock).toHaveBeenCalled();
    });
  });
});
