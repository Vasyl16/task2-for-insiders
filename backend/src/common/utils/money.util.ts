/** Rounds a floating-point currency amount to 2 decimal places, avoiding binary float artifacts (e.g. 599.9499999999999). */
export function roundToCents(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
