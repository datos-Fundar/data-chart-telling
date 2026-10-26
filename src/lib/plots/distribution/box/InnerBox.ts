import type { AxisPlotState } from '$lib/types/phases';
import type { BoxMarkerConfig } from '$lib/types/markers/common';
import type { InnerBoxOption, InnerBoxStyle } from '$lib/types/plots/distribution/box/inner';

/**
 * How each box is drawn: its ink, its spot across its series' share of the band,
 * and how a series the legend or hover dims fades its box.
 */
type Placement = {
	ink: string;
	center?: number;
	dimmed?: (series: string) => { opacity?: number } | undefined;
};

/**
 * The narrow box a distribution plot draws over its own marks (a violin's, a
 * raincloud's): one `box` marker per visual segment of each series, in one ink,
 * showing only the parts its `styles.box` asks for. svelteplot always draws
 * every part, so a hidden one is drawn fully transparent.
 */
export class InnerBox {
	/** The parts and width `option` resolves to, or `undefined` when it leaves the box out. */
	static resolve(
		option: InnerBoxOption | undefined,
		width: number
	): Required<InnerBoxStyle> | undefined {
		if (option === false) return undefined;
		const own = typeof option === 'object' ? option : {};
		return {
			width: typeof option === 'number' ? option : (own.width ?? width),
			quartiles: own.quartiles ?? true,
			median: own.median ?? true,
			whiskers: own.whiskers ?? true,
			caps: own.caps ?? false,
			outliers: own.outliers ?? false
		};
	}

	/** One `box` marker per visual segment of each series of `state`. */
	static markers<TData extends Record<string, unknown>, TStyle extends object>(
		state: AxisPlotState<TData, TStyle>,
		box: Required<InnerBoxStyle>,
		{ ink, center, dimmed }: Placement
	): BoxMarkerConfig[] {
		const { channels } = state.processedData!;
		const groups = state.processedGroups ?? [];
		const shown = (on: boolean) => (on ? 1 : 0);
		return groups.flatMap((group, index) => {
			const fade = dimmed?.(group.series.name)?.opacity;
			// Every part fades with the series; the bar's own opacity carries over to the default median.
			const faded = fade === undefined ? {} : { opacity: fade };
			return group.visualSegments.map(
				(seg): BoxMarkerConfig => ({
					type: 'box',
					series: group.series.name,
					data: seg.data,
					x: channels.x as BoxMarkerConfig['x'],
					y: channels.y as BoxMarkerConfig['y'],
					thickness: box.width,
					slot: { index, count: groups.length },
					center,
					bar: { fill: ink, fillOpacity: shown(box.quartiles), ...faded },
					rule: { stroke: ink, strokeWidth: 1.5, strokeOpacity: shown(box.whiskers), ...faded },
					// Without the box behind it, the median takes the ink instead of the box's contrast.
					tickMedian: box.median && (box.quartiles || { stroke: ink, strokeOpacity: 1, ...faded }),
					tickMinMax: box.caps && { stroke: ink, strokeOpacity: 1, ...faded },
					dot: box.outliers ? { r: 2, fill: ink, fillOpacity: 1, ...faded } : { r: 0 }
				})
			);
		});
	}
}
