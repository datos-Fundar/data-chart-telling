import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `trail` marker (svelteplot's own `Trail`) - a ribbon along a path whose
// thickness follows `r` (scaled by svelteplot's own `r` scale). `grouping`
// draws one trail per group; `curve`/`tension` smooth the path and `cap` shapes
// the ends. A trail is filled only (no stroke); `color` resolves through this
// package's own `cfg.palette` into `fill`.

const PATHS = [
	{ id: 'north', x: 0, y: 2, w: 1 },
	{ id: 'north', x: 2, y: 4, w: 3 },
	{ id: 'north', x: 4, y: 3, w: 6 },
	{ id: 'north', x: 6, y: 5, w: 4 },
	{ id: 'north', x: 8, y: 4.5, w: 2 },
	{ id: 'south', x: 0, y: 6, w: 2 },
	{ id: 'south', x: 2, y: 7.5, w: 5 },
	{ id: 'south', x: 4, y: 7, w: 8 },
	{ id: 'south', x: 6, y: 8.5, w: 3 },
	{ id: 'south', x: 8, y: 8, w: 1 }
];

const meta = {
	title: 'Markers/Trail',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: [],
		x: 'x',
		y: 'y',
		scales: { x: { domain: [0, 8] }, y: { domain: [0, 10] } }
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

/** One trail, thickness driven by `w`. */
export const Basic: Story = {
	args: {
		markers: [
			{
				type: 'trail',
				data: PATHS.filter((d) => d.id === 'north'),
				x: 'x',
				y: 'y',
				r: 'w'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** The trail's own rows are grouped by `grouping: 'id'` (one trail per id), `color` tints each trail, and `curve` smooths the paths. */
export const GroupedAndSmoothed: Story = {
	args: {
		markers: [
			{
				type: 'trail',
				data: PATHS,
				x: 'x',
				y: 'y',
				r: 'w',
				grouping: 'id',
				color: 'id',
				curve: 'catmull-rom',
				cap: 'round',
				styles: { fillOpacity: 0.7 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
