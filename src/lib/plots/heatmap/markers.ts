import { LegendState } from '$lib/layout/legend/LegendState.svelte';
import { DisabledStyle } from '$lib/layout/legend/DisabledStyle';
import { resolveAccessor } from '$lib/plots/utils/accessors';

import type { ProcessedChannel } from '$lib/types/phases';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { CellSegmentStyle } from '$lib/types/plots/segments/common';
import type { CellMarkerConfig, TextMarkerConfig } from '$lib/types/markers/common';
import type { HeatmapPlotState, HeatmapPlotCtx } from '$lib/types/plots/heatmap/state';
import type { ValueLabels } from '$lib/layout/styles/ValueLabels';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

/** A processed channel as a per-row function. */
function readChannel<TData>(channel: ProcessedChannel | undefined) {
	return resolveAccessor(channel as never) as (d: TData) => AxisValue;
}

/** One resolved-style bucket of cells - `opacity` is a second bucketing dimension alongside `styles`, quantized so the channel produces a bounded number of mark instances. */
type StyleGroup<TData> = { styles: CellSegmentStyle; opacity: number | undefined; data: TData[] };

const OPACITY_STEPS = 32;

/**
 * HeatmapPlot's `styles.values` as one `'text'` marker over the same cells
 * the plot draws, each labelled with its own value and centred on it. Shown
 * by default.
 */
export function buildValueLabels<TData extends Record<string, unknown>>(
	labels: ValueLabels,
	state: HeatmapPlotState<TData>,
	ctx: HeatmapPlotCtx
): TextMarkerConfig[] {
	const { processedData } = state;
	if (!processedData?.data.length) return [];
	const { font, format } = labels;
	const getColor = state.channels!.color.accessor;
	return [
		{
			type: 'text',
			data: processedData.data,
			// Read like the cells read them, so the labels add no axis title the cells don't.
			x: readChannel<TData>(processedData.channels.x),
			y: readChannel<TData>(processedData.channels.y),
			text: (d: TData) => format(Number(getColor(d)), ''),
			styles: {
				...font,
				fill: font?.fill ?? ctx.cfg.continuous.labelColor,
				fontSize: font?.fontSize ?? 12,
				fontWeight: font?.fontWeight ?? 600,
				dx: font?.dx ?? 0,
				dy: font?.dy ?? 0,
				textAnchor: labels.textAnchor ?? 'middle',
				lineAnchor: font?.lineAnchor ?? 'middle'
			}
		}
	];
}

/**
 * HeatmapPlot's "markers" phase: one `'cell'` marker per resolved-style
 * bucket - svelteplot's opacity/numeric scale machinery requires
 * `fillOpacity`/`strokeWidth` to be constant per mark instance, unlike
 * `fill`, which stays a per-row accessor.
 */
export function buildMarks<TData extends Record<string, unknown>>(
	state: HeatmapPlotState<TData>,
	ctx: HeatmapPlotCtx
): AxisBasedMarkersConfig[] {
	const { segments, channels, resolveColor, resolveOpacity } = state;
	const { range } = ctx;
	const getColor = channels!.color.accessor;

	// The cells are the rows the "transforms" phase left, placed by its channels.
	const processed = state.processedData!;
	const rows = processed.data as TData[];
	const getX = readChannel<TData>(processed.channels.x);
	const getY = readChannel<TData>(processed.channels.y);

	/**
	 * A catch-all (no `areas`) always matches, so evaluating segments in plain
	 * array order and merging every match - as this used to do - makes a
	 * catch-all listed *after* an area-specific one (the documented, and only
	 * demonstrated, convention: baseline first, highlight second) overwrite it
	 * on every cell, since it's applied last unconditionally. Area-specific
	 * segments must always win over the catch-all regardless of list order -
	 * so the catch-all is applied once as the baseline, and only
	 * area-specific segments can override it on top, mirroring the same
	 * catch-all/area-specific priority every other plot kind's segments
	 * already follow (see `resolveSeriesSegments` in `utils/segments.ts`).
	 */
	const segList = segments?.default ?? [];
	const segStyleMap = (() => {
		const map = new Map<string, CellSegmentStyle>();
		if (!segList.length) return map;
		const catchAll = segList.find((s) => !s.areas || s.areas.length === 0);
		const areaSegs = segList.filter((s) => s.areas && s.areas.length > 0);
		for (const d of rows) {
			const cx = getX(d) as AxisValue;
			const cy = getY(d) as AxisValue;
			const key = `${String(cx)}::${String(cy)}`;
			if (!map.has(key)) {
				let styles: CellSegmentStyle = catchAll?.styles ? { ...catchAll.styles } : {};
				for (const seg of areaSegs) {
					const matches = seg.areas!.some((area) => {
						/* eslint-disable @typescript-eslint/no-explicit-any */
						const xOk =
							!area.x ||
							((area.x.from === undefined || (cx as any) >= area.x.from) &&
								(area.x.to === undefined || (cx as any) <= area.x.to));
						const yOk =
							!area.y ||
							((area.y.from === undefined || (cy as any) >= area.y.from) &&
								(area.y.to === undefined || (cy as any) <= area.y.to));
						/* eslint-enable @typescript-eslint/no-explicit-any */
						return xOk && yOk;
					});
					if (matches) styles = { ...styles, ...seg.styles };
				}
				map.set(key, styles);
			}
		}
		return map;
	})();

	function rangeFilteredStyle(base: CellSegmentStyle, value: number): CellSegmentStyle {
		if (range == null || LegendState.inRange(value, range)) return base;
		return { ...base, ...DisabledStyle.fill(range.disabledStyle) };
	}

	function getCellStyle(d: TData): CellSegmentStyle {
		return rangeFilteredStyle(
			segStyleMap.get(`${String(getX(d))}::${String(getY(d))}`) ?? {},
			Number(getColor(d))
		);
	}

	const styleGroups = (() => {
		const groups = new Map<string, StyleGroup<TData>>();
		for (const d of rows) {
			const styles = getCellStyle(d);
			const rawOpacity = resolveOpacity?.(d);
			const opacity =
				rawOpacity != null ? Math.round(rawOpacity * OPACITY_STEPS) / OPACITY_STEPS : undefined;
			const key = JSON.stringify({ styles, opacity });
			let group = groups.get(key);
			if (!group) {
				group = { styles, opacity, data: [] };
				groups.set(key, group);
			}
			group.data.push(d);
		}
		return [...groups.values()];
	})();

	const markers: CellMarkerConfig[] = styleGroups.map((group) => ({
		type: 'cell',
		data: group.data,
		x: getX,
		y: getY,
		fill: (d: TData) => group.styles.fill ?? resolveColor!(d),
		styles: {
			fillOpacity: group.styles.fillOpacity ?? group.opacity ?? 1,
			stroke: group.styles.stroke,
			strokeWidth: group.styles.strokeWidth ?? 0,
			strokeOpacity: group.styles.strokeOpacity,
			strokeDasharray: group.styles.strokeDasharray,
			borderRadius: group.styles.borderRadius
		},
		inset: 0.5
	}));

	return markers;
}
