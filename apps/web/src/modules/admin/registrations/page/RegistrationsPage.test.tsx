import { SlotsProvider } from "@job-tracker/react-slots";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserStatus } from "@/gql/graphql";
import { AdminSubtabsSlot } from "@/modules/admin/layout/admin-header.slots";

const useAdminRegistrationsQueryMock = vi.fn();
const approveRegistrationMock = vi.fn().mockResolvedValue({});
const rejectRegistrationMock = vi.fn().mockResolvedValue({});

vi.mock("@/gql/hooks", () => ({
  useAdminRegistrationsQuery: () => useAdminRegistrationsQueryMock(),
  useApproveRegistrationMutation: () => [approveRegistrationMock, { loading: false }],
  useRejectRegistrationMutation: () => [rejectRegistrationMock, { loading: false }],
}));

import RegistrationsPage from "./RegistrationsPage";

function renderPage() {
  return render(
    <SlotsProvider>
      <AdminSubtabsSlot.Slot />
      <RegistrationsPage />
    </SlotsProvider>,
  );
}

const pendingRegistration = {
  id: "reg-1",
  name: "Pending Person",
  email: "pending@example.com",
  avatarUrl: null,
  status: UserStatus.Pending,
  createdAt: "2026-01-01T00:00:00.000Z",
};

const activeRegistration = {
  id: "reg-2",
  name: "Active Person",
  email: "active@example.com",
  avatarUrl: null,
  status: UserStatus.Active,
  createdAt: "2026-01-02T00:00:00.000Z",
};

describe("RegistrationsPage", () => {
  const refetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    refetchMock.mockResolvedValue({});
  });

  it("renders a skeleton while loading with no data yet", () => {
    useAdminRegistrationsQueryMock.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      refetch: refetchMock,
    });

    renderPage();

    expect(screen.queryByText(/no registrations found/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /approve/i })).not.toBeInTheDocument();
  });

  it("renders the status filter tabs through the AdminSubtabsSlot slot", () => {
    useAdminRegistrationsQueryMock.mockReturnValue({
      data: { registrations: [] },
      loading: false,
      error: undefined,
      refetch: refetchMock,
    });

    renderPage();

    expect(screen.getByRole("tab", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Pending" })).toBeInTheDocument();
  });

  it("renders an error state when the query fails", () => {
    useAdminRegistrationsQueryMock.mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error("boom"),
      refetch: refetchMock,
    });

    renderPage();

    expect(screen.getByText(/failed to load registrations/i)).toBeInTheDocument();
  });

  it("renders EmptyState when there are no registrations", () => {
    useAdminRegistrationsQueryMock.mockReturnValue({
      data: { registrations: [] },
      loading: false,
      error: undefined,
      refetch: refetchMock,
    });

    renderPage();

    expect(screen.getByText(/no registrations found/i)).toBeInTheDocument();
  });

  it("renders registration cards with Approve/Reject only for pending entries", () => {
    useAdminRegistrationsQueryMock.mockReturnValue({
      data: { registrations: [pendingRegistration, activeRegistration] },
      loading: false,
      error: undefined,
      refetch: refetchMock,
    });

    renderPage();

    expect(screen.getByText("Pending Person")).toBeInTheDocument();
    expect(screen.getByText("Active Person")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /approve pending person/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reject pending person/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /approve active person/i })).not.toBeInTheDocument();
  });

  it("calls approveRegistration with the correct userId and refetches", async () => {
    useAdminRegistrationsQueryMock.mockReturnValue({
      data: { registrations: [pendingRegistration] },
      loading: false,
      error: undefined,
      refetch: refetchMock,
    });

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /approve pending person/i }));

    await waitFor(() => {
      expect(approveRegistrationMock).toHaveBeenCalledWith({ variables: { userId: pendingRegistration.id } });
      expect(refetchMock).toHaveBeenCalled();
    });
  });

  it("calls rejectRegistration with the correct userId and refetches", async () => {
    useAdminRegistrationsQueryMock.mockReturnValue({
      data: { registrations: [pendingRegistration] },
      loading: false,
      error: undefined,
      refetch: refetchMock,
    });

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /reject pending person/i }));

    await waitFor(() => {
      expect(rejectRegistrationMock).toHaveBeenCalledWith({ variables: { userId: pendingRegistration.id } });
      expect(refetchMock).toHaveBeenCalled();
    });
  });
});
