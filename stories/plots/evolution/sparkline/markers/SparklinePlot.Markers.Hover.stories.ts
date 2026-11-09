import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SparklinePlot from '$lib/plots/evolution/sparkline/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { REGION_VALUES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The hover a SparklinePlot has of its own: what `markers={[{ type: 'hover' }]}` draws. Every feature of the hover -
// its strategies, labels, scope, `active` and `others`, `back` and `front` - is in `Layout/Hover`.

const meta = {
	title: 'Plots/Evolution/SparklinePlot/Markers/Hover',
	component: SparklinePlot,
	tags: ['autodocs'],
	args: {
		width: 300,
		height: 80,
		data: REGION_VALUES.filter(({ region }) => region === 'GBA'),
		x: 'date',
		y: 'value'
	},
	argTypes: {
		width: { control: { type: 'range', min: 200, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 60, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'SparklinePlot' } }
	}
} satisfies Meta<typeof SparklinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * The plot's own hover, with a tooltip: a dot on the hovered month, and nothing else.
 */
export const Basic: Story = {
	args: {
		tooltip: true,
		markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
	}
};
