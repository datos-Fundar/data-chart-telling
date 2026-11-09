import type { Meta } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import { LIFE, PROVINCE_VALUES, REGION_VALUES } from '$datasets';
import { plotStory } from './plotStory';

/**
 * What a `hover` marker reaches: every hovered point, or with `series` only that series' - drawn in its color -
 * and with `scope: 'segment'` each segment of it on its own, in the segment's color. A plot can take several
 * hover markers, each scoped to a series and drawn its own way. `sync: true` carries the hover to every panel of
 * a facet.
 */
const meta = {
	title: 'Layout/Hover/Scope',
	tags: ['autodocs'],
	parameters: { layout: 'padded' }
} satisfies Meta;

export default meta;

const LINES = {
	width: 760,
	height: 380,
	data: LIFE,
	x: 'year',
	y: 'value',
	color: 'sex',
	// The years and the ages as they are: an axis niced past them leaves the lines in a corner.
	scales: { x: { nice: false }, y: { nice: false } }
};

/** Every series: the marker unscoped. */
export const EverySeries = plotStory(LinePlot, 'LinePlot', {
	...LINES,
	markers: [{ type: 'hover' }]
});

/** `series: 'female'`: the hover draws on the female line only, the male one answers nothing. */
export const OneSeries = plotStory(LinePlot, 'LinePlot', {
	...LINES,
	markers: [{ type: 'hover', series: 'female' }]
});

/**
 * `scope: 'segment'`: the female line is split at 1991 by its `segments`, and the hover draws in the color of
 * the segment the point is in.
 */
export const EachSegment = plotStory(LinePlot, 'LinePlot', {
	...LINES,
	segments: {
		female: [
			{ areas: [{ x: { to: 1991 } }], styles: { stroke: { stroke: '#9ca3af' } } },
			{ areas: [{ x: { from: 1991 } }], styles: { stroke: { stroke: '#dc2626' } } }
		]
	},
	markers: [{ type: 'hover', series: 'female', scope: 'segment' }]
});

/**
 * Two markers, each scoped to a series and drawn its own way: the female line's value in bold, the male one's
 * dot alone. The crosshair is the plot's own in both.
 */
export const OneLookPerSeries = plotStory(LinePlot, 'LinePlot', {
	...LINES,
	markers: [
		{
			type: 'hover',
			series: 'female',
			front: [{ type: 'dot' }, { type: 'text', styles: { fontWeight: 'bold' } }]
		},
		{ type: 'hover', series: 'male', back: [], front: [{ type: 'dot', styles: { dotRadius: 8 } }] }
	]
});

/** `series` on `active` and `others`: only the female bars are restyled - the male ones stay as they are. */
export const ShapesOfOneSeries = plotStory(BarPlot, 'BarPlot', {
	width: 760,
	height: 380,
	data: PROVINCE_VALUES,
	x: 'province',
	y: 'value',
	color: 'sex',
	markers: [
		{
			type: 'hover',
			series: 'female',
			active: { stroke: '#111827', strokeWidth: 2 },
			others: { fillOpacity: 0.3 }
		}
	]
});

/** `sync: true` on a facet: the hovered month is drawn in every region's panel. */
export const AcrossPanels = plotStory(LinePlot, 'LinePlot', {
	width: 760,
	height: 420,
	data: REGION_VALUES,
	x: 'date',
	y: 'value',
	facet: { by: 'region', columns: 3 },
	tooltip: { sync: true },
	markers: [{ type: 'hover', sync: true }]
});
