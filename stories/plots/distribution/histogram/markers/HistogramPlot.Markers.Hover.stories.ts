import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HistogramPlot from '$lib/plots/distribution/histogram/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { HEIGHTS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The hover a HistogramPlot has of its own: what `markers={[{ type: 'hover' }]}` draws. Every feature of the hover -
// its strategies, labels, scope, `active` and `others`, `back` and `front` - is in `Layout/Hover`.

const meta = {
	title: 'Plots/Distribution/HistogramPlot/Markers/Hover',
	component: HistogramPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: HEIGHTS,
		x: 'height'
	},
	argTypes: {
		width: { control: { type: 'range', min: 200, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 60, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'HistogramPlot' } }
	}
} satisfies Meta<typeof HistogramPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * The plot's own hover, with a tooltip: the hovered bin's span behind its bar, the whole height of the plot -
 * a bin sits on a continuous axis, where a band is no category's.
 */
export const Basic: Story = {
	args: {
		tooltip: true,
		markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
	}
};
