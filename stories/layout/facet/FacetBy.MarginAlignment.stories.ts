import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import LinePlot from '$lib/plots/line/Plot.svelte';
import { PROVINCE_BARS, PROVINCE_LINES } from '../../data/facet-groups';

/**
 * Facets line up on their own: each column shares its widest left margin and
 * each row its tallest top and bottom, so every plot area starts at the same
 * place even when the axes need very different room - here, value axes
 * spanning five to five million (`scales: 'free-y'`).
 */
const meta = {
	title: 'Layout/Facets/MarginAlignment',
	component: BarPlot,
	parameters: { docs: { source: { name: 'BarPlot' } } },
	tags: ['autodocs'],
	args: { width: 900, height: 420 },
	argTypes: {
		width: { control: { type: 'range', min: 400, max: 1000, step: 20 } },
		height: { control: { type: 'range', min: 300, max: 600, step: 20 } },
		data: { control: false },
		facet: { control: false }
	}
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Vertical bars, one province per facet, each fitting its own value axis. */
export const Bars: Story = {
	args: {
		data: PROVINCE_BARS,
		x: 'category',
		y: 'value',
		facet: { by: 'province', columns: 3, scales: 'free-y' }
	}
};

/** Lines over the same magnitudes - every facet's plot area starts at the same x. */
export const Lines: StoryObj<typeof LinePlot> = {
	parameters: { docs: { source: { name: 'LinePlot' } } },
	render: (args) => ({ Component: LinePlot, props: args }),
	args: {
		width: 900,
		height: 420,
		data: PROVINCE_LINES,
		x: 'year',
		y: 'value',
		facet: { by: 'province', columns: 3, scales: 'free-y' }
	}
};
