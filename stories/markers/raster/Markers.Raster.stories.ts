import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES } from '../../plots/scatter/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `raster` marker (svelteplot's own `Raster`) — a field painted over a
// rectangle onto a canvas. Three modes, picked by what is set: scattered
// rows (`x`/`y`/`fill`, interpolated per `interpolate`), or a sampler
// (`data: []` with `fill` as an `(x, y) => value` function and `x1`/`x2`/
// `y1`/`y2` bounding the rectangle). Colors come from svelteplot's own color
// scale, forwarded as-is — configure it via the plot's `scales.color`.

const meta = {
	title: 'Markers/Raster',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: COUNTRIES,
		x: 'gdpPerCapita',
		y: 'lifeExpectancy'
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Scatter mode: life expectancy interpolated between the countries (nearest neighbour). */
export const InterpolatedPoints: Story = {
	args: {
		markers: [
			{
				type: 'raster',
				x: 'gdpPerCapita',
				y: 'lifeExpectancy',
				fill: 'population',
				interpolate: 'nearest',
				fillOpacity: 0.7
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** Same, smoothed with `blur` and a coarser `pixelSize`. */
export const BlurredPoints: Story = {
	args: {
		markers: [
			{
				type: 'raster',
				x: 'gdpPerCapita',
				y: 'lifeExpectancy',
				fill: 'population',
				interpolate: 'nearest',
				pixelSize: 4,
				blur: 4
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** Sampler mode: `data: []` and `fill` as an `(x, y) => value` function over explicit bounds. */
export const Sampler: Story = {
	args: {
		data: [],
		x: 'x',
		y: 'y',
		scales: { x: { domain: [0, 10] }, y: { domain: [0, 10] } },
		markers: [
			{
				type: 'raster',
				data: [],
				x1: 0,
				x2: 10,
				y1: 0,
				y2: 10,
				fill: (x: number, y: number) => Math.sin(x) * Math.cos(y)
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
