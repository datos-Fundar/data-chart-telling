import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { MEASUREMENTS } from '../../data/measurements';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `thresholds` decides where the bins start and stop. A number asks for about
// that many bins, a list gives the exact edges, and a named generator (`auto`,
// `sturges`, `scott`, `freedman-diaconis`) picks a count from the data. `interval`
// is different: it fixes the width of every bin, and takes over from `thresholds`.

const meta = {
	title: 'Transforms/Bin/Thresholds',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: [],
		x: 'x',
		y: 'y'
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

/** `thresholds` as a number: about that many bins, evenly spaced over the data's own range. */
export const CountOfBins: Story = {
	args: {
		markers: [
			{
				type: 'rect',
				data: MEASUREMENTS,
				x: 'value',
				transforms: [{ type: 'binX', y: 'count', thresholds: 6 }],
				styles: { fill: '#2563eb', fillOpacity: 0.8 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `thresholds` as a list: the bin edges are exactly these, so the bins can be uneven. */
export const ExplicitEdges: Story = {
	args: {
		markers: [
			{
				type: 'rect',
				data: MEASUREMENTS,
				x: 'value',
				transforms: [
					{ type: 'binX', y: 'count', thresholds: [15, 25, 30, 35, 38, 42, 45, 50, 55] }
				],
				styles: { fill: '#2563eb', fillOpacity: 0.8 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** A named generator: `sturges` picks the bin count from the number of rows. */
export const NamedGenerator: Story = {
	args: {
		markers: [
			{
				type: 'rect',
				data: MEASUREMENTS,
				x: 'value',
				transforms: [{ type: 'binX', y: 'count', thresholds: 'sturges' }],
				styles: { fill: '#2563eb', fillOpacity: 0.8 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `interval` fixes every bin's width: here one unit of `value` per bin. */
export const FixedInterval: Story = {
	args: {
		markers: [
			{
				type: 'rect',
				data: MEASUREMENTS,
				x: 'value',
				transforms: [{ type: 'binX', y: 'count', interval: 2 }],
				styles: { fill: '#2563eb', fillOpacity: 0.8 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
