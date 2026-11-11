import type { Meta } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import AreaPlot from '$lib/plots/evolution/area/Plot.svelte';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import {
	AGE_SHARES_BY_YEAR,
	COUNTRIES_AT_2007,
	COUNTRIES_OVER_TIME,
	HEIGHT_DENSITY,
	LIFE
} from '$datasets';
import type { PlotRowContext } from '$lib';
import { plotStory } from '../../common/plotStory';

/**
 * `layout: 'path'` writes each label along an edge or a stroke of its shape - the default of the plots of bars,
 * past each bar's tip. The path depends on the shape:
 *
 * - on a bar or a cell, an edge of its box: `edge` names it - `'top'`, `'bottom'`, `'left'`, `'right'` as the page
 *   draws them, and on a bar `'tip'`, the end its value runs to, or `'base'`, the one at zero;
 * - on a line, the line itself, one label per series, its series' name by default;
 * - on an area, its top edge, or its bottom one with `edge: 'bottom'`;
 * - on a dot, its rim.
 *
 * `side` says which side of the path the text sits on: on a shape `'outside'` (the default), `'inside'` or `'on'`
 * its edge; on a line or an area `'above'` (the default), `'below'` or `'on'` it. `offset` is where along the path,
 * from its left or top end - `'start'`, `'middle'`, `'end'` or a percentage of its length; on a line or an area,
 * `'max'` and `'min'` put each label at its own peak or trough - and `gap` how far from it. A label along a path is
 * not fitted to its shape: it is written whole.
 */
const meta = {
	title: 'Layout/Values/Path',
	tags: ['autodocs'],
	parameters: { layout: 'padded' }
} satisfies Meta;

export default meta;

const SIZE = { width: 720, height: 360 };

/** How many years life expectancy at birth changed from 1987 to 2007, in seven African countries (Gapminder). */
const AFRICA = ['South Africa', 'Kenya', 'Nigeria', 'Ghana', 'Ethiopia', 'Morocco', 'Egypt'];
const LIFE_CHANGE = AFRICA.map((country) => {
	const at = (year: number) =>
		COUNTRIES_OVER_TIME.find((row) => row.country === country && row.year === year)!.life;
	return { country, change: Math.round((at(2007) - at(1987)) * 10) / 10 };
}).sort((a, b) => b.change - a.change);
const CHANGES = {
	...SIZE,
	data: LIFE_CHANGE,
	x: 'country',
	y: 'change',
	scales: {
		x: { domain: LIFE_CHANGE.map(({ country }) => country) },
		y: { domain: [-14, 14] as [number, number] }
	}
};
const SIGNED = { decimals: 1, signDisplay: 'always' as const };
const LIVES = { ...SIZE, data: LIFE, x: 'year', y: 'value', color: 'sex' };

// ── Along a bar's edges ───────────────────────────────────────────────────────

/**
 * A bar plot's default: `edge: 'tip'`, `side: 'outside'`. The tip is read per row, so a bar below zero has its tip
 * at its bottom, and its label goes under it - AIDS cut life expectancy in South Africa and Kenya.
 */
export const PastTheTip = plotStory(BarPlot, 'BarPlot', {
	...CHANGES,
	styles: { values: SIGNED }
});

/** `side: 'inside'`: against the tip within the bar, in the color that reads best on it. */
export const InsideTheTip = plotStory(BarPlot, 'BarPlot', {
	...CHANGES,
	styles: { values: { ...SIGNED, layout: 'path', edge: 'tip', side: 'inside' } }
});

/** `edge: 'base'`: the end at zero, here inside it - the labels line up along the baseline. */
export const AtTheBase = plotStory(BarPlot, 'BarPlot', {
	...CHANGES,
	styles: { values: { ...SIGNED, layout: 'path', edge: 'base', side: 'inside' } }
});

/** An edge of the page, `edge: 'top'`, stays the top whatever the sign: the labels of the bars below zero sit at zero. */
export const AlongAPageEdge = plotStory(BarPlot, 'BarPlot', {
	...CHANGES,
	styles: { values: { ...SIGNED, layout: 'path', edge: 'top' } }
});

// ── Along a line ──────────────────────────────────────────────────────────────

/** On a line plot, each series' name along its own line, near its end (`offset: 'end'`, a line's default). */
export const AlongALine = plotStory(LinePlot, 'LinePlot', {
	...LIVES,
	styles: { values: { layout: 'path' } },
	scales: { x: { nice: false } }
});

