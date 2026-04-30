import { Baseline1746009600000 } from "./1746009600000-baseline";
import { AddApplicationSalaryColumns1747000000000 } from "./1747000000000-add-application-salary-columns";
import { RenameSalaryTagsToTags1748000000000 } from "./1748000000000-rename-salary-tags-to-tags";
import { CreateCompanies1749000000000 } from "./1749000000000-create-companies";
import { EnsureCompanyDescriptionTiptap1750000000000 } from "./1750000000000-ensure-company-description-tiptap";
import { AddStageEventReason1751000000000 } from "./1751000000000-add-stage-event-reason";
import { UseTimestamptzForStageEvents1752000000000 } from "./1752000000000-use-timestamptz-for-stage-events";

export const migrations = [
  Baseline1746009600000,
  AddApplicationSalaryColumns1747000000000,
  RenameSalaryTagsToTags1748000000000,
  CreateCompanies1749000000000,
  EnsureCompanyDescriptionTiptap1750000000000,
  AddStageEventReason1751000000000,
  UseTimestamptzForStageEvents1752000000000,
];
