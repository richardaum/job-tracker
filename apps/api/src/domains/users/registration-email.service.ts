import { apiEnv } from "@api/env/server";
import { PostHogService } from "@api/domains/feature-flags/posthog.service";
import { Injectable, Logger } from "@nestjs/common";
import { tryRun } from "@job-tracker/try-run";
import { Resend } from "resend";

import { pendingRegistrationAdminEmail, registrationApprovedUserEmail } from "./registration-email.templates";
import { UserRepository } from "./users.repository";
import type { User } from "./users.schema";

const PENDING_REGISTRATION_ADMIN_EMAIL_FLAG = "pending-registration-admin-email-enabled";
const REGISTRATION_APPROVED_USER_EMAIL_FLAG = "registration-approved-user-email-enabled";
const EMAIL_FROM = "NewJobTracker <notifications@newjobtracker.app>";

@Injectable()
export class RegistrationEmailService {
  private readonly logger = new Logger(RegistrationEmailService.name);
  private readonly resend = apiEnv.RESEND_API_KEY ? new Resend(apiEnv.RESEND_API_KEY) : undefined;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly postHogService: PostHogService,
  ) {}

  async notifyAdminsOfPendingRegistration(user: User): Promise<void> {
    await this.runSafely("pending_registration_admins", async () => {
      const enabled = await this.postHogService.isFeatureEnabled(PENDING_REGISTRATION_ADMIN_EMAIL_FLAG, user.id);
      if (!enabled) return;

      const admins = await this.userRepository.findActiveAdmins();
      const template = pendingRegistrationAdminEmail(user, new URL("/admin/users", apiEnv.WEB_URL).toString());
      await Promise.all(admins.map((admin) => this.send(admin.email, template)));
    });
  }

  async notifyUserOfApprovedRegistration(user: User): Promise<void> {
    await this.runSafely("registration_approved_user", async () => {
      const enabled = await this.postHogService.isFeatureEnabled(REGISTRATION_APPROVED_USER_EMAIL_FLAG, user.id);
      if (!enabled) return;

      await this.send(user.email, registrationApprovedUserEmail(user, apiEnv.WEB_URL));
    });
  }

  /** Admin-triggered resend, bypasses the rollout flag since it's an explicit manual action. */
  async resendApprovedRegistrationEmail(user: User): Promise<void> {
    await this.runSafely("registration_approved_user_resend", async () => {
      await this.send(user.email, registrationApprovedUserEmail(user, apiEnv.WEB_URL));
    });
  }

  private async runSafely(notification: string, send: () => Promise<void>): Promise<void> {
    const [error] = await tryRun(send());
    if (error) {
      this.logger.error(`registration email notification failed notification=${notification}: ${String(error)}`);
    }
  }

  private async send(to: string, template: { subject: string; html: string; text: string }): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`transactional email skipped recipient=${to} reason=resend_api_key_missing`);
      return;
    }

    const [exception, response] = await tryRun(
      this.resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      }),
    );
    if (exception) {
      this.logger.error(`transactional email failed recipient=${to}: ${String(exception)}`);
      return;
    }
    if (response.error) {
      this.logger.error(`transactional email failed recipient=${to}: ${response.error.message}`);
    }
  }
}
