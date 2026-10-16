import type { MarkerTransform } from '$lib/types/transforms';
import { StackTransform } from '$lib/phases/transforms/methods/StackTransform';
import { BinTransform } from '$lib/phases/transforms/methods/BinTransform';
import { DensityTransform } from '$lib/phases/transforms/methods/DensityTransform';
import { WindowTransform } from '$lib/phases/transforms/methods/WindowTransform';
import { NormalizeTransform } from '$lib/phases/transforms/methods/NormalizeTransform';
import { PositionTransform } from '$lib/phases/transforms/methods/PositionTransform';
import { OrderTransform } from '$lib/phases/transforms/methods/OrderTransform';
import { GroupTransform } from '$lib/phases/transforms/methods/GroupTransform';
import type { Row, TransformAdapter } from '$lib/types/phases/transforms/adapter';

/** Each transform type's adapter: its channels, how it runs, and its own fixes. */
const ADAPTERS: Record<MarkerTransform['type'], TransformAdapter> = {
	stackX: StackTransform.x,
	stackY: StackTransform.y,
	stackMosaicX: StackTransform.mosaicX,
	stackMosaicY: StackTransform.mosaicY,
	binX: BinTransform.x,
	binY: BinTransform.y,
	bin: BinTransform.grid,
	densityX: DensityTransform.x,
	densityY: DensityTransform.y,
	windowX: WindowTransform.windowX,
	windowY: WindowTransform.windowY,
	bollingerX: WindowTransform.bollingerX,
	bollingerY: WindowTransform.bollingerY,
	normalizeX: NormalizeTransform.x,
	normalizeY: NormalizeTransform.y,
	normalizeParallelX: NormalizeTransform.parallelX,
	normalizeParallelY: NormalizeTransform.parallelY,
	mapX: NormalizeTransform.mapX,
	mapY: NormalizeTransform.mapY,
	intervalX: PositionTransform.intervalX,
	intervalY: PositionTransform.intervalY,
	jitterX: PositionTransform.jitterX,
	jitterY: PositionTransform.jitterY,
	shiftX: PositionTransform.shiftX,
	shiftY: PositionTransform.shiftY,
	sort: OrderTransform.sort,
	shuffle: OrderTransform.shuffle,
	reverse: OrderTransform.reverse,
	filter: OrderTransform.filter,
	select: OrderTransform.select,
	selectFirst: OrderTransform.first,
	selectLast: OrderTransform.last,
	selectMinX: OrderTransform.minX,
	selectMaxX: OrderTransform.maxX,
	selectMinY: OrderTransform.minY,
	selectMaxY: OrderTransform.maxY,
	groupX: GroupTransform.x,
	groupY: GroupTransform.y,
	groupZ: GroupTransform.z,
	group: GroupTransform.grid
};

/** Runs a marker's or a plot's transforms through svelteplot, one type's adapter at a time. */
export class Transforms {
	/** The channels a marker hands down to its transforms, when it has them. */
	static readonly INHERITED_CHANNELS = ['x', 'y', 'x1', 'x2', 'y1', 'y2'] as const;

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
	static run(transform: MarkerTransform, inherited: Row = {}): Row {
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
	 * new rows. Once every transform has run, {@link Transforms.finish} applies each
	 * type's fix to the marker.
	 */
	static resolve<T extends object>(marker: T, fallbackData: Row[]): T {
		const own = marker as T & { transforms?: MarkerTransform[] };
		if (!own.transforms?.length) return marker;
		let resolved: Row = { ...own };
		for (const transform of own.transforms) {
			const inherited: Row = {
				data: (resolved.data as Row[] | undefined) ?? fallbackData,
				z: resolved.grouping,
				...Object.fromEntries(Transforms.INHERITED_CHANNELS.map((k) => [k, resolved[k]]))
			};
			const { z, fill, stroke, ...out } = Transforms.run(transform, inherited);
			resolved = { ...resolved, ...out };
			if (z !== undefined) resolved.grouping = z;
			const color = fill ?? stroke;
			if (color != null && resolved.color === undefined) resolved.color = color;
		}
		return Transforms.finish(resolved, own.transforms) as T;
	}

	/**
	 * Applies each transform type's `finish` fix to a marker drawing rows those
	 * transforms produced, once per type used - for a marker built from rows that
	 * were transformed before it existed (a plot's own processed data).
	 */
	static finish<T extends object>(marker: T, transforms: MarkerTransform[]): T {
		let finished = marker as Row;
		for (const adapter of new Set(transforms.map((t) => ADAPTERS[t.type]))) {
			if (adapter.finish) finished = adapter.finish(finished);
		}
		return finished as T;
	}
}
