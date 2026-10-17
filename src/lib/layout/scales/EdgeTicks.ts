import { NiceTicks } from '$lib/layout/scales/NiceTicks';
import type { AxisChannelName } from '$lib/types/layout/mapping';
import type { AxisScale, EdgeTicksOptions } from '$lib/types/layout/scales';

/** What {@link EdgeTicks.build} measures an axis with. */
export type EdgeTicksInput = {
	/** The axis measured: labels sit side by side along x, stacked along y. */
	axis: AxisChannelName;
	/** The axis' numeric values; their extent is the axis' domain. */
	values: number[];
	/** The axis' length in pixels. */
	span: number;
	/** The pixels between ticks the axis aims for, and the fewest ticks it takes. */
	spacing: number;
	min: number;
	/** The tick labels' font size, in pixels. */
	fontSize: number;
	options: EdgeTicksOptions;
};

/**
 * The ticks of a continuous axis: its nice ticks plus the data's first and
 * last values, so a reader sees where the data starts and ends. When an edge
 * tick lands too close to the nice tick next to it for both labels to fit,
 * `options.collision` decides which gives way, or widens the axis instead.
 */
export class EdgeTicks {
	/** The share of the font size one label character takes, on average. */
	static readonly CHARACTER_WIDTH = 0.6;
	/** The pixels left between two neighbouring labels. */
	static readonly LABEL_GAP = 6;

	/** A plot's `scales.<axis>.edgeTicks` over the configuration's `axis.edgeTicks.<axis>`. */
	static resolve(option: AxisScale['edgeTicks'], configured: EdgeTicksOptions): EdgeTicksOptions {
		if (option === undefined) return configured;
		if (typeof option === 'boolean') return { ...configured, enabled: option };
		return { enabled: true, collision: option.collision ?? configured.collision };
	}

	/**
	 * The axis' ticks, and the domain it widens to when `'extend'` resolved a
	 * collision. `undefined` when edge ticks are off or the values span nothing.
	 */
	static build({
		axis,
		values,
		span,
		spacing,
		min,
		fontSize,
		options
	}: EdgeTicksInput): { ticks: number[]; domain?: [number, number] } | undefined {
		if (!options.enabled || values.length < 2) return undefined;
		const lo = Math.min(...values);
		const hi = Math.max(...values);
		if (!(hi > lo)) return undefined;
		const count = NiceTicks.count(span, spacing, min);
		// Whole-number values (years, counts) never get ticks between them.
		const step = values.every(Number.isInteger)
			? Math.max(1, NiceTicks.step(lo, hi, count))
			: NiceTicks.step(lo, hi, count);
		const nice = NiceTicks.inRange(lo, hi, step);
		if (!nice.length) return { ticks: [lo, hi] };

		const eps = step * 1e-6;
		const pixels = (value: number) => ((value - lo) / (hi - lo)) * span;
		// Side by side, two labels need half of each one's width; stacked, one line's height.
		const labelWidth = (value: number) =>
			String(value).length * fontSize * EdgeTicks.CHARACTER_WIDTH;
		const room = (edge: number, neighbour: number) =>
			axis === 'x' ? (labelWidth(edge) + labelWidth(neighbour)) / 2 : fontSize;
		const crowds = (edge: number, neighbour: number) =>
			Math.abs(pixels(edge) - pixels(neighbour)) < room(edge, neighbour) + EdgeTicks.LABEL_GAP;

		const inner = [...nice];
		const before: number[] = [];
		const after: number[] = [];
		let domainLo = lo;
		let domainHi = hi;

		const first = nice[0];
		if (first - lo > eps) {
			if (!crowds(lo, first)) before.push(lo);
			else if (options.collision === 'drop-nice') {
				before.push(lo);
				inner.shift();
			} else if (options.collision === 'extend') {
				domainLo = first - step;
				before.push(domainLo);
			}
		}

		const last = nice[nice.length - 1];
		if (hi - last > eps) {
			if (!crowds(hi, last)) after.push(hi);
			else if (options.collision === 'drop-nice') {
				after.push(hi);
				if (inner[inner.length - 1] === last) inner.pop();
			} else if (options.collision === 'extend') {
				domainHi = last + step;
				after.push(domainHi);
			}
		}

		const ticks = [...before, ...inner, ...after];
		const widened = domainLo !== lo || domainHi !== hi;
		return widened ? { ticks, domain: [domainLo, domainHi] } : { ticks };
	}
}
