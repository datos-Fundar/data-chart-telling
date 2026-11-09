import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ViolinPlot from '$lib/plots/distribution/violin/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { IRIS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The hover a ViolinPlot has of its own: what `markers={[{ type: 'hover' }]}` draws. Every feature of the hover -
// its strategies, labels, scope, `active` and `others`, `back` and `front` - is in `Layout/Hover`.

const meta = {
	title: 'Plots/Distribution/ViolinPlot/Markers/Hover',
	component: ViolinPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: IRIS,
		x: 'species',
		y: 'sepalLength'
	},
	argTypes: {
		width: { control: { type: 'range', min: 200, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 60, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ViolinPlot' } }
	}
} satisfies Meta<typeof ViolinPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * The plot's own hover, with a tooltip: the hovered species' band behind its violin.
 */
export const Basic: Story = {
	args: {
		tooltip: true,
		markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
	}
};
