import { resolveAccessor } from '$lib/utils/accessors';
import { isGapValue } from '$lib/plots/utils/gaps';
import { DISCRETE_SCALE_TYPES, TEMPORAL_SCALE_TYPES } from '$lib/types/layout/scales';
import type { AxisChannelName } from '$lib/types/layout/mapping';
import type {
	AxisKind,
	AxisRef,
	DiscreteAxesCount,
	InferredAxis,
	Orientation
} from '$lib/types/phases/data/axes';

const AXES: readonly AxisChannelName[] = ['x', 'y'];
const DISCRETE_TYPES = new Set<string>(DISCRETE_SCALE_TYPES);
const TEMPORAL_TYPES = new Set<string>(TEMPORAL_SCALE_TYPES);

/** What {@link PlotAxes.build} reads: the series' own channels and the author's axis scales. */
type PlotAxesSource = {
	series: { x?: unknown; y?: unknown; data: unknown[] }[];
	scales?: { x?: { type?: string }; y?: { type?: string } };
	/** Channels the plot sets itself, which count as active even when no series carries them (an empty one). */
	given?: Partial<Record<AxisChannelName, boolean>>;
	/** How many axes the plot kind lays out as categories. */
	discrete?: DiscreteAxesCount;
};

/**
 * What a plot's position channels are, read once from its series: which
 * channels the author set, how each axis lays out its values, which one holds
 * the categories and which the measured values, and so which way the marks
 * run. Every later phase reads it instead of telling axes apart on its own.
 */
export class PlotAxes {
	readonly x?: InferredAxis;
	readonly y?: InferredAxis;
	/** The axis whose values the plot sorts into, when it has exactly one. */
	readonly category?: AxisChannelName;
	/** The axis the plot measures along. */
	readonly value?: AxisChannelName;
	readonly orientation: Orientation;
	/** The axes the plot kind lays out as bands: its category axes, none for a kind that needs none. */
	readonly bands: readonly AxisChannelName[];

	constructor(fields: {
		x?: InferredAxis;
		y?: InferredAxis;
		category?: AxisChannelName;
		value?: AxisChannelName;
		orientation: Orientation;
		bands?: readonly AxisChannelName[];
	}) {
		this.x = fields.x;
		this.y = fields.y;
		this.category = fields.category;
		this.value = fields.value;
		this.orientation = fields.orientation;
		this.bands = fields.bands ?? [];
	}

	get isHorizontal(): boolean {
		return this.orientation === 'horizontal';
	}

	/** The axis `ref` names: itself, or whichever axis plays that role. */
	resolve(ref: AxisRef): AxisChannelName | undefined {
		return ref === 'x' || ref === 'y' ? ref : this[ref];
	}

	/** Whether `axis` lays out distinct categories. */
	isDiscrete(axis: AxisChannelName): boolean {
		return this[axis]?.kind === 'discrete';
	}

	/** The axis a plot without inferred axes measures along: `y`. */
	static valueOf(state: { axes?: PlotAxes }): AxisChannelName {
		return state.axes?.value ?? 'y';
	}

	/** The axis a plot without inferred axes sorts into: `x`. */
	static categoryOf(state: { axes?: PlotAxes }): AxisChannelName {
		return state.axes?.category ?? 'x';
	}

	/**
	 * Where marks that rise from a baseline start along the value axis: zero,
	 * or the nearest end of a pinned domain that leaves zero out.
	 */
	static baselineOf(state: {
		axes?: PlotAxes;
		scales: Partial<Record<AxisChannelName, { domain?: readonly unknown[] }>>;
	}): number {
		const domain = state.scales[PlotAxes.valueOf(state)]?.domain;
		const lo = Number(domain?.[0]);
		const hi = Number(domain?.[(domain?.length ?? 1) - 1]);
		if (!domain || domain.length < 2 || Number.isNaN(lo) || Number.isNaN(hi)) return 0;
		const [min, max] = [Math.min(lo, hi), Math.max(lo, hi)];
		return min > 0 ? min : max < 0 ? max : 0;
	}

	/** The other position axis. */
	static other(axis: AxisChannelName): AxisChannelName {
		return axis === 'x' ? 'y' : 'x';
	}

