import type { TextColor } from "@job-tracker/ui";

import type { ExtensionConnectionState } from "@/modules/admin/extension/hooks/useExtensionConnectionStatus";

export function authDisplayLabel(connection: ExtensionConnectionState): string {
  if (connection.status === "checking") return "Checking…";
  if (connection.status === "disconnected") return "Unavailable";

  if (
    connection.authStatus === "authenticated" &&
    connection.authenticatedEmail
  ) {
    return connection.authenticatedEmail;
  }

  if (connection.authStatus === "authenticated") return "Signed in";

  return "Not signed in";
}

export function authTextColor(
  connection: ExtensionConnectionState,
): TextColor | undefined {
  if (connection.status === "disconnected") return "muted";
  if (connection.status === "checking") return "secondary";
  if (connection.authStatus === "authenticated") return undefined;
  return "warning";
}
