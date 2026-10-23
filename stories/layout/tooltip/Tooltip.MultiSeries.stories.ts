import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { ARGENTINA_CHILE_TRENDS, type CountryTrendRow } from '$datasets';

/** Matching and scoping across multiple series sharing the hovered x. */
const meta = {
	title: 'Layout/Tooltip/MultiSeries',
	component: LinePlot,
	tags: ['autodocs'],
	args: { width: 680, height: 400, data: ARGENTINA_CHILE_TRENDS, x: 'year', y: 'value' },
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 1000, step: 20 } },
		height: { control: { type: 'range', min: 240, max: 700, step: 20 } },
		data: { control: false },
		x: { control: false },
		y: { control: false },
		color: { control: false },
		tooltip: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** All series sharing the hovered x, blank-line separated. */
export const MultiSeriesCrossing: Story = {
	args: {
		title: 'All series crossing the x',
		data: ARGENTINA_CHILE_TRENDS.filter((d) => d.country === 'Argentina'),
		color: 'metric' as keyof CountryTrendRow,
		tooltip: { strategy: 'x' },
		markers: [{ type: 'hover' }]
	}
};

/** Tooltip narrowed to one series via `tooltip.series`; the marker is scoped the same way via `markers.series`. */
export const SeriesSubset: Story = {
	args: {
		title: 'Tooltip scoped to one series',
		data: ARGENTINA_CHILE_TRENDS.filter((d) => d.country === 'Argentina'),
		color: 'metric' as keyof CountryTrendRow,
		tooltip: { strategy: 'x', series: ['GDP per capita'] },
		markers: [{ type: 'hover', series: 'GDP per capita' }]
	}
};
