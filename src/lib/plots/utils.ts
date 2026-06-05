/**
 * Converts a field key or a function into a data accessor function.
 * Svelteplot marks expect `(d: T) => value` — this bridges the
 * shorthand key notation used in series definitions.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolveAccessor<T extends Record<string, unknown>>(
  field: keyof T | ((d: T) => any),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): (d: T) => any {
  return typeof field === 'function' ? field : (d) => d[field];
}
