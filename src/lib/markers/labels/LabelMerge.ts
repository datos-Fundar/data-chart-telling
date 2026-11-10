import type { TextMarkerConfig } from '$lib/types/markers/basic/text';

/** The label a merged row was written by. */
export const LABEL_SOURCE = Symbol('labelSource');

type Row = Record<string | symbol, unknown>;
type Config = Record<string, unknown>;

type Read = 'field' | 'literal' | 'either';

/** What may differ from one merged label to another, each row reading its own: a field key is a field, a text either. */
const ROW_KEYS: Record<string, Read> = {
	x: 'field',
	y: 'field',
	dx: 'field',
	dy: 'field',
	text: 'either',
	textAnchor: 'literal',
	lineAnchor: 'literal'
};
const ROW_STYLE_KEYS = ['fill', 'fillOpacity', 'stroke', 'strokeWidth', 'fontWeight', 'fontStyle'];

/** Functions of the row each row calls its own label's: handlers, and where its point sits. */
const ROW_FUNCTIONS = ['origin', 'covers'];
const dispatched = (key: string) =>
	ROW_FUNCTIONS.includes(key) || (key.startsWith('on') && key !== 'onoverflow');

const read = (value: unknown, row: Row, as: Read): unknown => {
	if (typeof value === 'function') return (value as (row: Row) => unknown)(row);
	const key = typeof value === 'string' || typeof value === 'symbol';
	if (!key || as === 'literal') return value;
	return as === 'field' || (row && value in row) ? row?.[value] : value;
};

/**
 * Labels drawn as one `text` marker: those whose other options are alike merge, each row tagged with the label
 * it comes from, so labels from several markers declutter together and draw as one.
 */
export class LabelMerge {
	static merge(markers: TextMarkerConfig[]): TextMarkerConfig[] {
		const groups = new Map<string, TextMarkerConfig[]>();
		const ids = new Map<unknown, number>();
		for (const marker of markers) {
			const key = LabelMerge.#signature(marker as unknown as Config, ids);
			groups.set(key, [...(groups.get(key) ?? []), marker]);
		}
		return [...groups.values()].map((group) =>
			group.length === 1 ? group[0] : LabelMerge.#merged(group as unknown as Config[])
		);
	}

	static #merged(sources: Config[]): TextMarkerConfig {
		const data = sources.flatMap((source, i) =>
			((source.data as Row[]) ?? []).map((row) => ({ ...row, [LABEL_SOURCE]: i }))
		);
		const sourceOf = (row: Row) => sources[row[LABEL_SOURCE] as number];
		const pick = (values: unknown[], at: (source: Config) => unknown, as: Read) =>
			values.every((value) => value === values[0])
				? values[0]
				: (row: Row) => read(at(sourceOf(row)), row, as);

		const merged: Config = { ...sources[0], data };
		for (const [key, as] of Object.entries(ROW_KEYS)) {
			merged[key] = pick(
				sources.map((source) => source[key]),
				(source) => source[key],
				as
			);
		}
		const stylesOf = (source: Config) => (source.styles ?? {}) as Config;
		const styles: Config = { ...stylesOf(sources[0]) };
		for (const key of ROW_STYLE_KEYS) {
			styles[key] = pick(
				sources.map((source) => stylesOf(source)[key]),
				(source) => stylesOf(source)[key],
				'either'
			);
		}
		merged.styles = styles;
		for (const key of new Set(sources.flatMap((source) => Object.keys(source)))) {
			if (!dispatched(key)) continue;
			const own = sources.map((source) => source[key]);
			if (own.every((fn) => fn === own[0])) continue;
			const call = (row: Row, args: unknown[]) =>
				(sourceOf(row)[key] as ((...args: unknown[]) => unknown) | undefined)?.(...args);
			merged[key] = ROW_FUNCTIONS.includes(key)
				? (row: Row, scales: unknown) => call(row, [row, scales])
				: (event: Event, row: Row, index: number) => call(row, [event, row, index]);
		}
		return merged as unknown as TextMarkerConfig;
	}

	/** What labels share to merge: every option but their rows and what each row reads on its own. */
	static #signature(marker: Config, ids: Map<unknown, number>): string {
		const shared: Config = {};
		for (const [key, value] of Object.entries(marker)) {
			if (key === 'data' || key in ROW_KEYS || dispatched(key)) continue;
			shared[key] = value;
		}
		const styles = (marker.styles ?? {}) as Config;
		shared.styles = Object.fromEntries(
			Object.entries(styles).filter(([key]) => !ROW_STYLE_KEYS.includes(key))
		);
		// A function or a symbol is told apart by its identity.
		return JSON.stringify(shared, (_, value) => {
			if (typeof value !== 'function' && typeof value !== 'symbol') return value;
			if (!ids.has(value)) ids.set(value, ids.size);
			return `#${ids.get(value)}`;
		});
	}
}
