"use client";

import { Button, cn, Stack } from "@job-tracker/ui";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react";

import { ExtensionStatusPanel } from "@/modules/admin/extension/components/ExtensionAdminPanels";
import { ExtensionSubTabs } from "@/modules/admin/extension/components/ExtensionSubTabs";
import { useExtensionConnectionStatus } from "@/modules/admin/extension/hooks/useExtensionConnectionStatus";
import { useExtensionEventsViewModel } from "@/modules/admin/extension/hooks/useExtensionEventsViewModel";
import { AdminHeaderActions } from "@/modules/admin/layout/admin-header.slots";

export default function ExtensionStatusPage() {
  const connection = useExtensionConnectionStatus();
  // TODO: consume events data from shared ExtensionEventsContext instead of
  // calling useExtensionEventsViewModel() here (see TODO in that hook).
  const eventsViewModel = useExtensionEventsViewModel();

  function refreshExtensionAdmin() {
    connection.retry();
    void eventsViewModel.refetch();
  }

  return (
    <Stack gap="lg" align="stretch" className={cn("w-full min-w-0")}>
      <ExtensionSubTabs />

      <AdminHeaderActions>
        <Button
          type="button"
          intent="secondary"
          size="md"
          state={connection.status === "checking" ? "loading" : "default"}
          leftIcon={<ArrowsClockwiseIcon size={16} weight="bold" />}
          onClick={refreshExtensionAdmin}
        >
          Refresh
        </Button>
      </AdminHeaderActions>

      <ExtensionStatusPanel
        connection={connection}
        inFlightCount={eventsViewModel.inFlightCount}
        eventsLoading={eventsViewModel.showInitialLoading}
      />
    </Stack>
  );
}
