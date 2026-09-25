import type { EasingName, EasingFn } from '$lib/types/charts/interpolate';
import type { TimeValue, TimelineInterpolation } from '$lib/types/layout/timeline';
import type { AxisValue } from '$lib/types/layout/scales';
import type { Accessor } from '$lib/types/plots/data/common';

const EASINGS: Record<EasingName, EasingFn> = {
	linear: (t) => t,
	quadIn: (t) => t * t,
	quadOut: (t) => 1 - (1 - t) * (1 - t),
	cubicIn: (t) => t * t * t,
	cubicOut: (t) => 1 - Math.pow(1 - t, 3),
	quartIn: (t) => t * t * t * t,
	quartOut: (t) => 1 - Math.pow(1 - t, 4),
	expoOut: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
};

export function resolveEasing(easing?: EasingName | EasingFn): EasingFn {
	if (!easing) return EASINGS.linear;
	if (typeof easing === 'function') return easing;
	return EASINGS[easing] ?? EASINGS.linear;
}

/**
 * Brackets a continuous target position `x` within one key-group's sorted
 * rows and tweens between the two real rows it falls between — the leading
 * edge moves continuously instead of snapping between steps. Returns every
 * already-passed real row plus the synthetic tween row (or just the clamped
 * first/last row when `x` is outside the group's range). A caller that wants
 * a single replacing "frame" (e.g. a bar snapshot) takes just the last entry.
 */
export function interpolateSeries<TRow>({
	rows,
	x,
	getTime,
	getValue,
	create,
	segmentEasing
}: {
	rows: TRow[];
	x: TimeValue;
	getTime: (row: TRow) => TimeValue;
	getValue: (row: TRow) => number;
	create: (lower: TRow, upper: TRow, x: TimeValue, value: number) => TRow;
	segmentEasing: EasingFn;
}): TRow[] {
	if (!rows.length) return [];

	const sorted = [...rows].sort((a, b) => Number(getTime(a)) - Number(getTime(b)));

	if (x <= getTime(sorted[0])) return [sorted[0]];

	const result: TRow[] = [];

	for (let i = 0; i < sorted.length - 1; i++) {
		const d0 = sorted[i];
		const d1 = sorted[i + 1];
		const t0 = getTime(d0);
		const t1 = getTime(d1);

		if (x >= t1) {
			result.push(d0);
			continue;
		}

		if (x >= t0 && x < t1) {
			const tRaw = (Number(x) - Number(t0)) / (Number(t1) - Number(t0));
			const t = segmentEasing(tRaw);
			const value = getValue(d0) + (getValue(d1) - getValue(d0)) * t;

			result.push(d0);
			result.push(create(d0, d1, x, value));
			return result;
		}
	}

	const last = sorted[sorted.length - 1];
	if (x >= getTime(last)) result.push(last);

	return result;
}

/**
 * Resolves `TimelineConfig.interpolate` (`true` | a partial config | unset)
 * into a fully-populated {@link TimelineInterpolation}, falling back to the
 * chart-supplied `value`/`key` defaults — used by `LineChart`/`BarChart` so
 * consumers can write `interpolate: true` instead of repeating their own
 * `y`/`grouping` (or `color`, when `grouping` is unset).
 */
export function resolveTimelineInterpolation<TRow extends Record<string, unknown>>(
	interpolate: boolean | TimelineInterpolation<TRow> | undefined,
	defaults: { value: Accessor<TRow, AxisValue>; key?: Accessor<TRow, unknown> }
): TimelineInterpolation<TRow> | undefined {
	if (!interpolate) return undefined;
	const config = interpolate === true ? {} : interpolate;
	return {
		...config,
		value: config.value ?? defaults.value,
		key: config.key ?? defaults.key
	};
}
