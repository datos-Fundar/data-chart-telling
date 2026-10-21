import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';

import type { ScatterPlotState, ScatterPlotCtx } from '$lib/types/plots/correlation/scatter/state';
import type { DotMarkerConfig, TextMarkerConfig } from '$lib/types/markers/common';
import type { ProcessedRow } from '$lib/types/phases';
import type { AxisValue } from '$lib/types/layout/mapping';
import { ValueLabels } from '$lib/layout/styles/ValueLabels';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

/**
 * ScatterPlot's `styles.values` as one `'text'` marker over the same
 * processed rows its dots draw, each labelled with its own `y` value. A label
 * sits beside its point and flips to the other side where its text would
 * cross the plot's edge (`edgeAware`).
 */
export function buildValueLabels<TData extends Record<string, unknown>>(
	labels: ValueLabels,
	state: ScatterPlotState<TData>,
	ctx: ScatterPlotCtx
): TextMarkerConfig[] {
	const { processedData } = state;
	if (!processedData?.data.length) return [];
	const { font, format } = labels;
	const position = ProcessedPositions.of(processedData);
	const nameOf = (d: ProcessedRow) => String(d[SERIES_KEY]);
	const valueOf = ValueLabels.valueOf(state);
	return [
		{
			type: 'text',
			data: processedData.data,
			x: position.x as TextMarkerConfig['x'],
			y: position.y as TextMarkerConfig['y'],
			text: (d: ProcessedRow) => format(Number(valueOf(d)), nameOf(d)),
			styles: {
				...font,
				fill: font?.fill ?? ctx.cfg.axis.color,
				fontSize: font?.fontSize ?? 11,
				fontWeight: font?.fontWeight ?? 500,
				dx: font?.dx ?? 8,
				dy: font?.dy ?? 0,
				textAnchor: labels.textAnchor ?? 'start',
				lineAnchor: font?.lineAnchor ?? 'middle'
			},
			edgeAware: true
		}
	];
}

/**
 * ScatterPlot's "markers" phase: one `'dot'` marker per visual segment of the
 * rows the "transforms" phase left, in their own order, so a reordering
 * transform decides which dots paint on top - prepended onto whatever the
 * "statistics" phase already put in `state.markers` - and its value labels on
 * top of everything.
 */
export function buildMarks<TData extends Record<string, unknown>>(
	state: ScatterPlotState<TData>,
	ctx: ScatterPlotCtx
): AxisBasedMarkersConfig[] {
	const { channels, colorForSeries, scales, flat } = state;
	const { cfg, interaction } = ctx;
	const r = channels!.r;
	const rFn = r === undefined || typeof r === 'number' ? r : r.accessor;
	const opacityFn = channels!.opacity?.accessor;
	const symbolFn = channels!.symbol?.accessor;

	/**
	 * `color`/`grouping` splits `flat` into one series per category, so each
	 * marker call below only ever sees one series' own rows - computing a
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
	(state.processedGroups ?? []).forEach((group) => {
		const defaultColor = colorForSeries!(group.series.name);
		const disabledDots = interaction?.dotsFor(group.series.name);

		for (const seg of group.visualSegments) {
			const dotStyle = seg.styles;
			markers.push({
				type: 'dot',
				data: seg.data,
				// Forwarded raw (a field key or function, whatever `series.x`/`.y`
				// is) rather than pre-resolved into a closure - `DotMarker.svelte`
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

	return markers;
}
