import type { MarkerTransform } from '$lib/types/transforms';
import { binXAdapter, binYAdapter } from './bin';
import { stackXAdapter, stackYAdapter } from './stack';
import type { Row, TransformAdapter } from './types';

/** Each transform type's adapter: its channels, how it runs, and its own fixes. */
const ADAPTERS: Record<MarkerTransform['type'], TransformAdapter> = {
	stackX: stackXAdapter,
	stackY: stackYAdapter,
	binX: binXAdapter,
	binY: binYAdapter
};

/**
 * Runs one transform through svelteplot and returns what it produces — the
 * transform's own output, ready to spread into the marker's props. A marker
 * transform is one flat object, so its props are split once: the ones the
 * transform reads as channels go first, and the rest (a stack's `offset`, a
 * bin's `thresholds` and reducers) go second, as svelteplot's own signature takes them.
 */
export function runTransform(transform: MarkerTransform): Row {
	const adapter = ADAPTERS[transform.type];
	const prepared = adapter.prepare ? adapter.prepare(transform) : transform;
	const props = Object.entries(prepared).filter(([k]) => k !== 'type');
	const channelKeys = adapter.channelKeys;
	const channels = Object.fromEntries(props.filter(([k]) => channelKeys[k]));
	const options = Object.fromEntries(props.filter(([k]) => !channelKeys[k]));
	return adapter.run(channels, options);
}

/**
 * Applies a marker's `transforms` in order, each one's output feeding the next.
 * A transform reads the marker's own rows, `x`/`y` and `grouping` (its `z`) by
 * default, falling back to the plot's rows when the marker has none. Any of
 * those the transform sets itself wins. The output is merged onto the marker.
 *
 * A transform only inherits the channels it reads (its adapter's `channelKeys`),
 * so a bin's reducer slot is never filled from the marker: a marker's `y` is not
 * read as `binX`'s `'count'` reducer. Once every transform has run, each type's
 * `finish` fix is applied to the marker, once per type used.
 */
export function resolveTransforms<T extends object>(marker: T, fallbackData: Row[]): T {
	const own = marker as T & {
		data?: Row[];
		x?: unknown;
		y?: unknown;
		grouping?: unknown;
		transforms?: MarkerTransform[];
	};
	if (!own.transforms?.length) return marker;
	let resolved: Row = { ...own };
	for (const transform of own.transforms) {
		// The marker's own rows and channels are the defaults, but only the ones
		// this transform reads as channels. The transform's own props win over them.
		const readable = ADAPTERS[transform.type].channelKeys;
		const inherited = Object.fromEntries(
			Object.entries({ x: resolved.x, y: resolved.y, z: resolved.grouping }).filter(
				([k]) => readable[k] === true
			)
		);
		const withDefaults = {
			data: (resolved.data as Row[] | undefined) ?? fallbackData,
			...inherited,
			...transform
		} as MarkerTransform;
		resolved = { ...resolved, ...runTransform(withDefaults) };
	}
	const used = new Set(own.transforms.map((t) => ADAPTERS[t.type]));
	for (const adapter of used) {
		if (adapter.finish) resolved = adapter.finish(resolved);
	}
	return resolved as T;
}
