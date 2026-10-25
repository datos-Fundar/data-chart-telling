import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SparklinePlot from '$lib/plots/evolution/sparkline/Plot.svelte';
import { REGION_VALUES } from '$datasets';

const GBA = REGION_VALUES.filter(({ region }) => region === 'GBA');

// ── Meta ──────────────────────────────────────────────────────────────────────
// A sparkline is a line plot stripped down to its shape: no axes, no legend, a thin line,
// and a dot on the last point with its value beside it. It is small by default; give it
// the width and height of the text or table cell it sits in.

const meta = {
	title: 'Plots/Evolution/SparklinePlot/Series',
	component: SparklinePlot,
	tags: ['autodocs'],
	args: {
		width: 300,
		height: 80,
		data: GBA,
		x: 'date',
		y: 'value'
	},
	argTypes: {
		width: { control: { type: 'range', min: 100, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 40, max: 400, step: 10 } }
	},
	parameters: {
		docs: { source: { name: 'SparklinePlot' } }
	}
} satisfies Meta<typeof SparklinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** One series: monthly inflation in the Buenos Aires area. */
export const Default: Story = {};

/** Several series in one plot, each with its last value; `legend` names them. */
export const SeveralSeries: Story = {
	args: {
		width: 400,
		height: 160,
		data: REGION_VALUES,
		color: 'region',
		legend: true
	}
};

/** `facet` draws one sparkline per category, each in its own panel. */
export const OnePerRegion: Story = {
	args: {
		width: 360,
		height: 300,
		data: REGION_VALUES,
		facet: { by: 'region', columns: 1, gap: 4 }
	}
};

/** Side by side, sharing one scale so the heights compare. */
export const SharedScale: Story = {
	args: {
		width: 700,
		height: 120,
		data: REGION_VALUES,
		facet: { by: 'region', columns: 3, gap: 8, scales: 'shared' }
	}
};
