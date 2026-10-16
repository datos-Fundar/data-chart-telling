function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * `patch` deep-merged over `base`: plain objects merge key by key, anything
 * else (arrays included) in `patch` replaces, and an `undefined` in `patch`
 * leaves `base` as it is. Either side may be absent - the other is returned.
 */
export function merge<T extends object>(base: T, patch: object | undefined): T;
export function merge<T extends object>(base: T | undefined, patch: T | undefined): T | undefined;
export function merge(base: object | undefined, patch: object | undefined): object | undefined {
	if (!base) return patch;
	if (!patch) return base;
	const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
	for (const [key, value] of Object.entries(patch)) {
		if (value === undefined) continue;
		const prev = out[key];
		out[key] = isPlainObject(prev) && isPlainObject(value) ? merge(prev, value) : value;
	}
	return out;
}
