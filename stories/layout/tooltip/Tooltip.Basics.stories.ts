import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { ARGENTINA_CHILE_TRENDS, type CountryTrendRow } from '$datasets';

/**
 * `tooltip` enables the floating HTML label; `markers` opts into the in-SVG
 * hover crosshair/dot. The two are independent - either, both, or neither.
 */
const meta = {
	title: 'Layout/Tooltip/Basics',
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

/** A single grouped line chart with `tooltip` + the hover marker. */
export const Basic: Story = {
	args: {
		title: 'GDP per capita vs. population',
		subtitle: 'Hover over the lines',
		data: ARGENTINA_CHILE_TRENDS.filter((d) => d.country === 'Argentina'),
		color: 'metric' as keyof CountryTrendRow,
		tooltip: true,
		markers: [{ type: 'hover' }]
	}
};

/** Tooltip text only - no in-SVG crosshair/dot. */
export const TooltipOnly: Story = {
	args: {
		title: 'Tooltip only (no marker)',
		data: ARGENTINA_CHILE_TRENDS.filter((d) => d.country === 'Argentina'),
		color: 'metric' as keyof CountryTrendRow,
		tooltip: true
	}
};

/** Hover marker only - no floating HTML tooltip. */
export const MarkerOnly: Story = {
	args: {
		title: 'Marker only (no tooltip)',
		data: ARGENTINA_CHILE_TRENDS.filter((d) => d.country === 'Argentina'),
		color: 'metric' as keyof CountryTrendRow,
		markers: [{ type: 'hover' }]
	}
};
