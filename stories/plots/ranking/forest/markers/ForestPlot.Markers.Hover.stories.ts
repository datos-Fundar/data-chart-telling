import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ForestPlot from '$lib/plots/ranking/forest/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { INFLATION_RANGES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The hover a ForestPlot has of its own: what `markers={[{ type: 'hover' }]}` draws. Every feature of the hover -
// its strategies, labels, scope, `active` and `others`, `back` and `front` - is in `Layout/Hover`.

const meta = {
	title: 'Plots/Ranking/ForestPlot/Markers/Hover',
	component: ForestPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 520,
		data: INFLATION_RANGES,
		x: 'mean',
		y: 'period',
		lower: 'min',
		upper: 'max',
		color: 'region'
	},
	argTypes: {
		width: { control: { type: 'range', min: 200, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 60, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ForestPlot' } }
	}
} satisfies Meta<typeof ForestPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * The plot's own hover, with a tooltip: a rule along the value axis - here the horizontal one - at the dot
 * under the pointer, and a dot and the value on each dot of the hovered period.
 */
export const Basic: Story = {
	args: {
		tooltip: true,
		markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
	}
};
