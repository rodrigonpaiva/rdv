/** Inject into time-dependent tests; never changes the host or database clock. */
export class ManualClock {
  #milliseconds: number;

  constructor(instant: Date | string) {
    this.#milliseconds = new Date(instant).getTime();
    if (!Number.isFinite(this.#milliseconds)) throw new Error('Invalid clock instant');
  }

  now(): Date {
    return new Date(this.#milliseconds);
  }

  advance(milliseconds: number): void {
    const next = this.#milliseconds + milliseconds;
    if (!Number.isSafeInteger(milliseconds) || milliseconds < 0 || !Number.isFinite(new Date(next).getTime())) {
      throw new Error('Clock advance must be a nonnegative integer within the Date range');
    }
    this.#milliseconds = next;
  }
}
