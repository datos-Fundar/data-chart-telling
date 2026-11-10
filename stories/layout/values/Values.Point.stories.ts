import type { Meta } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import { COUNTRIES_AT_2007, FEMALE_LIFE, FEMALE_PROVINCE_VALUES, PRICES } from '$datasets';
import type { PlotRowContext } from '$lib';
import { plotStory } from '../../common/plotStory';

/**
 * `layout: 'point'` writes each label beside a point of its shape - the default of the plots of lines and dots.
 * The point depends on the shape:
 *
 * - on a line or an area, a row's own point (by default its series' last);
 * - on a dot, its center;
 * - on a bar or a cell, a point of its box: `anchor` names it - an edge's middle (`'top'`...) or a corner
 *   (`'top-left'`...), the middle by default.
 *
 * From that point, `side` says where the text goes as it reads - `'after'` it (to its right), `'before'`,
 * `'above'`, `'below'` or `'on'` it - and `gap` how far (6px across, 8px up or down by default). `select` picks the
 * rows labelled, and labels that would overlap move apart: into lanes along a column on a line, to a free spot
 * around their dot on a scatter.
 */
const meta = {
	title: 'Layout/Values/Point',
	tags: ['autodocs'],
	parameters: { layout: 'padded' }
} satisfies Meta;

export default meta;

const SIZE = { width: 720, height: 360 };
/** Female life expectancy at birth in Argentina, 1947-2019. */
const LIFE_LINE = { ...SIZE, data: FEMALE_LIFE, x: 'year', y: 'value', margins: { right: 60 } };
const years = (v: number) => `${v} years`;

// ── Side and gap ──────────────────────────────────────────────────────────────

/** `side: 'after'`, a line's default: to the right of the point, so the label reads on from the line. */
export const SideAfter = plotStory(LinePlot, 'LinePlot', {
	...LIFE_LINE,
	styles: { values: { side: 'after', format: years } },
	scales: { x: { nice: false } }
});

/** `side: 'above'`: over the point, clear of a line that ends at the right edge. */
export const SideAbove = plotStory(LinePlot, 'LinePlot', {
	...LIFE_LINE,
	styles: { values: { side: 'above', format: years } },
	scales: { x: { nice: false } }
});

/** `side: 'below'` - and `'before'`, to the left - are the mirror images. */
export const SideBelow = plotStory(LinePlot, 'LinePlot', {
	...LIFE_LINE,
	styles: { values: { side: 'below', format: years } },
	scales: { x: { nice: false } }
});

/** `gap` moves the text further from its point. */
export const Gap = plotStory(LinePlot, 'LinePlot', {
	...LIFE_LINE,
	styles: { values: { side: 'above', gap: 20, format: years } },
	scales: { x: { nice: false } }
});

// ── Which rows ────────────────────────────────────────────────────────────────

/**
 * `select` picks the rows labelled of each series: `'first'`, `'last'`, `'min'`, `'max'`, or a list of them. Here
 * each commodity's peak, the year energy prices spiked (IMF, index January 2021 = 100).
 */
export const SelectThePeaks = plotStory(LinePlot, 'LinePlot', {
	...SIZE,
	data: PRICES,
	x: 'date',
	y: 'index',
	color: 'commodity',
	styles: { values: { select: 'max', side: 'above' } }
});

/** `series` labels only the series named: the others stay unlabelled. */
export const OnlySomeSeries = plotStory(LinePlot, 'LinePlot', {
	...SIZE,
	data: PRICES,
	x: 'date',
	y: 'index',
	color: 'commodity',
	styles: {
		values: {
			series: 'Coal',
			select: ['min', 'max'],
			side: 'after',
			fontStyle: {
				stroke: 'white',
				fontWeight: 'bold'
			}
		}
	}
});

// ── When labels would overlap ─────────────────────────────────────────────────

/**
 * On a line, labels that would overlap fan out into lanes, each joined back to its point by an elbow - the four
 * commodities end close together, so their labels share one column.
 */
export const LanesOnLines = plotStory(LinePlot, 'LinePlot', {
	...SIZE,
	data: PRICES,
	x: 'date',
	y: 'index',
	color: 'commodity',
	margins: { right: 140 },
	styles: { values: { show: true } }
});

/**
 * On a scatter, each label takes a free spot around its dot - above it first, then on clockwise
 * - clear of the other labels and dots; one with no room is left out. Here each country's name, read off the row
 * through `format`'s `context`.
 */
export const AroundTheDots = plotStory(ScatterPlot, 'ScatterPlot', {
	...SIZE,
	height: 440,
	data: COUNTRIES_AT_2007,
	x: 'gdp',
	y: 'life',
	scales: { x: { type: 'log' } },
	styles: {
		values: {
			format: (_value: number, _number: unknown, { row }: PlotRowContext) =>
				String((row as { country: string }).country)
		}
	}
});

/**
 * `side: 'on'` writes each value on its own dot. A dot drawn over another hides that one's label, so where dots
 * overlap only the top one's shows.
 */
export const OnTheDots = plotStory(ScatterPlot, 'ScatterPlot', {
	...SIZE,
	height: 440,
	data: COUNTRIES_AT_2007,
	x: 'gdp',
	y: 'life',
	r: 13,
	styles: {
		values: { side: 'on', decimals: 0, fontStyle: { fill: '#ffffff', fontSize: 10 } }
	}
});

// ── On a shape with a box ─────────────────────────────────────────────────────

/**
 * On a bar, the label starts at a point of its box - `anchor`, here the middle of its top edge - and goes on its
 * `side`. With `select`, only some bars are labelled: the province where women live longest.
 */
export const AtAPointOfABar = plotStory(BarPlot, 'BarPlot', {
	...SIZE,
	data: FEMALE_PROVINCE_VALUES,
	x: 'province',
	y: 'value',
	styles: {
		values: {
			layout: 'point',
			anchor: 'top',
			side: 'above',
			select: 'max',
			format: (v: number) => `longest: ${v} years`
		}
	}
});
