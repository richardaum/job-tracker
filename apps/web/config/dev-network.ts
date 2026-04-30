import { networkInterfaces } from "node:os";
import type { NetworkInterfaceInfo } from "node:os";

export function getAllowedDevOrigins(): string[] {
  const netInterfaces = networkInterfaces();
  const localIpv4Addresses = Object.values(netInterfaces)
    .flatMap((entries) => entries ?? [])
    .filter((entry): entry is NetworkInterfaceInfo => Boolean(entry))
    .filter((entry) => entry.family === "IPv4" && entry.internal === false)
    .map((entry) => entry.address);

  return Array.from(
    new Set([
      "localhost",
      "127.0.0.1",
      "*.ngrok-free.app",
      "*.ngrok.io",
      ...localIpv4Addresses,
    ]),
  );
}
