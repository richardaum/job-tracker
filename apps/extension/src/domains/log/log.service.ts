const levels = ["off", "debug", "info", "warn", "error"] as const;

type LogServiceParams = { prefix?: string; level: (typeof levels)[number] };

export class LogService {
  constructor(private readonly params?: LogServiceParams) {}

  private isEnabled(level: (typeof levels)[number]) {
    const levelIndex = levels.indexOf(level);
    const paramsLevelIndex = levels.indexOf(this.params?.level ?? "off");
    return levelIndex >= paramsLevelIndex;
  }

  private getPrefix() {
    return this.params?.prefix ?? "";
  }

  debug(message: string, ...data: unknown[]) {
    if (this.isEnabled("debug")) {
      const args = [this.getPrefix(), message, ...data].filter(Boolean);
      console.log(...args);
    }
  }
}
