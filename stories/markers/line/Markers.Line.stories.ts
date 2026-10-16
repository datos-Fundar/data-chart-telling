import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `line` marker (svelteplot's own `Line`) - a single stroke through its own
// `data`, independent of any plot series (unlike the plot's own default
// series line). Demoed on an empty `LinePlot` canvas so only the marker
// itself is on screen - see `Plots/*/Markers` for markers used alongside
// real chart data.

const meta = {
	title: 'Markers/Line',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: [],
		x: 'x',
		y: 'y',
		scales: { x: { domain: [0, 10] }, y: { domain: [0, 10] } }
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

const SEGMENT = [
	{ x: 1, y: 2 },
	{ x: 4, y: 8 },
	{ x: 7, y: 3 },
	{ x: 9, y: 6 }
];

/** One stroke through `data`, in row order. */
export const Basic: Story = {
	args: {
		markers: [{ type: 'line', data: SEGMENT, x: 'x', y: 'y' }] satisfies AxisBasedMarkersConfig[]
	}
};

/** Two independent `line` markers, each its own `data` and `styles`. */
export const MultipleLines: Story = {
	args: {
		markers: [
			{ type: 'line', data: SEGMENT, x: 'x', y: 'y', styles: { stroke: '#0891b2' } },
			{
				type: 'line',
				data: SEGMENT.map((d) => ({ x: d.x, y: 10 - d.y })),
				x: 'x',
				y: 'y',
				styles: { stroke: '#dc2626' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `styles` (a `StrokeStyle`) sets color/width/dash pattern. */
export const CustomStyle: Story = {
	args: {
		markers: [
			{
				type: 'line',
				data: SEGMENT,
				x: 'x',
				y: 'y',
				styles: { stroke: '#7c3aed', strokeWidth: 3, strokeDasharray: '6 3' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
