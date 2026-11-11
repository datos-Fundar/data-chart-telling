import type { Meta } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { COUNTRIES_OVER_TIME, LIFE, PROVINCE_VALUES } from '$datasets';
import type { PlotRowContext } from '$lib';
import { plotStory } from '../../common/plotStory';

/**
 * What a label says and how it looks is the same in every layout. Its text is the value it labels, written as
 * `decimals`, `prefix`, `suffix` and `signDisplay` ask (over the configuration's `numbers`); `format(value, number,
 * context)` writes anything else - `number` writes a value as those fields ask, and `context` is what the plot
 * knows of the labelled row: its `series`, its `row` for the other fields of the data, and what the plot kind works
 * out (a histogram bin's `count`, a treemap tile's `share`...).
 *
 * `color: 'series'` writes each label in its series' color; `fontStyle` sets the text's look - its `fill`, `fontSize`,
 * `fontWeight`... - but never where it sits, which is the layout's. `hoverIsolate` dims every other series while the
 * pointer is over a label.
 */
const meta = {
	title: 'Layout/Values/Text',
	tags: ['autodocs'],
	parameters: { layout: 'padded' }
} satisfies Meta;

export default meta;

const SIZE = { width: 720, height: 360 };
/** Life expectancy at birth, women and men, by province (INDEC). */
const PROVINCES = { ...SIZE, data: PROVINCE_VALUES, x: 'province', y: 'value', color: 'sex' };

/** How many years life expectancy at birth changed from 1987 to 2007 (Gapminder). */
const CHANGE = ['South Africa', 'Kenya', 'Nigeria', 'Egypt', 'Vietnam'].map((country) => {
	const at = (year: number) =>
		COUNTRIES_OVER_TIME.find((row) => row.country === country && row.year === year)!.life;
	return { country, change: Math.round((at(2007) - at(1987)) * 10) / 10 };
});

/** The display fields: one decimal, a sign on every value, and a unit after it. */
export const NumberDisplay = plotStory(BarPlot, 'BarPlot', {
	...SIZE,
	data: CHANGE,
	x: 'country',
	y: 'change',
	scales: { y: { domain: [-14, 14] as [number, number] } },
	styles: { values: { decimals: 1, signDisplay: 'always', suffix: ' yrs' } }
});

/** `format` writes the text from the value, `number` and the row's `context`: here the series beside its value. */
export const Format = plotStory(LinePlot, 'LinePlot', {
	...SIZE,
	data: LIFE,
	x: 'year',
	y: 'value',
	color: 'sex',
	margins: { right: 150 },
	scales: { x: { nice: false } },
	styles: {
		values: {
			format: (v: number, number: (v: number) => string, { series }: PlotRowContext) =>
				`${series === 'female' ? 'Women' : 'Men'}: ${number(v)} years`,
			decimals: 1
		}
	}
});

/** `color: 'series'` writes each label in its series' color, where it would otherwise be the axis'. */
export const ColorBySeries = plotStory(BarPlot, 'BarPlot', {
	...PROVINCES,
	styles: { values: { color: 'series', fontStyle: { fontWeight: 'bold' } } }
});

/** `fontStyle` styles the text alone: its size, weight, color... */
export const FontStyle = plotStory(BarPlot, 'BarPlot', {
	...PROVINCES,
	styles: { values: { fontStyle: { fontSize: 10, fontStyle: 'italic', fill: '#64748b' } } }
});

/** `hoverIsolate`: over a label, every other series dims, as when it is turned off in the legend. */
export const HoverIsolate = plotStory(BarPlot, 'BarPlot', {
	...PROVINCES,
	styles: { values: { hoverIsolate: true } }
});
