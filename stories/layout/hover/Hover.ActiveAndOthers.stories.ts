import type { Meta } from '@storybook/svelte-vite';
import TreemapPlot from '$lib/plots/part-of-a-whole/treemap/Plot.svelte';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import HistogramPlot from '$lib/plots/distribution/histogram/Plot.svelte';
import LollipopPlot from '$lib/plots/ranking/lollipop/Plot.svelte';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import {
	ACTIVITY_BRANCHES,
	COUNTRIES_AT_2007,
	FEMALE_LIFE,
	FEMALE_PROVINCE_VALUES,
	HEIGHTS,
	PENGUIN_COUNTS,
	PROVINCE_VALUES
} from '$datasets';
import { plotStory } from './plotStory';

/**
 * `active` and `others` restyle the shapes themselves while the hover is on: the ones it reaches take
 * `active`, every other one `others` - `fill`, `fillOpacity`, `stroke`, `strokeWidth`, `strokeOpacity` and
 * `strokeDasharray`, a value or a function of the row. Nothing is drawn over the shapes, so their labels stay on
 * top, and a label with no color of its own is written in the one that reads best on the shape's new color.
 *
 * A plot's own shapes take them where its kind links them to the hover: a treemap's tiles, a heatmap's cells,
 * the bars of a bar, bullet or pyramid plot, a histogram's bins, a scatter plot's dots and the dots of the
 * Cleveland family. A marker of the author's takes them with `hover: true` (also hovering its rows) or
 * `hover: 'style'`.
 *
 * They go over the plot's `styles` and `segments`. The legend goes over them: a series it dims stays hoverable,
 * but keeps its dimmed fill and opacities; one it hides, omits or rescales away is out of the hover.
 */
const meta = {
	title: 'Layout/Hover/Active and others',
	tags: ['autodocs'],
	parameters: { layout: 'padded' }
} satisfies Meta;

export default meta;

const SIZE = { width: 760, height: 400 };
const TREEMAP = { ...SIZE, data: ACTIVITY_BRANCHES, value: 'value', grouping: 'sector.branch' };
const GROUPED = { ...SIZE, data: PROVINCE_VALUES, x: 'province', y: 'value', color: 'sex' };

/** The hovered tile at full strength and outlined, every other one faded; each label still on its tile. */
export const Treemap = plotStory(TreemapPlot, 'TreemapPlot', {
	...TREEMAP,
	styles: { area: { fillOpacity: 0.85 } },
	tooltip: true,
	markers: [
		{
			type: 'hover',
			active: { fillOpacity: 1, stroke: '#111827', strokeWidth: 2 },
			others: { fillOpacity: 0.35 }
		}
	]
});

/** `active` alone: the hovered tile recolored, and the label written in the color that reads best on it. */
export const RecoloredLabelReadsOnIt = plotStory(TreemapPlot, 'TreemapPlot', {
	...TREEMAP,
	markers: [{ type: 'hover', active: { fill: '#fde68a' } }]
});

/** The hovered cell outlined, the rest faded: a heatmap's cells only change with `active` and `others`. */
export const Heatmap = plotStory(HeatmapPlot, 'HeatmapPlot', {
	...SIZE,
	data: PENGUIN_COUNTS,
	x: 'island',
	y: 'species',
	color: 'count',
	markers: [
		{
			type: 'hover',
			active: { stroke: '#111827', strokeWidth: 3 },
			others: { fillOpacity: 0.4 }
		}
	]
});

/** Bars: the province's two bars outlined over the plot's band, the other provinces faded. */
export const Bars = plotStory(BarPlot, 'BarPlot', {
	...GROUPED,
	markers: [
		{
			type: 'hover',
			active: { stroke: '#111827', strokeWidth: 1.5 },
			others: { fillOpacity: 0.3 }
		}
	]
});

