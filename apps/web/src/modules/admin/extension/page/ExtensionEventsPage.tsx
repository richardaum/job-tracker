"use client";

import { Button, cn, Stack } from "@job-tracker/ui";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react";

import { ExtensionEventsPanel } from "@/modules/admin/extension/components/ExtensionAdminPanels";
import { useExtensionConnectionStatus } from "@/modules/admin/extension/hooks/useExtensionConnectionStatus";
import { useExtensionEventsViewModel } from "@/modules/admin/extension/hooks/useExtensionEventsViewModel";
import { AdminHeaderActions } from "@/modules/admin/layout/admin-header.slots";

export default function ExtensionEventsPage() {
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

      <ExtensionEventsPanel
        events={eventsViewModel.events}
        loading={eventsViewModel.showInitialLoading}
        error={eventsViewModel.error}
      />
    </Stack>
  );
}
