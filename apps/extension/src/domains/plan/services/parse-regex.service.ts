import { tryRun } from "@job-tracker/try-run";

import { LogService } from "@/domains/log/log.service";
import type { ParseRegexAction } from "@/domains/plan/model/types";

const logService = new LogService({ prefix: "ParseRegexService", level: "debug" });

export class ParseRegexService {
  execute(action: ParseRegexAction): Record<string, string | null> {
    const { input } = action;
    const result: Record<string, string | null> = {};

    for (const field of input.fields) {
      const [err, match] = tryRun(() => {
        const regex = new RegExp(field.pattern, field.flags ?? "");
        return regex.exec(input.text);
      });

      if (err) {
        if (field.required) throw err;
        logService.warn(`Field "${field.key}" failed to parse`, { pattern: field.pattern, error: err });
        result[field.key] = null;
        continue;
      }

      const group = field.group ?? 1;
      if (match != null && match[group] !== undefined) {
        result[field.key] = match[group];
      } else {
        if (field.required) {
          throw new Error(`Required field "${field.key}" did not match pattern /${field.pattern}/${field.flags ?? ""}`);
        }
        result[field.key] = null;
      }
    }

    return result;
  }
}
