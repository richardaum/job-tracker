import { SquashedBaseline1780280000000 } from "./1780280000000-baseline";
import { AddStageEventsFkCascade1785025427000 } from "./1785025427000-add-stage-events-fk-cascade";
import { AddAiSettingsColumns1785420033000 } from "./1785420033000-add-ai-settings-columns";
import { AddTrialCallsLimitToUserSettings1785459600000 } from "./1785459600000-add-trial-calls-limit-to-user-settings";
import { CreateUserTourProgress1786543235000 } from "./1786543235000-create-user-tour-progress";
import { UserStatusEnum1786600000000 } from "./1786600000000-user-status-enum";
import { CreateAiUsageRecords1787233300000 } from "./1787233300000-create-ai-usage-records";
import { AddQuickTipStateToUserSettings1787340944000 } from "./1787340944000-add-quick-tip-state-to-user-settings";
import { MigrateCustomAuthToBetterAuth1787423685000 } from "./1787423685000-migrate-custom-auth-to-better-auth";

export const migrations = [
  SquashedBaseline1780280000000,
  AddStageEventsFkCascade1785025427000,
  AddAiSettingsColumns1785420033000,
  AddTrialCallsLimitToUserSettings1785459600000,
  CreateUserTourProgress1786543235000,
  UserStatusEnum1786600000000,
  CreateAiUsageRecords1787233300000,
  AddQuickTipStateToUserSettings1787340944000,
  MigrateCustomAuthToBetterAuth1787423685000,
];
