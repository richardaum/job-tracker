import type { TextColor } from "@job-tracker/ui";

import type {
  ExtensionConnectionState,
  ExtensionConnectionStatus,
} from "@/modules/admin/extension/hooks/useExtensionConnectionStatus";
export function connectionTextColor(status: ExtensionConnectionStatus): TextColor | undefined {
  switch (status) {
    case "connected":
      return "success";
    case "checking":
      return "muted";
    case "disconnected":
      return "error";
  }
}

export function connectionLabel(status: ExtensionConnectionStatus): string {
  switch (status) {
    case "connected":
      return "Connected";
    case "checking":
      return "Checking…";
    case "disconnected":
      return "Disconnected";
  }
}

export function connectionSubtext(connection: Pick<ExtensionConnectionState, "status">): string | null {
  switch (connection.status) {
    case "connected":
      return null;
    case "checking":
      return "Contacting extension…";
    case "disconnected":
      return "Extension not detected";
  }
}

export function connectionDetailValue(status: ExtensionConnectionStatus, value: string | null): string {
  if (status === "connected" && value) return value;
  return "—";
}
