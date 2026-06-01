export class EmptyPassesTracker {
  private passes = 0;

  constructor(private readonly maxPasses: number) {}

  get isExhausted(): boolean {
    return this.passes >= this.maxPasses;
  }

  reset(): void {
    this.passes = 0;
  }

  increment(): void {
    this.passes++;
  }
}
