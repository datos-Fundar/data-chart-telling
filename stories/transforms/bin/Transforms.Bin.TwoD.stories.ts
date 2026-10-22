import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { HEIGHTS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `bin` bins on `x` and `y` at once: each output row is one cell of a grid,
// with both its edges, and the reducer goes to a style output. `fill: 'count'`
// on a `rect` is a 2D histogram, colored by how many rows fall in each cell
// (the reducer becomes the marker's `color`); `r: 'count'` on a `dot` sizes a
// bubble at each cell's center instead.

const meta = {
	title: 'Transforms/Bin/2D',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: [],
		x: 'x',
		y: 'y',
		scales: { x: { label: 'Height (cm)' }, y: { label: 'Weight (kg)' } }
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

// ── Stories ───────────────────────────────────────────────────────────────────

/** `fill: 'count'` on a `rect`: a 2D histogram of height against weight, darker where more rows fall. */
export const Heatmap: Story = {
	args: {
		markers: [
			{
				type: 'rect',
				data: HEIGHTS,
				x: 'height',
				y: 'weight',
				transforms: [{ type: 'bin', fill: 'count', thresholds: 15 }]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `interval: 5`: square cells five units wide on both axes, instead of a count of thresholds. */
export const Interval: Story = {
	args: {
		markers: [
			{
				type: 'rect',
				data: HEIGHTS,
				x: 'height',
				y: 'weight',
				transforms: [{ type: 'bin', fill: 'count', interval: 5 }]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `r: 'count'` on a `dot`: the same cells as bubbles, sized by their count, over the raw rows. */
export const Bubbles: Story = {
	args: {
		markers: [
			{
				type: 'dot',
				data: HEIGHTS,
				x: 'height',
				y: 'weight',
				styles: { dotRadius: 1.5, dotFill: '#94a3b8', dotStroke: 'none' }
			},
			{
				type: 'dot',
				data: HEIGHTS,
				x: 'height',
				y: 'weight',
				transforms: [{ type: 'bin', r: 'count', thresholds: 12 }],
				styles: { dotFill: '#2563eb', dotFillOpacity: 0.45, dotStroke: '#1e3a8a' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
