import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { MEASUREMENTS } from '../../data/measurements';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `densityX` transform replaces a marker's rows with a kernel density estimate
// of their `x` values: a smooth curve whose height is how densely the values
// fall around each point. The rows it hands the marker are points along `x`,
// with the density as `y`, so an `area` or `line` draws the curve as-is.
// `densityY` estimates over `y` and puts the density on `x`. Demoed on an empty
// `LinePlot` canvas so only the marker is on screen.

const meta = {
	title: 'Transforms/Density/Basics',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420,
		data: [],
		x: 'x',
		y: 'y',
		scales: { y: { label: 'Density' } }
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

/** `densityX` on an `area`: the estimate of every `value`, drawn from zero up to its density. */
export const Area: Story = {
	args: {
		markers: [
			{
				type: 'area',
				data: MEASUREMENTS,
				x: 'value',
				transforms: [{ type: 'densityX' }],
				styles: { fill: '#2563eb', fillOpacity: 0.35 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** The same estimate on a `line` over the `area`: the transform runs once per marker, so each one gets the same curve. */
export const AreaWithOutline: Story = {
	args: {
		markers: [
			{
				type: 'area',
				data: MEASUREMENTS,
				x: 'value',
				transforms: [{ type: 'densityX' }],
				styles: { fill: '#2563eb', fillOpacity: 0.2 }
			},
			{
				type: 'line',
				data: MEASUREMENTS,
				x: 'value',
				transforms: [{ type: 'densityX' }],
				styles: { stroke: '#1e3a8a', strokeWidth: 2 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `grouping` splits the estimate: one curve per `group`, each from its own rows, colored by `color`. */
export const ByGroup: Story = {
	args: {
		markers: [
			{
				type: 'area',
				data: MEASUREMENTS,
				x: 'value',
				grouping: 'group',
				color: 'group',
				transforms: [{ type: 'densityX' }],
				styles: { fillOpacity: 0.45 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `densityY` estimates over `y` instead, so the curve runs up the plot, its density on `x` - one `line` per `grouping`, colored by `color`. */
export const DensityY: Story = {
	args: {
		scales: { x: { label: 'Density' } },
		markers: [
			{
				type: 'line',
				data: MEASUREMENTS,
				y: 'value',
				grouping: 'group',
				color: 'group',
				transforms: [{ type: 'densityY' }],
				styles: { strokeWidth: 2 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
