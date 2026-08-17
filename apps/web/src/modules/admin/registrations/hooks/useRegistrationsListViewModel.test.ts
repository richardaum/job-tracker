import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UserStatus } from "@/gql/graphql";

const useAdminRegistrationsQueryMock = vi.fn();

vi.mock("@/gql/hooks", () => ({ useAdminRegistrationsQuery: () => useAdminRegistrationsQueryMock() }));

import { useRegistrationsListViewModel } from "./useRegistrationsListViewModel";

const registrations = [
  { id: "1", name: "Alice Pending", email: "alice@example.com", status: UserStatus.Pending, createdAt: "2026-01-01" },
  { id: "2", name: "Bob Active", email: "bob@example.com", status: UserStatus.Active, createdAt: "2026-01-02" },
  { id: "3", name: "Carol Rejected", email: "carol@example.com", status: UserStatus.Rejected, createdAt: "2026-01-03" },
];

describe("useRegistrationsListViewModel", () => {
  it("returns all registrations when statusFilter is 'all' and no search query", () => {
    useAdminRegistrationsQueryMock.mockReturnValue({ data: { registrations }, loading: false, error: undefined });

    const { result } = renderHook(() => useRegistrationsListViewModel("", "all"));

    expect(result.current.filteredRegistrations).toHaveLength(3);
  });

  it("filters by status", () => {
    useAdminRegistrationsQueryMock.mockReturnValue({ data: { registrations }, loading: false, error: undefined });

    const { result } = renderHook(() => useRegistrationsListViewModel("", UserStatus.Pending));

    expect(result.current.filteredRegistrations).toEqual([registrations[0]]);
  });

  it("filters by search text across name and email", () => {
    useAdminRegistrationsQueryMock.mockReturnValue({ data: { registrations }, loading: false, error: undefined });

    const { result } = renderHook(() => useRegistrationsListViewModel("bob", "all"));

    expect(result.current.filteredRegistrations).toEqual([registrations[1]]);
  });

  it("combines status filter and search text", () => {
    useAdminRegistrationsQueryMock.mockReturnValue({ data: { registrations }, loading: false, error: undefined });

    const { result } = renderHook(() => useRegistrationsListViewModel("alice", UserStatus.Active));

    expect(result.current.filteredRegistrations).toEqual([]);
  });

  it("reports showInitialLoading when loading with no data yet", () => {
    useAdminRegistrationsQueryMock.mockReturnValue({ data: undefined, loading: true, error: undefined });

    const { result } = renderHook(() => useRegistrationsListViewModel("", "all"));

    expect(result.current.showInitialLoading).toBe(true);
  });
});