	/**
	 * A plot's axes from its series and `scales`. An author's `scales.*.type`
	 * always wins; otherwise each axis' values decide (strings are categories,
	 * dates are time, numbers a range). A kind needing more category axes than
	 * that gives promotes the likeliest ones - time first, then `x` before `y` -
	 * so bars over years stay bars. With one category axis, the other is the
	 * value, and the plot is horizontal when the categories run along `y`; a
	 * plot with a single channel (a histogram) is horizontal when that channel
	 * is `y`.
	 */
	static build({ series, scales, given, discrete = 0 }: PlotAxesSource): PlotAxes {
		const axes: Partial<Record<AxisChannelName, InferredAxis>> = {};
		for (const axis of AXES) {
			if (!given?.[axis] && !series.some((s) => s[axis] !== undefined)) continue;
			const explicit = PlotAxes.#kindOfType(scales?.[axis]?.type);
			axes[axis] = explicit
				? { kind: explicit, origin: 'explicit' }
				: { kind: PlotAxes.#kindOfValues(series, axis), origin: 'inferred' };
		}
		const active = AXES.filter((axis) => axes[axis] !== undefined);
		const discreteAxes = () => active.filter((axis) => axes[axis]!.kind === 'discrete');

		const candidates = active
			.filter((axis) => axes[axis]!.kind !== 'discrete' && axes[axis]!.origin !== 'explicit')
			.sort((a, b) => Number(axes[b]!.kind === 'temporal') - Number(axes[a]!.kind === 'temporal'));
		while (discreteAxes().length < discrete && candidates.length) {
			axes[candidates.shift()!] = { kind: 'discrete', origin: 'promoted' };
		}

		const found = discreteAxes();
		const fields = { x: axes.x, y: axes.y };
		if (discrete === 2) return new PlotAxes({ ...fields, orientation: 'vertical', bands: active });
		if (discrete === 1) {
			if (found.length > 1) {
				console.warn(
					'Plot: both axes lay out categories, but this plot measures along one of them - ' +
						'mark the value axis with a numeric scales type or pass numeric values. Defaulting the categories to x.'
				);
			}
			const category = found.length === 1 ? found[0] : 'x';
			return new PlotAxes({
				...fields,
				category,
				value: PlotAxes.other(category),
				orientation: category === 'y' ? 'horizontal' : 'vertical',
				bands: [category]
			});
		}
		if (active.length === 1) {
			const [only] = active;
			return new PlotAxes({
				...fields,
				value: PlotAxes.other(only),
				orientation: only === 'y' ? 'horizontal' : 'vertical'
			});
		}
		// Two free axes: horizontal only when `y` holds positions (categories or time) and `x` a range.
		const horizontal =
			axes.x?.kind === 'continuous' && axes.y !== undefined && axes.y.kind !== 'continuous';
		const value: AxisChannelName = horizontal ? 'x' : 'y';
		return new PlotAxes({
			...fields,
			value,
			category: found.length === 1 ? found[0] : undefined,
			orientation: horizontal ? 'horizontal' : 'vertical'
		});
	}

	/** The kind an author's scale type sets, or `undefined` when it leaves it to the values. */
	static #kindOfType(type: string | undefined): AxisKind | undefined {
		if (type === undefined || type === 'auto') return undefined;
		if (DISCRETE_TYPES.has(type)) return 'discrete';
		if (TEMPORAL_TYPES.has(type)) return 'temporal';
		return 'continuous';
	}

	/** The kind one axis' values read as: any non-number makes it discrete, all dates temporal. */
	static #kindOfValues(series: PlotAxesSource['series'], axis: AxisChannelName): AxisKind {
		let dates = 0;
		let numbers = 0;
		for (const s of series) {
			const accessor = s[axis];
			if (accessor === undefined) continue;
			const read = resolveAccessor(accessor as never) as (row: unknown) => unknown;
			for (const row of s.data) {
				const v = read(row);
				if (isGapValue(v) || v === '') continue;
				if (typeof v === 'number') numbers++;
				else if (v instanceof Date) dates++;
				else return 'discrete';
			}
		}
		return dates > 0 && numbers === 0 ? 'temporal' : 'continuous';
	}
}
