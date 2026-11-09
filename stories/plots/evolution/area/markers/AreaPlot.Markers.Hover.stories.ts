import type { Meta, StoryObj } from '@storybook/svelte-vite';
import AreaPlot from '$lib/plots/evolution/area/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { REGION_VALUES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The hover a AreaPlot has of its own: what `markers={[{ type: 'hover' }]}` draws. Every feature of the hover -
// its strategies, labels, scope, `active` and `others`, `back` and `front` - is in `Layout/Hover`.

const meta = {
	title: 'Plots/Evolution/AreaPlot/Markers/Hover',
	component: AreaPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: REGION_VALUES,
		x: 'date',
		y: 'value',
		color: 'region'
	},
	argTypes: {
		width: { control: { type: 'range', min: 200, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 60, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'AreaPlot' } }
	}
} satisfies Meta<typeof AreaPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * The plot's own hover, with a tooltip: a dashed crosshair along `x` at the hovered month, and a dot and the
 * value on the edge of each area.
 */
export const Basic: Story = {
	args: {
		tooltip: true,
		markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
	}
};
