import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { ENERGY_MIX } from '../../data/energy-mix';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `stackY` stacks a marker's rows on the y axis: each group starts where the one
// before it ends, so the top edge is the running total. `stackX` does the same on
// the x axis. Both leave the rows' own values alone and add the `y1`/`y2` (or
// `x1`/`x2`) channels that the marker draws from. Demoed on an empty `LinePlot`
// canvas so only the marker is on screen — see `Plots/AreaPlot` for stacks on charts.

const meta = {
	title: 'Transforms/Stack/Basics',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: [],
		x: 'x',
		y: 'y',
		scales: { x: { domain: [2010, 2020] }, y: { domain: [0, 100] } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Without a stack, every area starts from zero, so they overlap and each one reads on its own against the axis. */
export const Unstacked: Story = {
	args: {
		markers: [
			{
				type: 'area',
				data: ENERGY_MIX,
				x: 'year',
				y: 'share',
				grouping: 'source',
				color: 'source',
				styles: { fillOpacity: 0.5 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `stackY` puts each area on top of the one before: the top edge is the total, here 100% in every year. */
export const StackY: Story = {
	args: {
		markers: [
			{
				type: 'area',
				data: ENERGY_MIX,
				x: 'year',
				y: 'share',
				grouping: 'source',
				color: 'source',
				transforms: [{ type: 'stackY' }],
				styles: { fillOpacity: 0.85 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
