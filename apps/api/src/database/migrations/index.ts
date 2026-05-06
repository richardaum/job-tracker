import { Baseline1746009600000 } from "./1746009600000-baseline";
import { AddApplicationSalaryColumns1747000000000 } from "./1747000000000-add-application-salary-columns";
import { RenameSalaryTagsToTags1748000000000 } from "./1748000000000-rename-salary-tags-to-tags";
import { CreateCompanies1749000000000 } from "./1749000000000-create-companies";
import { EnsureCompanyDescriptionTiptap1750000000000 } from "./1750000000000-ensure-company-description-tiptap";
import { AddStageEventReason1751000000000 } from "./1751000000000-add-stage-event-reason";
import { UseTimestamptzForStageEvents1752000000000 } from "./1752000000000-use-timestamptz-for-stage-events";
import { AddApplicationSource1753000000000 } from "./1753000000000-add-application-source";
import { CompaniesUserLowerNameUnique1754000000000 } from "./1754000000000-companies-user-lower-name-unique";
import { CreateImportRuns1755000000000 } from "./1755000000000-create-import-runs";
import { ImportRunStatusInProgress1755100000000 } from "./1755100000000-import-run-status-in-progress";
import { DropImportRunsExecutorPlanJson1755200000000 } from "./1755200000000-drop-import-runs-executor-plan-json";
import { AddApplicationUrls1756000000000 } from "./1756000000000-add-application-urls";
import { DropApplicationUrl1756000001000 } from "./1756000001000-drop-application-url";
import { CreateExchangeRateCache1757000000000 } from "./1757000000000-create-exchange-rate-cache";

export const migrations = [
  Baseline1746009600000,
  AddApplicationSalaryColumns1747000000000,
  RenameSalaryTagsToTags1748000000000,
  CreateCompanies1749000000000,
  EnsureCompanyDescriptionTiptap1750000000000,
  AddStageEventReason1751000000000,
  UseTimestamptzForStageEvents1752000000000,
  AddApplicationSource1753000000000,
  CompaniesUserLowerNameUnique1754000000000,
  CreateImportRuns1755000000000,
  ImportRunStatusInProgress1755100000000,
  DropImportRunsExecutorPlanJson1755200000000,
  AddApplicationUrls1756000000000,
  DropApplicationUrl1756000001000,
  CreateExchangeRateCache1757000000000,
];
