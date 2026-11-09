import type { Meta } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import PyramidPlot from '$lib/plots/distribution/pyramid/Plot.svelte';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import {
	AGE_GROUPS,
	COUNTRIES_AT_2007,
	LIFE,
	PENGUIN_COUNTS,
	POPULATION_BY_AGE,
	PROVINCE_VALUES
} from '$datasets';
import HoverRing from './HoverRing.svelte';
import { plotStory } from './plotStory';

/**
 * `back` and `front` are the markers the hover draws: behind the plot's shapes, and in front of them. They are
 * any markers but another `hover` - a `rule`, a `band`, a `rect`, a `dot`, a `text`, a `component` - with their
 * styles and events, and they replace the plot kind's own when set (`back: []` draws nothing behind).
 *
 * Each draws the hovered points, unless it has `data` of its own: a row per point with its `x`, `y`, `label`,
 * `series`, `color`, `areaInset` and `row`. What a marker leaves unset comes from the hover: its `x` and `y`, a
 * `rule`'s and a `band`'s place, a `text`'s label, the configuration's `hover` look and the series' color.
 * `points: 'active'` draws only the point under the pointer, and a function of the point some of them.
 */
const meta = {
	title: 'Layout/Hover/Back and front',
	tags: ['autodocs'],
	parameters: { layout: 'padded' }
} satisfies Meta;

export default meta;

const SIZE = { width: 760, height: 380 };
const LINES = {
	...SIZE,
	data: LIFE,
	x: 'year',
	y: 'value',
	color: 'sex',
	// The years and the ages as they are: an axis niced past them leaves the lines in a corner.
	scales: { x: { nice: false }, y: { nice: false } }
};
const GROUPED = { ...SIZE, data: PROVINCE_VALUES, x: 'province', y: 'value', color: 'sex' };

/** Only `front`: the dot without its label, and the plot's crosshair behind. */
export const ReplaceTheFront = plotStory(LinePlot, 'LinePlot', {
	...LINES,
	markers: [{ type: 'hover', front: [{ type: 'dot' }] }]
});

/** `back: []`: no crosshair, the dot and its label in front. */
export const NothingBehind = plotStory(LinePlot, 'LinePlot', {
	...LINES,
	markers: [{ type: 'hover', back: [] }]
});

/** A crosshair of the author's own: solid and red, along both axes, at the point under the pointer. */
export const OwnCrosshair = plotStory(LinePlot, 'LinePlot', {
	...LINES,
	markers: [
		{
			type: 'hover',
			back: [
				{
					type: 'rule',
					axis: 'x',
					points: 'active',
					styles: { stroke: '#dc2626', strokeOpacity: 0.8 }
				},
				{
					type: 'rule',
					axis: 'y',
					points: 'active',
					styles: { stroke: '#dc2626', strokeOpacity: 0.8 }
				}
			]
		}
	]
});

/**
 * `points: 'all'` against `'active'`: a rule along `y` at every hovered point - one per series - where the
 * plot's crosshair along `x` is drawn once, at the point under the pointer.
 */
export const EveryPointOrTheActiveOne = plotStory(LinePlot, 'LinePlot', {
	...LINES,
	markers: [
		{
			type: 'hover',
			back: [
				{ type: 'rule', axis: 'x', points: 'active' },
				{ type: 'rule', axis: 'y', styles: { strokeDasharray: 'dotted' } }
			]
		}
	]
});

/** A bar plot's band, restyled, and a dot and the value on each bar, in its series' slice of the band. */
export const BandAndLabels = plotStory(BarPlot, 'BarPlot', {
	...GROUPED,
	markers: [
		{
			type: 'hover',
			back: [{ type: 'band', axis: 'x', styles: { fill: '#fde68a', fillOpacity: 0.6 } }],
			front: [{ type: 'dot' }, { type: 'text' }]
		}
	]
});

/** A band along each axis of a heatmap: they cross at the hovered cell, over its row and its column. */
export const CrossingBands = plotStory(HeatmapPlot, 'HeatmapPlot', {
	...SIZE,
	data: PENGUIN_COUNTS,
	x: 'island',
	y: 'species',
	color: 'count',
	markers: [
		{
			type: 'hover',
			back: [
				{ type: 'band', axis: 'x' },
				{ type: 'band', axis: 'y' }
			],
			active: { stroke: '#111827', strokeWidth: 2 }
		}
	]
});

/**
 * `points` as a function of the point: a pyramid's labels, each on its side of zero - the left side's written to
 * the left of its dot, the right side's to the right.
 */
export const PointsPicked = plotStory(PyramidPlot, 'PyramidPlot', {
	width: 760,
	height: 520,
	data: POPULATION_BY_AGE.filter(({ year }) => year === 2022),
	x: 'share',
	y: 'ageGroup',
	color: 'sex',
	scales: { y: { domain: AGE_GROUPS } },
	markers: [
		{
			type: 'hover',
			front: [
				{ type: 'dot' },
				{
					type: 'text',
					points: (point: { x: unknown }) => Number(point.x) >= 0,
					styles: { textAnchor: 'start', lineAnchor: 'middle', dx: 10, dy: 0 }
				},
				{
					type: 'text',
					points: (point: { x: unknown }) => Number(point.x) < 0,
					styles: { textAnchor: 'end', lineAnchor: 'middle', dx: -10, dy: 0 }
				}
			]
		}
	]
});

/** A marker that does not read the points: a `text` with `data` of its own, shown only while the hover is on. */
export const OwnData = plotStory(LinePlot, 'LinePlot', {
	...LINES,
	markers: [
		{
			type: 'hover',
			front: [
				{ type: 'dot' },
				{
					type: 'text',
					data: [{ x: 1960, y: 80 }],
					x: 'x',
					y: 'y',
					text: () => 'Hovering',
					styles: { fontWeight: 'bold', textAnchor: 'start' }
				}
			]
		}
	]
});

/** A `component` in `front`: a ring around each hovered point, drawn by a Svelte component of the author's. */
export const Component = plotStory(ScatterPlot, 'ScatterPlot', {
	...SIZE,
	data: COUNTRIES_AT_2007,
	x: 'gdp',
	y: 'life',
	color: 'continent',
	markers: [
		{ type: 'hover', front: [{ type: 'component', component: HoverRing, props: { radius: 14 } }] }
	]
});
