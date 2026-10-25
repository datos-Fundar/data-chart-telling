import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `text` marker (svelteplot's own `Text`) - one label per row of its own
// `data`. Demoed on an empty `LinePlot` canvas so only the marker itself is
// on screen - see `Plots/*/Markers` for markers used alongside real chart
// data.

const meta = {
	title: 'Markers/Text',
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

const POINTS = [
	{ x: 2, y: 3, label: 'A' },
	{ x: 5, y: 7, label: 'B' },
	{ x: 8, y: 4, label: 'C' }
];

/** `text` is a field key here - one label per row, read straight from `data`. */
export const Basic: Story = {
	args: {
		markers: [
			{ type: 'text', data: POINTS, x: 'x', y: 'y', text: 'label' }
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `text` as a function computes the label from the whole row instead of one fixed field. */
export const DynamicText: Story = {
	args: {
		markers: [
			{
				type: 'text',
				data: POINTS,
				x: 'x',
				y: 'y',
				text: (d: { x: number; y: number }) => `(${d.x}, ${d.y})`
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `styles` (a `FontStyle`) sets color/size/weight and nudges the label off its own point via `dy`. */
export const CustomStyle: Story = {
	args: {
		markers: [
			{
				type: 'text',
				data: POINTS,
				x: 'x',
				y: 'y',
				text: 'label',
				styles: { fill: '#7c3aed', fontSize: 16, fontWeight: 'bold', dy: -14 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
