import { resolveAccessor } from '$lib/plots/utils/accessors';
import { getConfiguration } from '$lib/configuration/config.svelte';
import { isGapValue, resolveGapAreaStyle } from '$lib/plots/utils/gaps';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { BarMarkerConfig } from '$lib/types/markers/common';
import type { DiscreteGapFill } from '$lib/plots/utils/gaps';
import type {
	PyramidPlotState,
	PyramidPlotCtx,
	PyramidSeries
} from '$lib/types/plots/pyramid/state';
import type { AxisValue } from '$lib/types/layout/scales';

const GAP_KINDS = ['start', 'middle', 'end'] as const;

/** A gap-fill row tagged with its resolved signed value as a plain field — see the note on `taggedData` below. */
type GapFillRow<TData> = TData & { __gapValue: number };

function valueFor<TData extends Record<string, unknown>>(
	s: PyramidSeries<TData>,
	d: TData
): number {
	const v = Math.abs(Number(resolveAccessor(s.y)(d)));
	return s.side === 'left' ? -v : v;
}

function signFor<TData extends Record<string, unknown>>(
	s: PyramidSeries<TData>,
	magnitude: number
): number {
	return s.side === 'left' ? -magnitude : magnitude;
}

/**
 * PyramidPlot's "markers" phase: one `role: 'segment'` bar per visual
 * segment, always horizontal (category on y, signed magnitude on x) and with
 * no insets — prepended onto whatever the "statistics" phase already put in
 * `state.markers`. Emits no `role: 'hitArea'` markers — PyramidPlot's hover
 * matches nearest points rather than hit-testing category bands.
 */
export function buildMarkers<TData extends Record<string, unknown>>(
	state: PyramidPlotState<TData>,
	ctx: PyramidPlotCtx
): PyramidPlotState<TData> {
	const { groupedSeries, gapFillMaps } = state;
	const gapDefaults = getConfiguration().pyramid.gap;

	const markers: BarMarkerConfig[] = [];
	for (const group of groupedSeries!) {
		// Forwarded raw (a field key or function, whatever `series.x` is)
		// rather than pre-resolved into a closure — svelteplot's own
		// `resolve()` already handles a field-key string per row, and only a
		// literal string (not a function) lets its axis-title auto-inference
		// see the field name. `keyof TData` is always a real string key in
		// practice, just not provably so to TypeScript here.
		const category = group.series.x as string | ((d: TData) => AxisValue);
		const getMagnitude = resolveAccessor(group.series.y);
		const defaultColor = state.colorForSeries!(group.series.name);
		const disabledFill = ctx.disabledFillFor?.(group.series.name);

		for (const seg of group.visualSegments) {
			const realData = seg.data.filter((d) => !isGapValue(getMagnitude(d)));
			if (realData.length === 0) continue;
			markers.push({
				type: 'bar',
				role: 'segment',
				isHorizontal: true,
				data: realData,
				y: category,
				x1: 0,
				x2: (d: TData) => valueFor(group.series, d),
				styles: {
					fill: disabledFill?.fill ?? seg.styles.fill ?? defaultColor,
					fillOpacity: disabledFill?.fillOpacity ?? seg.styles.fillOpacity ?? 1
				}
			});
		}

		const fillMap =
			gapFillMaps!.get(group.series.name) ?? new Map<TData, DiscreteGapFill<BarSegmentStyle>>();
		for (const kind of GAP_KINDS) {
			const filledRows = group.series.data.filter((d) => fillMap.get(d)?.kind === kind);
			if (filledRows.length === 0) continue;
			const base = resolveGapAreaStyle(
				fillMap.get(filledRows[0])!.style,
				defaultColor,
				gapDefaults
			);
			// svelteplot shallow-clones each row before invoking a mark's own
			// geometry accessors, so a `fillMap.get(d)` lookup inside `x2` would
			// see a clone, not the original key — tag the resolved value onto the
			// row as a plain field instead, which survives that clone.
			const taggedData: GapFillRow<TData>[] = filledRows.map((d) => ({
				...d,
				__gapValue: signFor(group.series, Math.abs(fillMap.get(d)!.value))
			}));
			markers.push({
				type: 'bar',
				role: 'segment',
				isHorizontal: true,
				data: taggedData,
				y: category,
				x1: 0,
				x2: (d: TData) => (d as GapFillRow<TData>).__gapValue,
				styles: {
					...base,
					fill: disabledFill?.fill ?? base.fill,
					fillOpacity: disabledFill?.fillOpacity ?? base.fillOpacity
				}
			});
		}
	}

	return { ...state, markers: [...markers, ...(state.markers ?? [])] };
}
