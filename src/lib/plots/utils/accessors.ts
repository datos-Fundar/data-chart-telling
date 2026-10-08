/**
 * Converts a field key or a function into a data accessor function.
 * Svelteplot marks expect `(d: T) => value` - this bridges the
 * shorthand key notation used in series definitions.
 */
export function resolveAccessor<T extends Record<string, unknown>>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: keyof T | ((d: T) => any),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): (d: T) => any {
  return typeof field === 'function' ? field : (d) => d[field];
}
