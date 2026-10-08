import type { MarkerTransform } from '$lib/types/transforms';
import { binXAdapter, binYAdapter, bin2DAdapter } from './bin';
import { stackXAdapter, stackYAdapter, stackMosaicXAdapter, stackMosaicYAdapter } from './stack';
import { densityXAdapter, densityYAdapter } from './density';
import { windowXAdapter, windowYAdapter, bollingerXAdapter, bollingerYAdapter } from './window';
import {
	normalizeXAdapter,
	normalizeYAdapter,
	normalizeParallelXAdapter,
	normalizeParallelYAdapter,
	mapXAdapter,
	mapYAdapter
} from './normalize';
import {
	intervalXAdapter,
	intervalYAdapter,
	jitterXAdapter,
	jitterYAdapter,
	shiftXAdapter,
	shiftYAdapter
} from './position';
import {
	sortAdapter,
	shuffleAdapter,
	reverseAdapter,
	filterAdapter,
	selectAdapter,
	selectFirstAdapter,
	selectLastAdapter,
	selectMinXAdapter,
	selectMaxXAdapter,
	selectMinYAdapter,
	selectMaxYAdapter
} from './order';
import { groupXAdapter, groupYAdapter, groupZAdapter, group2DAdapter } from './group';
import type { Row, TransformAdapter } from './types';

/** Each transform type's adapter: its channels, how it runs, and its own fixes. */
const ADAPTERS: Record<MarkerTransform['type'], TransformAdapter> = {
	stackX: stackXAdapter,
	stackY: stackYAdapter,
	stackMosaicX: stackMosaicXAdapter,
	stackMosaicY: stackMosaicYAdapter,
	binX: binXAdapter,
	binY: binYAdapter,
	bin: bin2DAdapter,
	densityX: densityXAdapter,
	densityY: densityYAdapter,
	windowX: windowXAdapter,
	windowY: windowYAdapter,
	bollingerX: bollingerXAdapter,
	bollingerY: bollingerYAdapter,
	normalizeX: normalizeXAdapter,
	normalizeY: normalizeYAdapter,
	normalizeParallelX: normalizeParallelXAdapter,
	normalizeParallelY: normalizeParallelYAdapter,
	mapX: mapXAdapter,
	mapY: mapYAdapter,
	intervalX: intervalXAdapter,
	intervalY: intervalYAdapter,
	jitterX: jitterXAdapter,
	jitterY: jitterYAdapter,
	shiftX: shiftXAdapter,
	shiftY: shiftYAdapter,
	sort: sortAdapter,
	shuffle: shuffleAdapter,
	reverse: reverseAdapter,
	filter: filterAdapter,
	select: selectAdapter,
	selectFirst: selectFirstAdapter,
	selectLast: selectLastAdapter,
	selectMinX: selectMinXAdapter,
	selectMaxX: selectMaxXAdapter,
	selectMinY: selectMinYAdapter,
	selectMaxY: selectMaxYAdapter,
	groupX: groupXAdapter,
	groupY: groupYAdapter,
	groupZ: groupZAdapter,
	group: group2DAdapter
};

/** The channels a marker hands down to its transforms, when it has them. */
const INHERITED_CHANNELS = ['x', 'y', 'x1', 'x2', 'y1', 'y2'] as const;

/**
 * Runs one transform through svelteplot and returns what it produces - the
 * transform's own output, ready to spread into the marker's props. A marker
 * transform is one flat object, so its props are split once: the ones the
 * transform reads as channels go first, and the rest (a stack's `offset`, a
 * bin's `thresholds` and reducers) go second, as svelteplot's own signature
 * takes them. An unset prop is left out, so svelteplot's own default applies.
 *
 * `inherited` holds the channels the marker hands down (its rows, `x`/`y`,
 * grouping as `z`). Only the ones the transform reads are used, and the
 * transform's own channels win over them.
 */
export function runTransform(transform: MarkerTransform, inherited: Row = {}): Row {
	const adapter = ADAPTERS[transform.type];
	const { channelKeys, outputKeys } = adapter;
	const isOption = (key: string) => outputKeys?.[key] === true || channelKeys[key] !== true;
	const props = Object.entries(transform).filter(([k, v]) => k !== 'type' && v !== undefined);
	const readable = Object.entries(inherited).filter(
		([k, v]) => channelKeys[k] === true && v !== undefined
	);
	const split = {
		channels: Object.fromEntries([...readable, ...props.filter(([k]) => !isOption(k))]),
		options: Object.fromEntries(props.filter(([k]) => isOption(k)))
	};
	const { channels, options } = adapter.prepare ? adapter.prepare(split) : split;
	return adapter.run(channels, options);
}

/**
 * Applies a marker's `transforms` in order, each one's output feeding the next.
 * A transform reads the marker's own rows, position channels and `grouping`
 * (its `z`) by default, falling back to the plot's rows when the marker has
 * none. Any of those the transform sets itself wins. The output is merged onto
 * the marker.
 *
 * A transform only inherits the channels it reads (its adapter's `channelKeys`),
 * so a bin's reducer slot is never filled from the marker: a marker's `y` is not
 * read as `binX`'s `'count'` reducer. A `z` the transform hands back becomes
 * the marker's `grouping`, and a `fill`/`stroke` it reduces to becomes the
 * marker's `color`, so the marker keeps drawing its groups and colors from the
 * new rows. Once every transform has run, {@link finishTransforms} applies each
 * type's fix to the marker.
 */
export function resolveTransforms<T extends object>(marker: T, fallbackData: Row[]): T {
	const own = marker as T & { transforms?: MarkerTransform[] };
	if (!own.transforms?.length) return marker;
	let resolved: Row = { ...own };
	for (const transform of own.transforms) {
		const inherited: Row = {
			data: (resolved.data as Row[] | undefined) ?? fallbackData,
			z: resolved.grouping,
			...Object.fromEntries(INHERITED_CHANNELS.map((k) => [k, resolved[k]]))
		};
		const { z, fill, stroke, ...out } = runTransform(transform, inherited);
		resolved = { ...resolved, ...out };
		if (z !== undefined) resolved.grouping = z;
		const color = fill ?? stroke;
		if (color != null && resolved.color === undefined) resolved.color = color;
	}
	return finishTransforms(resolved, own.transforms) as T;
}

/**
 * Applies each transform type's `finish` fix to a marker drawing rows those
 * transforms produced, once per type used - for a marker built from rows that
 * were transformed before it existed (a plot's own processed data).
 */
export function finishTransforms<T extends object>(marker: T, transforms: MarkerTransform[]): T {
	let finished = marker as Row;
	for (const adapter of new Set(transforms.map((t) => ADAPTERS[t.type]))) {
		if (adapter.finish) finished = adapter.finish(finished);
	}
	return finished as T;
}
