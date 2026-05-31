import { LogService } from "@/domains/log/log.service";
import type { Plan, PlanStep } from "@/domains/plan/model/types";
import type { PlanExecuteOptions } from "@/domains/plan/plan-execute-options";

import { CollectJobsService } from "./collect-jobs.service";
import { ParseRegexService } from "./parse-regex.service";

export class PlanService {
  private readonly memory: Map<string, unknown> = new Map();

  constructor(
    private readonly collectJobsService: CollectJobsService,
    private readonly parseRegexService: ParseRegexService,
    private readonly logService: LogService,
  ) {
    this.logService.debug("PlanService initialized");
  }

  async execute(plan: Plan, options: PlanExecuteOptions) {
    this.logService.debug("Executing plan", { plan });
    const output = await this.runPlanSteps(plan.steps, options);
    this.logService.debug("Plan executed", { output });
    return output;
  }

  private async runPlanSteps(steps: Plan["steps"], options: PlanExecuteOptions) {
    for (const step of steps) {
      const stepResult = await this.runPlanStep(step, options);
      this.memory.set(step.id, stepResult);
    }
    return this.filterPublicOutput(steps);
  }

  private async runPlanStep(step: PlanStep, options: PlanExecuteOptions) {
    switch (step.action.kind) {
      case "collect.jobs":
        return await this.collectJobsService.execute(step.action, options);
      case "parse.regex":
        return this.parseRegexService.execute(step.action);
    }
  }

  private filterPublicOutput(steps: Plan["steps"]) {
    const output: Record<string, unknown> = {};
    steps.forEach((step) => {
      if (step.action.scope !== "public") return;
      output[step.id] = this.memory.get(step.id);
    });
    return output;
  }
}