/** Only `others`, and the band behind left out: the hovered bars as they are, the rest faded. */
export const OnlyOthers = plotStory(BarPlot, 'BarPlot', {
	...GROUPED,
	markers: [{ type: 'hover', back: [], others: { fillOpacity: 0.25 } }]
});

/** A scatter plot's dots: every one but the hovered one faded. */
export const Dots = plotStory(ScatterPlot, 'ScatterPlot', {
	...SIZE,
	data: COUNTRIES_AT_2007,
	x: 'gdp',
	y: 'life',
	color: 'continent',
	markers: [{ type: 'hover', others: { fillOpacity: 0.15, strokeOpacity: 0.15 } }]
});

/** A histogram's bins: the hovered one over its span, the others faded. */
export const Bins = plotStory(HistogramPlot, 'HistogramPlot', {
	...SIZE,
	data: HEIGHTS,
	x: 'height',
	markers: [{ type: 'hover', others: { fillOpacity: 0.3 } }]
});

/** A lollipop's dots: the hovered one in red, the others in gray. */
export const LollipopDots = plotStory(LollipopPlot, 'LollipopPlot', {
	...SIZE,
	scales: { y: { domain: [70, 85] } },
	data: FEMALE_PROVINCE_VALUES,
	x: 'province',
	y: 'value',
	markers: [{ type: 'hover', active: { fill: '#dc2626' }, others: { fill: '#9ca3af' } }]
});

/** A style as a function of the row: the big branches fade less than the small ones. */
export const FunctionOfTheRow = plotStory(TreemapPlot, 'TreemapPlot', {
	...TREEMAP,
	markers: [
		{
			type: 'hover',
			others: { fillOpacity: (row: { value: number }) => (row.value > 10 ? 0.6 : 0.25) }
		}
	]
});

/**
 * Over the plot's `segments`: every bar is outlined in gold by a segment, and the faded ones keep the outline -
 * the hover sets only their opacity. The hovered ones take a black outline over the gold one.
 */
export const OverSegments = plotStory(BarPlot, 'BarPlot', {
	...GROUPED,
	segments: { default: [{ styles: { stroke: 'gold', strokeWidth: 2 } }] },
	markers: [{ type: 'hover', active: { stroke: '#111827' }, others: { fillOpacity: 0.3 } }]
});

/**
 * A sector the legend dims (`Tertiary`) stays hoverable and shows in the tooltip, but keeps its dimmed fill: the
 * hover gives its tiles their outline, not their strength back.
 */
export const UnderTheLegendDim = plotStory(TreemapPlot, 'TreemapPlot', {
	...TREEMAP,
	tooltip: true,
	legend: { off: { Tertiary: 0.2 } },
	markers: [
		{
			type: 'hover',
			active: { fillOpacity: 1, stroke: '#111827', strokeWidth: 2 },
			others: { fillOpacity: 0.4 }
		}
	]
});

/** A sector the legend hides (`Tertiary`) is out of the hover: never reached, never restyled. */
export const UnderTheLegendHide = plotStory(TreemapPlot, 'TreemapPlot', {
	...TREEMAP,
	legend: { off: { Tertiary: { mode: 'hide' } } },
	markers: [{ type: 'hover', others: { fillOpacity: 0.4, stroke: '#dc2626' } }]
});

/**
 * A marker of the author's linked with `hover: true`: dots over the line's own rows, each one hovering its row
 * and taking `active` and `others`. The line itself has no shape of a row to restyle - its point is the dot.
 */
export const AuthorMarker = plotStory(LinePlot, 'LinePlot', {
	...SIZE,
	data: FEMALE_LIFE,
	x: 'year',
	y: 'value',
	scales: { x: { nice: false }, y: { nice: false } },
	markers: [
		{ type: 'dot', x: 'year', y: 'value', hover: true, styles: { dotRadius: 5 } },
		{
			type: 'hover',
			back: [],
			front: [{ type: 'text' }],
			active: { fill: '#dc2626' },
			others: { fillOpacity: 0.25 }
		}
	]
});
