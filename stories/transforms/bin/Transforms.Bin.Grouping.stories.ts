import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { MEASUREMENTS } from '../../data/measurements';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A bin runs per group: `z` splits the rows before they are binned, so each group
// gets its own bars in each bin. A marker's `grouping` is its `z` by default, and
// its `color` colors each group's bars. Bins from different groups sit on top of
// each other unless the marker is offset or the groups are drawn side by side.

const meta = {
	title: 'Transforms/Bin/Grouping',
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

/** `grouping` on the marker splits each bin by `group`, and `color` colors each group's bars. */
export const ByGroup: Story = {
	args: {
		markers: [
			{
				type: 'rect',
				data: MEASUREMENTS,
				x: 'value',
				grouping: 'group',
				color: 'group',
				transforms: [{ type: 'binX', y: 'count', thresholds: 12 }]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** Two separate markers with a filter each: the same bins, drawn one group at a time with their own color. */
export const SeparateMarkers: Story = {
	args: {
		markers: [
			{
				type: 'rect',
				data: MEASUREMENTS.filter((d) => d.group === 'A'),
				x: 'value',
				transforms: [{ type: 'binX', y: 'count', thresholds: 12 }],
				styles: { fill: '#2563eb', fillOpacity: 0.6 }
			},
			{
				type: 'rect',
				data: MEASUREMENTS.filter((d) => d.group === 'B'),
				x: 'value',
				transforms: [{ type: 'binX', y: 'count', thresholds: 12 }],
				styles: { fill: '#dc2626', fillOpacity: 0.6 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
