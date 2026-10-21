import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SparklinePlot from '$lib/plots/evolution/sparkline/Plot.svelte';
import { REGION_VALUES } from '$datasets';

const GBA = REGION_VALUES.filter(({ region }) => region === 'GBA');

// ── Meta ──────────────────────────────────────────────────────────────────────
// The axes are left out: `axisDisplay: 'visible'` brings either back, and `domain` pins the
// value axis, which otherwise fits the values without reaching for zero.

const meta = {
	title: 'Plots/Evolution/SparklinePlot/Scales',
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
		height: { control: { type: 'range', min: 40, max: 400, step: 10 } },
		scales: { description: 'Per-axis scale configuration.', control: false }
	},
	parameters: {
		docs: { source: { name: 'SparklinePlot' } }
	}
} satisfies Meta<typeof SparklinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** The axes back, for a sparkline that needs them. */
export const WithAxes: Story = {
	args: {
		width: 400,
		height: 160,
		scales: { x: { axisDisplay: 'visible' }, y: { axisDisplay: 'visible' } }
	}
};

/** The value axis pinned from zero. */
export const FromZero: Story = {
	args: { scales: { y: { domain: [0, 30] } } }
};
