import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DensityPlot from '$lib/plots/distribution/density/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { HEIGHTS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The hover a DensityPlot has of its own: what `markers={[{ type: 'hover' }]}` draws. Every feature of the hover -
// its strategies, labels, scope, `active` and `others`, `back` and `front` - is in `Layout/Hover`.

const meta = {
	title: 'Plots/Distribution/DensityPlot/Markers/Hover',
	component: DensityPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: HEIGHTS,
		x: 'height',
		grouping: 'group'
	},
	argTypes: {
		width: { control: { type: 'range', min: 200, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 60, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'DensityPlot' } }
	}
} satisfies Meta<typeof DensityPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * The plot's own hover, with a tooltip: a dashed crosshair along the estimated axis, and a dot and the
 * estimated density on each curve.
 */
export const Basic: Story = {
	args: {
		tooltip: true,
		markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
	}
};
