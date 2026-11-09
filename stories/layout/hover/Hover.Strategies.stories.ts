import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import { COUNTRIES_AT_2007, LIFE, PROVINCE_VALUES } from '$datasets';
import StrategySwitchDemo from './StrategySwitchDemo.svelte';
import StrategySwitchDemoSource from './StrategySwitchDemo.svelte?raw';
import { demoSource } from '../../common/docsSource';
import { plotStory } from './plotStory';

/**
 * The `strategy` says which points the hover reaches from the one under the pointer: `'x'` every point at its
 * `x`, `'y'` every one at its `y`, `'punctual'` that point alone, `'series'` every point of its series. A plot
 * follows its axes unless told otherwise - along the category (or index) axis, `'punctual'` on heatmaps and
 * scatter plots - and the `hover` marker's `strategy` (or the tooltip's) sets it.
 *
 * What the hover draws follows the strategy in force: a line plot's crosshair runs along each axis it matches
 * along, and the shapes `active` restyles are the ones it reaches.
 */
const meta = {
	title: 'Layout/Hover/Strategies',
	tags: ['autodocs'],
	parameters: { layout: 'padded' }
} satisfies Meta;

export default meta;

const SIZE = { width: 760, height: 380 };
const LINES = {
	...SIZE,
	tooltip: true,
	data: LIFE,
	x: 'year',
	y: 'value',
	color: 'sex',
	// The years and the ages as they are: an axis niced past them leaves the lines in a corner.
	scales: { x: { nice: false }, y: { nice: false } }
};

/** `'x'`, a line plot's own: every line at the hovered year, and a crosshair along `x`. */
export const AlongX = plotStory(LinePlot, 'LinePlot', {
	...LINES,
	markers: [{ type: 'hover', strategy: 'x' }]
});

/** `'y'`: every point at the hovered value, and a crosshair along `y`. */
export const AlongY = plotStory(LinePlot, 'LinePlot', {
	...LINES,
	markers: [{ type: 'hover', strategy: 'y' }]
});

/** `'punctual'`: the one point under the pointer, and a crosshair along both axes. */
export const Punctual = plotStory(LinePlot, 'LinePlot', {
	...LINES,
	markers: [{ type: 'hover', strategy: 'punctual' }]
});

/** `'series'`: every point of the hovered line, and no crosshair - they share no `x` or `y`. */
export const Series = plotStory(LinePlot, 'LinePlot', {
	...LINES,
	markers: [{ type: 'hover', strategy: 'series' }]
});

/**
 * The strategy decides which shapes are `active`: on a grouped bar plot, `'x'` reaches both bars of the
 * province - one band behind them - and the other provinces fade.
 */
export const ActiveBarsAlongX = plotStory(BarPlot, 'BarPlot', {
	...SIZE,
	data: PROVINCE_VALUES,
	x: 'province',
	y: 'value',
	color: 'sex',
	markers: [{ type: 'hover', strategy: 'x', others: { fillOpacity: 0.3 } }]
});

/** `'series'` on the same plot: every bar of the hovered series, each with its slice of its band behind it. */
export const ActiveBarsOfASeries = plotStory(BarPlot, 'BarPlot', {
	...SIZE,
	data: PROVINCE_VALUES,
	x: 'province',
	y: 'value',
	color: 'sex',
	markers: [{ type: 'hover', strategy: 'series', others: { fillOpacity: 0.3 } }]
});

/** `'punctual'` on the same plot: the one bar under the pointer, and its slice of the band. */
export const ActiveBar = plotStory(BarPlot, 'BarPlot', {
	...SIZE,
	data: PROVINCE_VALUES,
	x: 'province',
	y: 'value',
	color: 'sex',
	markers: [{ type: 'hover', strategy: 'punctual', others: { fillOpacity: 0.3 } }]
});

/** A scatter plot's own `'punctual'`: the dot under the pointer, and the rest faded. */
export const ActiveDot = plotStory(ScatterPlot, 'ScatterPlot', {
	...SIZE,
	data: COUNTRIES_AT_2007,
	x: 'gdp',
	y: 'life',
	color: 'continent',
	markers: [{ type: 'hover', others: { fillOpacity: 0.2 } }]
});

/**
 * The strategy can change while the plot is shown: a composer's `hover={{ strategy }}` set from a step of a
 * story. The plot's own hover follows it - here its crosshair - with no new `hover` marker.
 */
export const ChangedWhileShown: StoryObj = {
	render: () => ({ Component: StrategySwitchDemo as never }),
	parameters: demoSource(StrategySwitchDemoSource)
};
