import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { isGapValue } from '$lib/plots/utils/gaps';
import { MarkerAxisValues } from '$lib/phases/scales/MarkerAxisValues';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { CategoryOrder } from '$lib/phases/scales/CategoryOrder';
import { NiceTicks } from '$lib/layout/scales/NiceTicks';
import { DISCRETE_SCALE_TYPES } from '$lib/types/layout/scales';
import type { AxisChannelName } from '$lib/types/layout/mapping';
import type { AxisScale } from '$lib/types/layout/scales';
import type { AxisRef } from '$lib/types/phases/data/axes';
import type { AxisPlotState, AxisPlotCtx, PhaseStage, ScalesStageOptions } from '$lib/types/phases';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAxisState = AxisPlotState<any, any, any, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAxisScale = AxisScale<any>;

const AXES = ['x', 'y'] as const;

const POSITION_CHANNELS = {
	x: ['x', 'x1', 'x2'],
	y: ['y', 'y1', 'y2']
} as const;

const DISCRETE_TYPES = new Set<string>(DISCRETE_SCALE_TYPES);

/** The values as finite numbers, or `undefined` when any isn't a number (a band or date axis). */
function numeric(values: unknown[]): number[] | undefined {
	const present = values.filter((v) => v != null && v !== '');
	if (!present.every((v) => typeof v === 'number')) return undefined;
	return (present as number[]).filter(Number.isFinite);
}

/**
 * The shared "scales" phase. Each axis the kind lays out as categories
 * (`state.axes.bands`) becomes a band scale, padded and ordered as the kind
 * says; each `symmetric` axis reaches as far below zero as above it; and an
 * unpinned numeric axis grows to cover derived markers and the ranges the
 * transforms gave the rows - from zero on the axes `zero` names. The author's
 * `scales` always win, and a kind adds its own on top (`defaults`, `fit`, `extend`).
 */
export class ScalesPhase<
	TState extends AnyAxisState,
	TCtx extends AxisPlotCtx
