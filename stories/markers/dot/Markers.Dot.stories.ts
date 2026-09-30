import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `dot` marker (svelteplot's own `Dot`) — one point mark per row of its own
// `data`, independent of any plot series. Demoed on an empty `LinePlot`
// canvas (no data of its own, just an explicit `scales` domain) so only the
// marker itself is on screen — see `Plots/*/Markers` for markers used
// alongside real chart data.

const meta = {
	title: 'Markers/Dot',
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
	{ x: 2, y: 3 },
	{ x: 5, y: 7 },
	{ x: 8, y: 4 }
];

/** `data` drives one dot per row; `x`/`y` are field-key accessors, `r` a fixed radius. */
export const Basic: Story = {
	args: {
		markers: [
			{ type: 'dot', data: POINTS, x: 'x', y: 'y', r: 8 }
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `symbol` varies the point shape per row, cycling svelteplot's own default shape sequence. */
export const Symbols: Story = {
	args: {
		markers: [
			{
				type: 'dot',
				data: [
					{ x: 2, y: 3, kind: 'a' },
					{ x: 5, y: 7, kind: 'b' },
					{ x: 8, y: 4, kind: 'c' }
				],
				x: 'x',
				y: 'y',
				r: 10,
				symbol: 'kind',
				styles: { dotFill: '#7c3aed' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `styles` fixes fill/stroke for every row, overriding the plot's own default color. */
export const CustomStyle: Story = {
	args: {
		markers: [
			{
				type: 'dot',
				data: POINTS,
				x: 'x',
				y: 'y',
				r: 10,
				styles: { dotFill: '#7c3aed', dotStroke: '#4c1d95', dotStrokeWidth: 2 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
