import { Margins } from '$lib/layout/margins/Margins';
import type { AxisChannelName } from '$lib/types/layout/mapping';
import type { NiceOption } from '$lib/types/layout/scales';

/**
 * "Nice" (1/2/5×10ⁿ) tick steps and the domains they round to, compatible with
 * d3-array's and reimplemented here to avoid depending on internals svelteplot
 * itself pulls in (not one of our declared dependencies) - see
 * https://d3js.org/d3-array/ticks.
 */
export class NiceTicks {
	/**
	 * How far past a tick, as a share of the tick step, a domain still ends on
	 * it. Plain `Math.ceil`/`Math.floor` (what d3's `nice()` uses) has no
	 * tolerance: parts that add up to `100`, but come out `100.00000000000001`
	 * after summing or `100.2` after each was rounded at the source, round a
	 * full step further (`100` → `120`). 5% of the step catches that noise and
	 * lets a mark pass the last tick by a few pixels at most.
	 */
	static readonly TOLERANCE = 0.05;

	/** The pixels between ticks an axis aims for, along x and along y. */
	static readonly SPACING = { x: 80, y: 50 } as const;

	/** The step between nice ticks for an approximate `count` over `[start, stop]`. */
	static step(start: number, stop: number, count: number): number {
		const e10 = Math.sqrt(50);
		const e5 = Math.sqrt(10);
		const e2 = Math.sqrt(2);
		const step0 = Math.abs(stop - start) / Math.max(0, count);
		let step1 = 10 ** Math.floor(Math.log10(step0));
		const error = step0 / step1;
		if (error >= e10) step1 *= 10;
		else if (error >= e5) step1 *= 5;
		else if (error >= e2) step1 *= 2;
		return step1;
	}

	/** Multiples of `step` covering `[start, stop]`, inclusive of either endpoint when it lands exactly on one. */
	static inRange(start: number, stop: number, step: number): number[] {
		if (!(step > 0) || !Number.isFinite(step)) return [];
		const lo = Math.ceil(start / step);
		const hi = Math.floor(stop / step);
		const out: number[] = [];
		for (let i = lo; i <= hi; i++) out.push(i * step);
		return out;
	}

	/** The tolerance a scale's `nice` asks for, or `undefined` for the default. */
	static toleranceOf(nice: NiceOption | undefined): number | undefined {
		return typeof nice === 'object' ? nice.tolerance : undefined;
	}

	/** How many ticks fit `span` pixels at one per `spacing`, and at least `min`. */
	static count(span: number, spacing: number, min: number): number {
		return Math.max(min, Math.round(span / spacing));
	}

	/**
	 * `[lo, hi]` widened outward to the nearest nice step for about `count`
	 * ticks, like d3's `scale.nice(count)` - except a value within
	 * `tolerance × step` past a tick stays on it (see {@link NiceTicks.TOLERANCE}).
	 */
	static domain(
		lo: number,
		hi: number,
		count = 5,
		tolerance: number = NiceTicks.TOLERANCE
	): [number, number] {
		if (!(hi > lo)) return [lo, hi];
		const step = NiceTicks.step(lo, hi, count);
		const slack = step * tolerance;
		const niceLo = Math.floor((lo + slack) / step) * step;
		const niceHi = Math.ceil((hi - slack) / step) * step;
		// `|| 0` turns a `-0` (a bound at zero, rounded toward it) into `0`, which an axis writes without a sign.
		return [niceLo || 0, niceHi || 0];
	}

	/** {@link NiceTicks.domain} with as many ticks as fit `axis` in a plot of this size. */
	static fit(
		size: { width: number; height: number },
		axis: AxisChannelName,
		lo: number,
		hi: number,
		tolerance?: number
	): [number, number] {
		const box = Margins.AXIS_ESTIMATE.contentBox(size.width, size.height);
		const span = axis === 'x' ? box.width : box.height;
		return NiceTicks.domain(lo, hi, NiceTicks.count(span, NiceTicks.SPACING[axis], 2), tolerance);
	}
}