> implements PhaseStage<TState, TCtx> {
	readonly phase = 'scales' as const;
	readonly #options: ScalesStageOptions<TState, TCtx>;

	constructor(options: ScalesStageOptions<TState, TCtx> = {}) {
		this.#options = options;
	}

	/** The axes whose marks grow from zero, in this state. */
	zeroAxes(state: { axes?: PlotAxes }): AxisChannelName[] {
		return ScalesPhase.#axesOf(this.#options.zero, state);
	}

	/** The axes that reach as far below zero as above it, in this state. */
	symmetricAxes(state: { axes?: PlotAxes }): AxisChannelName[] {
		return ScalesPhase.#axesOf(this.#options.symmetric, state);
	}

	/** Whether the kind keeps its categories in the order the data gives them. */
	get keepsDataOrder(): boolean {
		return this.#options.bandOrder === 'data';
	}

	run = (state: TState, ctx: TCtx): TState => {
		const options = this.#options;
		const { axes, processedData, markers = [] } = state;
		const defaults = options.defaults?.(state, ctx) ?? {};
		const symmetric = new Set(this.symmetricAxes(state));
		const zero = new Set(this.zeroAxes(state));
		const scales = { ...state.scales } as Record<AxisChannelName, AnyAxisScale | undefined>;

		for (const axis of AXES) {
			const own = ScalesPhase.#defaultsOf(defaults, axis, axes);
			if (axes?.bands.includes(axis)) {
				scales[axis] = this.#band(scales[axis], own, state, axis);
				continue;
			}
			// The value axis of a plot with categories is never one itself, whatever it was marked as.
			const stripType =
				axis === axes?.value &&
				axes.bands.length > 0 &&
				DISCRETE_TYPES.has(scales[axis]?.type ?? '');
			if (Object.keys(own).length || stripType) {
				const given = { ...scales[axis] };
				if (stripType) delete given.type;
				scales[axis] = { ...own, ...given };
			}
			if (symmetric.has(axis) && !scales[axis]?.domain) {
				const reach = ScalesPhase.#reachOf(state, axis);
				scales[axis] = { ...scales[axis], domain: [-reach, reach] };
			}
		}

		const fitted = options.fit?.({ ...state, scales } as TState, ctx) ?? {};
		for (const axis of AXES) {
			if (fitted[axis]) scales[axis] = { ...scales[axis], ...fitted[axis] };
		}

		for (const axis of AXES) {
			if (axes?.bands.includes(axis) || scales[axis]?.domain) continue;
			const derived = MarkerAxisValues.of(markers, axis);
			const ranged = POSITION_CHANNELS[axis]
				.slice(1)
				.some((name) => processedData?.channels[name] !== undefined);
			// A transform's own output on an axis from zero (a bin's count) has no baseline row to reach it.
			const aggregated = (processedData?.transforms.length ?? 0) > 0 && zero.has(axis);
			if (!derived.length && !ranged && !aggregated) continue;
			const own = numeric(ProcessedPositions.values(processedData, axis));
			if (!own) continue;
			const values = [...own, ...derived, ...(zero.has(axis) ? [0] : [])];
			const lo = Math.min(...values);
			const hi = Math.max(...values);
			const author = scales[axis];
			// Niced here, with a tolerance, so parts that add up to a whole land on its tick.
			const niced = author?.nice !== false && author?.ticks == null && hi > lo;
			scales[axis] = niced
				? {
						...author,
						domain: NiceTicks.fit(state, axis, lo, hi, author?.niceTolerance),
						nice: false
					}
				: { ...author, domain: [lo, hi], nice: author?.nice ?? true };
		}

		const next = { ...state, scales } as TState;
		return options.extend ? options.extend(next, ctx) : next;
	};

	/** A category axis as a band scale: the kind's options under the author's, in the order the kind asks for. */
	#band(
		author: AnyAxisScale | undefined,
		own: AnyAxisScale,
		state: AnyAxisState,
		axis: AxisChannelName
	): AnyAxisScale {
		const processed = state.processedData;
		const given = author ?? {};
		const type =
			given.type === undefined || given.type === 'auto' || given.type === 'categorical'
				? 'band'
				: given.type;
		const band: AnyAxisScale = { ...own, ...given, type };
		// A padding the author gives replaces the kind's own inner and outer ones.
		if (given.padding !== undefined) {
			if (own.paddingInner !== undefined && given.paddingInner === undefined) {
				band.paddingInner = given.padding;
			}
			if (own.paddingOuter !== undefined && given.paddingOuter === undefined) {
				band.paddingOuter = given.padding;
			}
		}
		// A sort by what the categories hold is read here, off the rows; the axis then draws from its domain.
		if (CategoryOrder.isDeclarative(band.sort)) {
			const order = band.domain ? undefined : CategoryOrder.of(band.sort, state, axis);
			delete band.sort;
			if (order) band.domain = order as never;
		}
		if (this.keepsDataOrder && !band.domain) {
			band.domain = [...new Set(ProcessedPositions.values(processed, axis))] as never;
		}
		return band;
	}

	/** The axes `refs` name, by name or by the role they play in this state. */
	static #axesOf(
		refs: readonly AxisRef[] | undefined,
		state: { axes?: PlotAxes }
	): AxisChannelName[] {
		return (refs ?? []).map((ref) =>
			ref === 'value'
				? PlotAxes.valueOf(state)
				: ref === 'category'
					? PlotAxes.categoryOf(state)
					: ref
		);
	}

	/** The kind's options for one axis: those for its role, then those for it by name. */
	static #defaultsOf(
		defaults: Partial<Record<AxisRef, AnyAxisScale>>,
		axis: AxisChannelName,
		axes: PlotAxes | undefined
	): AnyAxisScale {
		const role = axis === axes?.value ? 'value' : axis === axes?.category ? 'category' : undefined;
		return { ...(role ? defaults[role] : undefined), ...defaults[axis] };
	}

	/** How far an axis reaches from zero: the largest magnitude its rows, and the gaps filled in between them, sit at. */
	static #reachOf(state: AnyAxisState, axis: AxisChannelName): number {
		const rows = ProcessedPositions.values(state.processedData, axis)
			.filter((v) => !isGapValue(v))
			.map((v) => Math.abs(Number(v)));
		const filled = [...(state.gapFillMaps?.values() ?? [])].flatMap((fills) =>
			[...fills.values()].map((fill) => Math.abs(fill.value))
		);
		const reach = Math.max(...[...rows, ...filled].filter(Number.isFinite));
		return Number.isFinite(reach) ? reach : 1;
	}
}
