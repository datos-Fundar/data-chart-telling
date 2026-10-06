import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { DensityXTransform } from '$lib/types/transforms';
import { MEASUREMENTS, type Measurement } from '../../data/measurements';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The density transforms' options shape the estimate. `kernel` is the bump each
// value adds, and `bandwidth` how wide it is: narrow bumps follow every cluster,
// wide ones blur them into one hill. `trim` stops the curve at the data's own
// extent, `cumulative` turns it into a CDF, and `weight` makes some rows count
// more than others.

const meta = {
	title: 'Transforms/Density/Options',
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

/** One `line` per estimate, each with its own transform options, in its own color. */
const curve = (
	transform: Omit<DensityXTransform, 'type'>,
	stroke: string
): AxisBasedMarkersConfig => ({
	type: 'line',
	data: MEASUREMENTS,
	x: 'value',
	transforms: [{ type: 'densityX', ...transform }],
	styles: { stroke, strokeWidth: 2 }
});

// ── Stories ───────────────────────────────────────────────────────────────────

/** Three kernels at the same `bandwidth`: `uniform` (blue) is boxy, `epanechnikov` (orange) and `gaussian` (green) round it off. */
export const Kernels: Story = {
	args: {
		markers: [
			curve({ kernel: 'uniform', bandwidth: 3 }, '#2563eb'),
			curve({ kernel: 'epanechnikov', bandwidth: 3 }, '#ea580c'),
			curve({ kernel: 'gaussian', bandwidth: 3 }, '#16a34a')
		]
	}
};

/** `bandwidth` 1 (blue) follows every bump in the sample, 3 (orange) shows the two groups, 10 (green) blurs them into one hill. */
export const Bandwidth: Story = {
	args: {
		markers: [
			curve({ bandwidth: 1 }, '#2563eb'),
			curve({ bandwidth: 3 }, '#ea580c'),
			curve({ bandwidth: 10 }, '#16a34a')
		]
	}
};

/** With no `bandwidth`, one is picked from the data by Silverman's rule — a sensible default for one bell-shaped group. */
export const DefaultBandwidth: Story = {
	args: {
		markers: [
			{
				type: 'area',
				data: MEASUREMENTS.filter((d) => d.group === 'A'),
				x: 'value',
				transforms: [{ type: 'densityX' }],
				styles: { fill: '#7c3aed', fillOpacity: 0.35 }
			}
		]
	}
};

/** `trim: true` (orange) stops the curve at the smallest and largest value; untrimmed (blue), it fades out past them. */
export const Trim: Story = {
	args: {
		markers: [
			curve({ bandwidth: 4 }, '#2563eb'),
			{
				type: 'area',
				data: MEASUREMENTS,
				x: 'value',
				transforms: [{ type: 'densityX', bandwidth: 4, trim: true }],
				styles: { fill: '#ea580c', fillOpacity: 0.3 }
			}
		]
	}
};

/** `cumulative: 1` turns each estimate into a CDF: the share of the group at or below each value, climbing from 0 to 1 — one per `grouping`, colored by `color`. */
export const Cumulative: Story = {
	args: {
		scales: { y: { domain: [0, 1], label: 'Share at or below' } },
		markers: [
			{
				type: 'line',
				data: MEASUREMENTS,
				x: 'value',
				grouping: 'group',
				color: 'group',
				transforms: [{ type: 'densityX', cumulative: 1 }],
				styles: { strokeWidth: 2 }
			}
		]
	}
};

/** `weight` makes each row count by its own `weight` (orange): the heavier rows of group B pull the estimate right of the plain count (blue). */
export const Weight: Story = {
	args: {
		markers: [
			curve({ bandwidth: 3 }, '#2563eb'),
			curve({ bandwidth: 3, weight: (d: Measurement) => d.weight ** 2 }, '#ea580c')
		]
	}
};