/** `side: 'below'` writes it under the line; `offset` moves it along, here a quarter of the way from the left. */
export const BelowAndAlong = plotStory(LinePlot, 'LinePlot', {
	...LIVES,
	styles: { values: { layout: 'path', side: 'below', offset: '25%' } },
	scales: { x: { nice: false } }
});

/** `side: 'on'` writes it over the line itself, on a halo of the background that the line passes behind. */
export const OnTheLine = plotStory(LinePlot, 'LinePlot', {
	...LIVES,
	styles: {
		values: {
			layout: 'path',
			side: 'on',
			offset: '50%',
			fontStyle: { fontWeight: 'bold', stroke: 'white', strokeWidth: 2, paintOrder: 'stroke' }
		}
	},
	scales: { x: { nice: false } }
});

/** With a `format`, the text is the author's, read for the series' first row. */
export const FormattedAlongALine = plotStory(LinePlot, 'LinePlot', {
	...LIVES,
	styles: {
		values: {
			layout: 'path',
			format: (_v: number, _number: unknown, { series }: PlotRowContext) =>
				series === 'female' ? 'Women' : 'Men'
		}
	},
	scales: { x: { nice: false } }
});

/**
 * `offset: 'max'` puts each label at its own line's peak, wherever it is: here the year each age group was its
 * largest share of Argentina's population, 1991-2040 (INDEC censuses and projections). A label whose peak is an end
 * of its line - the children's in 1991, the elderly's in 2040 - is moved in just enough to be written whole.
 */
export const AtEachPeak = plotStory(LinePlot, 'LinePlot', {
	...SIZE,
	data: AGE_SHARES_BY_YEAR,
	x: 'year',
	y: 'share',
	color: 'ageGroup',
	legend: false,
	styles: { values: { layout: 'path', offset: 'max' } },
	scales: { x: { nice: false } }
});

/** `offset: 'min'` puts it at the trough instead, here under the line: each age group at its smallest share. */
export const AtEachTrough = plotStory(LinePlot, 'LinePlot', {
	...SIZE,
	data: AGE_SHARES_BY_YEAR,
	x: 'year',
	y: 'share',
	color: 'ageGroup',
	legend: false,
	styles: { values: { layout: 'path', offset: 'min', side: 'below' } },
	scales: { x: { nice: false } }
});

// ── Along an area's edge ──────────────────────────────────────────────────────

/**
 * On an area, the label runs along its top edge: on a stack, each band's own. Here the share of each age group of
 * Argentina's population, 1991-2022 (INDEC censuses and projections).
 */
export const AlongAnAreaEdge = plotStory(AreaPlot, 'AreaPlot', {
	...SIZE,
	data: AGE_SHARES_BY_YEAR,
	x: 'year',
	y: 'share',
	color: 'ageGroup',
	transforms: [{ type: 'stackY' }],
	styles: {
		values: { layout: 'path', side: 'below', offset: '50%', fontStyle: { fill: '#ffffff' } }
	}
});

/**
 * Two areas that overlap from zero, neither stacked: the height of women and of men as density curves. With
 * `offset: 'max'`, each name sits over its own curve's peak - a legend is not needed.
 */
export const AtEachAreasPeak = plotStory(AreaPlot, 'AreaPlot', {
	...SIZE,
	data: HEIGHT_DENSITY,
	x: 'height',
	y: 'density',
	color: 'sex',
	legend: false,
	styles: {
		area: { fillOpacity: 0.6 },
		values: {
			layout: 'path',
			offset: 'max',
			format: (_value: number, _number: unknown, { series }: PlotRowContext) =>
				series === 'female' ? 'Women' : 'Men',
			fontStyle: { fontSize: 13, fontWeight: 'bold' }
		}
	}
});

// ── Around a dot ──────────────────────────────────────────────────────────────

/**
 * On a dot, the label runs around its rim, over its top: here each country's name over a bubble sized by its
 * population.
 */
export const AroundADot = plotStory(ScatterPlot, 'ScatterPlot', {
	...SIZE,
	height: 440,
	data: COUNTRIES_AT_2007.filter((row) => row.population > 120),
	margins: { right: 40 },
	x: 'gdp',
	y: 'life',
	r: 'population',
	scales: { x: { type: 'log' }, r: { range: [8, 15] as [number, number] } },
	styles: {
		values: {
			layout: 'path',
			format: (_v: number, _number: unknown, { row }: PlotRowContext) =>
				String((row as { country: string }).country)
		}
	}
});
