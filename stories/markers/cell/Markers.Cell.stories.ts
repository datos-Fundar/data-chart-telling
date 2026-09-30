import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `cell` marker (svelteplot's own `Cell`) — one rectangle per row of its
// own `data`, positioned on a categorical `x`/`y` band each, like a heatmap's
// own cells. `fill` is required and always a function (per-row), unlike
// `bar`'s `styles.fill`. Demoed on an empty `LinePlot` canvas with two
// categorical axes so the grid has real bands to sit in — see
// `Plots/HeatmapPlot` for a whole plot built from this same mark.

const meta = {
	title: 'Markers/Cell',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: [],
		x: 'col',
		y: 'row',
		scales: { x: { domain: ['Mon', 'Tue', 'Wed'] }, y: { domain: ['AM', 'PM'] } }
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

const CELLS = [
	{ col: 'Mon', row: 'AM', value: 3 },
	{ col: 'Tue', row: 'AM', value: 7 },
	{ col: 'Wed', row: 'AM', value: 5 },
	{ col: 'Mon', row: 'PM', value: 8 },
	{ col: 'Tue', row: 'PM', value: 2 },
	{ col: 'Wed', row: 'PM', value: 6 }
];

const colorFor = (value: number) => (value > 5 ? '#7c3aed' : '#ddd6fe');

/** `fill` reads each row's own `value` and returns a color — no plot-level color channel involved. */
export const Basic: Story = {
	args: {
		markers: [
			{
				type: 'cell',
				data: CELLS,
				x: 'col',
				y: 'row',
				fill: (d: { value: number }) => colorFor(d.value)
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `inset` (pixels) shrinks each cell from its own band edges; `styles.borderRadius` rounds the corners. */
export const CustomStyle: Story = {
	args: {
		markers: [
			{
				type: 'cell',
				data: CELLS,
				x: 'col',
				y: 'row',
				fill: (d: { value: number }) => colorFor(d.value),
				inset: 4,
				styles: { stroke: '#4c1d95', strokeWidth: 1, borderRadius: 6 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
