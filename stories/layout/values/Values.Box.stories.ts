import type { Meta } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import { FEMALE_PROVINCE_VALUES, MONTHS, REGION_VALUES } from '$datasets';
import type { PlotRowContext } from '$lib';
import { plotStory } from '../../common/plotStory';

/**
 * `layout: 'box'` writes each label inside its shape's box - the default of a heatmap's cells, a treemap's tiles
 * and a stacked bar's segments. In the middle by default; `anchor` puts it against an edge (`'top'`, `'bottom'`,
 * `'left'`, `'right'`) or in a corner (`'top-left'`...), `gap` from it.
 *
 * A label in a box is fitted to it: one too wide is written smaller, then broken into lines and cut short with an
 * ellipsis, and left out when not even that fits. With no `fill` of its own, it is written in the color that reads
 * best on its shape - white on a dark one, near black on a light one - picked per shape.
 */
const meta = {
	title: 'Layout/Values/Box',
	tags: ['autodocs'],
	parameters: { layout: 'padded' }
} satisfies Meta;

export default meta;

const SIZE = { width: 720, height: 360 };
/** Female life expectancy at birth, by province (INDEC). */
const PROVINCES = { ...SIZE, data: FEMALE_PROVINCE_VALUES, x: 'province', y: 'value' };
/** Monthly inflation by region in 2024, in percent (INDEC). */
const month = (date: Date) => date.toLocaleString('en', { month: 'short', timeZone: 'UTC' });
const INFLATION_2024 = {
	...SIZE,
	height: 260,
	data: REGION_VALUES.filter(({ date }) => date.getUTCFullYear() === 2024).map((row) => ({
		...row,
		month: month(row.date)
	})),
	x: 'month',
	y: 'region',
	color: 'value',
	scales: { x: { domain: MONTHS.slice(12, 24).map(month) } }
};

/** A heatmap's default: each value in the middle of its cell, white on the dark ones and dark on the light ones. */
export const InTheMiddle = plotStory(HeatmapPlot, 'HeatmapPlot', {
	...INFLATION_2024,
	styles: { values: { show: true, decimals: 1 } }
});

/** `anchor: 'top'` writes it against the top edge, inside: `gap` sets how far from it. */
export const AgainstAnEdge = plotStory(BarPlot, 'BarPlot', {
	...PROVINCES,
	styles: { values: { layout: 'box', anchor: 'top', gap: 10 } }
});

/** `anchor: 'top-left'` writes it in a corner. */
export const InACorner = plotStory(BarPlot, 'BarPlot', {
	...PROVINCES,
	styles: { values: { layout: 'box', anchor: 'top-left' } }
});

/**
 * A text too wide for its box is written smaller, then broken into lines and cut short: here each province's
 * name over its value, in bars too narrow for it.
 */
export const FittedToItsBox = plotStory(BarPlot, 'BarPlot', {
	...PROVINCES,
	width: 420,
	styles: {
		values: {
			layout: 'box',
			format: (v: number, _number: unknown, { row }: PlotRowContext) =>
				`${(row as { province: string }).province}: ${v} years`
		}
	}
});
