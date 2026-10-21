import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SparklinePlot from '$lib/plots/evolution/sparkline/Plot.svelte';
import { REGION_VALUES } from '$examples/data';

const GBA = REGION_VALUES.filter(({ region }) => region === 'GBA');

// ── Meta ──────────────────────────────────────────────────────────────────────
// Hovering reads the month under the pointer through the same `tooltip` prop every other
// plot kind takes.

const meta = {
	title: 'Plots/Evolution/SparklinePlot/Tooltip',
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
		tooltip: { description: 'Tooltip runtime configuration.', control: false }
	},
	parameters: {
		docs: { source: { name: 'SparklinePlot' } }
	}
} satisfies Meta<typeof SparklinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** The default text: the hovered month's value. */
export const DefaultTooltip: Story = {
	args: { width: 400, height: 120, tooltip: { sync: false } }
};
