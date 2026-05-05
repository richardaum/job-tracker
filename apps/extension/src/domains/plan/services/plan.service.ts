import { LogService } from "@/domains/log/log.service";
import type { Plan, PlanStep } from "@/domains/plan/model/types";

import { CollectJobsService } from "./collect-jobs.service";

export class PlanService {
  private readonly memory: Map<string, unknown> = new Map();

  constructor(
    private readonly collectJobsService: CollectJobsService,
    private readonly logService: LogService,
  ) {
    this.logService.debug("PlanService initialized");
  }

  async execute(plan: Plan) {
    this.logService.debug("Executing plan", { plan });
    const output = await this.runPlanSteps(plan.steps);
    this.logService.debug("Plan executed", { output });
    return output;
  }

  private async runPlanSteps(steps: Plan["steps"]) {
    for (const step of steps) {
      const stepResult = await this.runPlanStep(step);
      this.memory.set(step.id, stepResult);
    }
    return this.filterPublicOutput(steps);
  }

  private async runPlanStep(step: PlanStep) {
    switch (step.action.kind) {
      case "collect.jobs":
        return await this.collectJobsService.execute(step.action);
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
