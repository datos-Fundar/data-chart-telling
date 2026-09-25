import { disabledFillOverride } from '$lib/plots/utils/legendDisabled';
import type { AxisValue } from '$lib/types/layout/scales';
import type { CellSegmentStyle } from '$lib/types/plots/segments/common';
import type { CellMarkerConfig } from '$lib/types/markers/common';
import type { HeatmapPlotState, HeatmapPlotCtx } from '$lib/types/plots/heatmap/state';

/** One resolved-style bucket of cells. */
type StyleGroup<TData> = { styles: CellSegmentStyle; data: TData[] };

/**
 * HeatmapPlot's "markers" phase: one `'cell'` marker per resolved-style
 * bucket — svelteplot's opacity/numeric scale machinery requires
 * `fillOpacity`/`strokeWidth` to be constant per mark instance, unlike
 * `fill`, which stays a per-row accessor.
 */
export function buildMarkers<TData extends Record<string, unknown>>(
	state: HeatmapPlotState<TData>,
	ctx: HeatmapPlotCtx
): HeatmapPlotState<TData> {
	const { segments, flat, channels, resolveColor } = state;
	const { range } = ctx;
	const { x: xAcc, y: yAcc, color: colorAcc } = channels!;
	const getX = xAcc.accessor;
	const getY = yAcc.accessor;
	const getColor = colorAcc.accessor;

	/**
	 * A catch-all (no `areas`) always matches, so evaluating segments in plain
	 * array order and merging every match — as this used to do — makes a
	 * catch-all listed *after* an area-specific one (the documented, and only
	 * demonstrated, convention: baseline first, highlight second) overwrite it
	 * on every cell, since it's applied last unconditionally. Area-specific
	 * segments must always win over the catch-all regardless of list order —
	 * so the catch-all is applied once as the baseline, and only
	 * area-specific segments can override it on top, mirroring the same
	 * catch-all/area-specific priority every other plot kind's segments
	 * already follow (see `resolveSeriesSegments` in `utils/segments.ts`).
	 */
	const segList = segments.default ?? [];
	const segStyleMap = (() => {
		const map = new Map<string, CellSegmentStyle>();
		if (!segList.length) return map;
		const catchAll = segList.find((s) => !s.areas || s.areas.length === 0);
		const areaSegs = segList.filter((s) => s.areas && s.areas.length > 0);
		for (const d of flat!) {
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
		if (range == null || (value >= range.min && value <= range.max)) return base;
		return { ...base, ...disabledFillOverride(range.disabledStyle) };
	}

	function getCellStyle(d: TData): CellSegmentStyle {
		return rangeFilteredStyle(
			segStyleMap.get(`${String(getX(d))}::${String(getY(d))}`) ?? {},
			Number(getColor(d))
		);
	}

	const styleGroups = (() => {
		const groups = new Map<string, StyleGroup<TData>>();
		for (const d of flat!) {
			const styles = getCellStyle(d);
			const key = JSON.stringify(styles);
			let group = groups.get(key);
			if (!group) {
				group = { styles, data: [] };
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
			fillOpacity: group.styles.fillOpacity ?? 1,
			stroke: group.styles.stroke,
			strokeWidth: group.styles.strokeWidth ?? 0,
			strokeOpacity: group.styles.strokeOpacity,
			strokeDasharray: group.styles.strokeDasharray,
			borderRadius: group.styles.borderRadius
		},
		inset: 0.5
	}));

	return { ...state, markers };
}
