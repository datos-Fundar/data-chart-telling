/** Whether two configuration values hold the same, for a plot to tell a new configuration from one built again. */
export class ConfigEquality {
	/** How many levels of objects and arrays it looks into; a value nested deeper only matches as the same object. */
	static readonly MAX_DEPTH = 6;

	/**
	 * Whether `a` and `b` are the same value, or plain objects and arrays alike all the way down, dates of one
	 * time; anything else - a function, a class instance - only if it is the same object.
	 */
	static same(a: unknown, b: unknown, depth = 0): boolean {
		if (Object.is(a, b)) return true;
		if (depth >= ConfigEquality.MAX_DEPTH) return false;
		if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
		if (a instanceof Date || b instanceof Date) {
			return a instanceof Date && b instanceof Date && +a === +b;
		}
		if (Array.isArray(a) || Array.isArray(b)) {
			return (
				Array.isArray(a) &&
				Array.isArray(b) &&
				a.length === b.length &&
				a.every((value, i) => ConfigEquality.same(value, b[i], depth + 1))
			);
		}
		if (!ConfigEquality.#isPlain(a) || !ConfigEquality.#isPlain(b)) return false;
		const keys = Reflect.ownKeys(a);
		if (keys.length !== Reflect.ownKeys(b).length) return false;
		return keys.every(
			(key) =>
				Object.prototype.hasOwnProperty.call(b, key) &&
				ConfigEquality.same(
					(a as Record<PropertyKey, unknown>)[key],
					(b as Record<PropertyKey, unknown>)[key],
					depth + 1
				)
		);
	}

	static #isPlain(value: object): boolean {
		const proto = Object.getPrototypeOf(value);
		return proto === Object.prototype || proto === null;
	}
}
