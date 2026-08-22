import { describe, expect, it } from "vitest";

import { RoleEnum } from "./role.enum";
import { registrationApprovedUserEmail, pendingRegistrationAdminEmail } from "./registration-email.templates";
import { UserStatusEnum } from "./user-status.enum";
import type { User } from "./users.schema";

const user: User = {
  id: "user-1",
  name: "Ana <Martins>",
  email: "ana@example.com",
  avatarUrl: null,
  role: RoleEnum.User,
  status: UserStatusEnum.Pending,
  tokenVersion: 0,
  refreshJti: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  accounts: [],
};

describe("registration email templates", () => {
  it("renders the pending registration email in English with the admin destination", () => {
    const template = pendingRegistrationAdminEmail(user, "https://newjobtracker.app/admin/registrations");

    expect(template.subject).toBe("New registration pending review — Ana <Martins>");
    expect(template.text).toContain("Review registration: https://newjobtracker.app/admin/registrations");
    expect(template.html).toContain("Approval queue");
    expect(template.html).toContain("Ana &lt;Martins&gt;");
  });

  it("renders the approved user email in English with the application destination", () => {
    const template = registrationApprovedUserEmail(user, "https://newjobtracker.app");

    expect(template.subject).toBe("Your account is approved — NewJobTracker");
    expect(template.text).toContain("Open NewJobTracker: https://newjobtracker.app");
    expect(template.html).toContain("You’re ready to get started.");
    expect(template.html).toContain("Open NewJobTracker");
  });
});
