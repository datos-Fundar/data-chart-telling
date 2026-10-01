import type { ScatterPlotState, ScatterPlotCtx } from '$lib/types/plots/scatter/state';
import type { DotMarkerConfig } from '$lib/types/markers/common';
import type { AxisValue } from '$lib/types/layout/scales';

/** ScatterPlot's "markers" phase: one `'dot'` marker per visual segment — prepended onto whatever the "statistics" phase already put in `state.markers`. */
export function buildMarkers<TData extends Record<string, unknown>>(
	state: ScatterPlotState<TData>,
	ctx: ScatterPlotCtx
): ScatterPlotState<TData> {
	const { groupedSeries, channels, colorForSeries, scales, flat } = state;
	const { cfg, disabledDotsFor } = ctx;
	const r = channels!.r;
	const rFn = r === undefined || typeof r === 'number' ? r : r.accessor;
	const opacityFn = channels!.opacity?.accessor;
	const symbolFn = channels!.symbol?.accessor;

	/**
	 * `color`/`grouping` splits `flat` into one series per category, so each
	 * marker call below only ever sees one series' own rows — computing a
	 * channel's domain from just that slice would collapse a categorical
	 * domain to a single value (every row in a series shares the same
	 * category by construction) and skew a continuous one to that series'
	 * own range. Computed once here, across every (non-disabled) series'
	 * combined rows, and passed down as an explicit `domain` so each
	 * marker's own local computation (in `DotMarker.svelte`) is overridden
	 * instead of silently re-deriving a wrong, per-series one.
	 */
	function globalValuesFor(fn: ((d: TData) => unknown) | undefined): unknown[] {
		if (!fn || !flat?.length) return [];
		return flat.map((d) => fn(d)).filter((v) => v != null);
	}

	function globalOpacityDomain(): [number, number] | string[] | undefined {
		const vals = globalValuesFor(opacityFn);
		if (!vals.length) return undefined;
		const allNumeric = vals.every((v) => Number.isFinite(Number(v)));
		return allNumeric
			? [Math.min(...vals.map(Number)), Math.max(...vals.map(Number))]
			: [...new Set(vals.map(String))];
	}

	function globalSymbolDomain(): string[] | undefined {
		const vals = globalValuesFor(symbolFn);
		return vals.length ? [...new Set(vals.map(String))] : undefined;
	}

	const channelScales =
		opacityFn || symbolFn
			? {
					opacity: opacityFn
						? { ...scales.opacity, domain: scales.opacity?.domain ?? globalOpacityDomain() }
						: undefined,
					symbol: symbolFn
						? { ...scales.symbol, domain: scales.symbol?.domain ?? globalSymbolDomain() }
						: undefined
				}
			: undefined;

	const markers: DotMarkerConfig[] = [];
	groupedSeries!.forEach((group) => {
		const defaultColor = colorForSeries!(group.series.name);
		const disabledDots = disabledDotsFor?.(group.series.name);

		for (const seg of group.visualSegments) {
			const dotStyle = seg.styles;
			markers.push({
				type: 'dot',
				data: seg.data,
				// Forwarded raw (a field key or function, whatever `series.x`/`.y`
				// is) rather than pre-resolved into a closure — `DotMarker.svelte`
				// and svelteplot's own `resolve()` already handle a field-key
				// string per row, and only a literal string (not a function)
				// lets svelteplot's axis-title auto-inference see the field name.
				// `keyof TData` is always a real string key in practice (every
				// row is a plain field-keyed record), just not provably so to
				// TypeScript here.
				x: group.series.x as string | ((d: TData) => AxisValue),
				y: group.series.y as string | ((d: TData) => AxisValue),
				r: rFn,
				opacity: opacityFn,
				symbol: symbolFn,
				scales: channelScales,
				styles: {
					dotRadius: disabledDots?.dotRadius ?? dotStyle.dotRadius ?? cfg.scatter.dotRadius,
					dotFill: disabledDots?.dotFill ?? dotStyle.dotFill ?? defaultColor,
					dotSymbol: disabledDots?.dotSymbol ?? dotStyle.dotSymbol,
					dotStroke: disabledDots?.dotStroke ?? dotStyle.dotStroke,
					dotStrokeWidth: disabledDots?.dotStrokeWidth ?? dotStyle.dotStrokeWidth,
					dotFillOpacity: disabledDots?.dotFillOpacity ?? dotStyle.dotFillOpacity,
					dotStrokeOpacity: disabledDots?.dotStrokeOpacity ?? dotStyle.dotStrokeOpacity,
					dotStrokeDasharray: disabledDots?.dotStrokeDasharray ?? dotStyle.dotStrokeDasharray
				}
			});
		}
	});

	return { ...state, markers: [...markers, ...(state.markers ?? [])] };
}
