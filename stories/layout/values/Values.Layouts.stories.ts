import type { Meta } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import { COUNTRIES_AT_2007, FEMALE_PROVINCE_VALUES, LIFE } from '$datasets';
import { plotStory } from '../../common/plotStory';

/**
 * A plot writes its values on its own shapes with `styles.values`: any option of it turns them on
 * (`{ show: true }` alone does too), and each plot kind places them its own way by default - past the tip of a
 * bar, beside the last point of a line, around a scatter's dots.
 *
 * Where a label goes is its **layout**, one of three, named by the geometry it is laid out on:
 *
 * - `'point'` - beside a point of the shape: a line's last point, a dot, a corner of a bar. Labels that would
 *   overlap move apart (`declutter`).
 * - `'path'` - along an edge or a stroke of the shape: past a bar's tip, along a line, around a dot.
 * - `'box'` - inside each shape's box, fitted to it: a bar, a cell, a tile.
 *
 * A plot kind takes the layouts its shapes can write, and its `styles.values` type takes only those: a line has
 * no box to write in, so `LinePlot` takes `'point'` and `'path'`. Changing the layout is explicit - `layout` -
 * and each kind brings its own defaults for every layout it takes. The same layouts are what a marker's `label`
 * takes: see _Markers_.
 */
const meta = {
	title: 'Layout/Values/Layouts',
	tags: ['autodocs'],
	parameters: { layout: 'padded' }
} satisfies Meta;

export default meta;

const SIZE = { width: 720, height: 360 };
/** Female life expectancy at birth, by province (INDEC). */
const PROVINCES = { ...SIZE, data: FEMALE_PROVINCE_VALUES, x: 'province', y: 'value' };
/** Life expectancy at birth in Argentina, women and men, 1947-2019. */
const LIVES = { ...SIZE, data: LIFE, x: 'year', y: 'value', color: 'sex' };

/** A bar plot's default: `'path'`, along each bar's tip and past it. */
export const PathOnBars = plotStory(BarPlot, 'BarPlot', {
	...PROVINCES,
	styles: { values: { show: true } }
});

/** The same bars with `layout: 'box'`: each value inside its bar, in the color that reads best on it. */
export const BoxOnBars = plotStory(BarPlot, 'BarPlot', {
	...PROVINCES,
	styles: { values: { layout: 'box' } }
});

/**
 * The same bars with `layout: 'point'`: beside a point of each bar - here above the middle of its top edge. A
 * point label can pick its rows with `select`: here only the longest bar.
 */
export const PointOnBars = plotStory(BarPlot, 'BarPlot', {
	...PROVINCES,
	styles: { values: { layout: 'point', anchor: 'top', side: 'above', select: 'max' } }
});

/** A line plot's default: `'point'`, beside the last point of each series. */
export const PointOnLines = plotStory(LinePlot, 'LinePlot', {
	...LIVES,
	styles: { values: { show: true } },
	scales: { x: { nice: false } }
});

/** The same lines with `layout: 'path'`: each series' name along its own line. */
export const PathOnLines = plotStory(LinePlot, 'LinePlot', {
	...LIVES,
	styles: { values: { layout: 'path' } },
	scales: { x: { nice: false } }
});

/** A scatter plot's default: `'point'`, each value on a free spot around its dot - one with no room is left out. */
export const PointOnDots = plotStory(ScatterPlot, 'ScatterPlot', {
	...SIZE,
	data: COUNTRIES_AT_2007,
	x: 'gdp',
	y: 'life',
	styles: { values: { show: true } }
});
