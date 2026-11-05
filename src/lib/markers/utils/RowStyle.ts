/**
 * A marker's style as svelteplot reads it. A style that depends on the row is handed over as the
 * value of a channel with no scale: svelteplot would otherwise map what it gives through its own
 * color or opacity scale, and a row's opacity of 0.55 would no longer be 0.55.
 */
export class RowStyle {
	/** The accessor that reads `key` off a row. */
	static #read = (key: string) => (row: Record<string, unknown>) => row?.[key];

	/**
	 * A color, as a prop of a mark: a function of the row is a channel with no scale; a string is the
	 * field of the rows it names (when they have one of that name), else the color itself.
	 */
	static of<T>(
		style: T | ((row: never) => T) | undefined,
		rows?: readonly unknown[]
	): T | undefined {
		if (typeof style === 'function') return { value: style, scale: null } as unknown as T;
		if (typeof style === 'string' && RowStyle.#isField(style, rows))
			return { value: RowStyle.#read(style), scale: null } as unknown as T;
		return style as T | undefined;
	}

	/** An opacity: a number as it is, a string the field of the rows it names, a function of the row; the last two with no scale. */
	static opacity(style: number | string | ((row: never) => number) | undefined) {
		if (typeof style === 'function') return { value: style, scale: null } as never;
		if (typeof style === 'string') return { value: RowStyle.#read(style), scale: null } as never;
		return style;
	}

	/** Any other number (a width, a radius, an inset): a string is the field of the rows it names, a function is called with the row. */
	static field<T>(style: T | string | ((row: never) => T) | undefined): T | undefined {
		return (typeof style === 'string' ? RowStyle.#read(style) : style) as T | undefined;
	}

	/** Whether a string names a field of the rows - at least one has it - rather than being a color. */
	static #isField(name: string, rows?: readonly unknown[]): boolean {
		return !!rows?.some((row) => typeof row === 'object' && row !== null && name in row);
	}

	/** \`styles\` without its functions - for a shape that stands for no row (a hover band), where there is nothing to call them with. */
	static flat<TStyle extends object>(
		styles: TStyle | undefined
	): { [K in keyof TStyle]?: Exclude<TStyle[K], (...args: never[]) => unknown> } {
		return Object.fromEntries(
			Object.entries(styles ?? {}).filter(([, value]) => typeof value !== 'function')
		) as never;
	}
}
