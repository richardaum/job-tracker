/**
 * Assigns `value` to `target[key]` only if `value` is not `undefined`.
 * Used for partial-update DTOs so an explicit, greppable field list replaces
 * `Object.assign(entity, dto)` mass assignment.
 */
export function assignIfDefined<T, K extends keyof T>(target: T, key: K, value: T[K] | undefined): void {
  if (value !== undefined) target[key] = value;
}
