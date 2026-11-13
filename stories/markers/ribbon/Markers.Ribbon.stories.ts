import type { Meta, StoryObj } from '@storybook/svelte-vite';
import Plot from '$lib/plots/generic/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `ribbon` marker - a band per row that flows along x from `x1` to `x2`,
// leaving between `y1` and `y2` and arriving between `y3` and `y4`. It is
// what a sankey draws its links with, and what joins one bar to another.
// Demoed on a `Plot` of no data so only the marker itself is on screen.

const meta = {
	title: 'Markers/Ribbon',
	component: Plot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		scales: { x: { domain: [0, 10] }, y: { domain: [0, 10] } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'Plot' } }
	}
} satisfies Meta<typeof Plot>;

export default meta;
type Story = StoryObj<typeof meta>;

const FLOWS = [
	{ from: 1, to: 9, y1: 6, y2: 9, y3: 0, y4: 3, flow: 'north to south' },
	{ from: 1, to: 9, y1: 1, y2: 4, y3: 5, y4: 8, flow: 'south to north' }
];

/**
 * Two ribbons that cross: each keeps its thickness from one end to the other. `color` colors them by a field
 * of their rows, and names each one on the legend.
 */
export const Basic: Story = {
	args: {
		markers: [
			{
				type: 'ribbon',
				data: FLOWS,
				x1: 'from',
				x2: 'to',
				y1: 'y1',
				y2: 'y2',
				y3: 'y3',
				y4: 'y4',
				color: 'flow'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `opacity` fades each ribbon by a number of its row, and the legend shows the range it spans. */
export const Opacity: Story = {
	args: {
		markers: [
			{
				type: 'ribbon',
				data: [
					{ y1: 7, y2: 9, y3: 1, y4: 3, people: 120 },
					{ y1: 4, y2: 6, y3: 4, y4: 6, people: 480 },
					{ y1: 1, y2: 3, y3: 7, y4: 9, people: 900 }
				],
				x1: 1,
				x2: 9,
				y1: 'y1',
				y2: 'y2',
				y3: 'y3',
				y4: 'y4',
				opacity: 'people',
				styles: { fill: '#2563eb' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * A ribbon takes `transforms` as any marker does. `filter` keeps the flows of 400 people or more, and `shiftY`
 * moves what is left up by one, at both ends: a transform that works row by row on y moves `y3`/`y4` with
 * `y1`/`y2`.
 */
export const Transforms: Story = {
	args: {
		markers: [
			{
				type: 'ribbon',
				data: [
					{ y1: 7, y2: 9, y3: 1, y4: 3, people: 120 },
					{ y1: 4, y2: 6, y3: 4, y4: 6, people: 480 },
					{ y1: 0, y2: 2, y3: 6, y4: 8, people: 900 }
				],
				x1: 1,
				x2: 9,
				y1: 'y1',
				y2: 'y2',
				y3: 'y3',
				y4: 'y4',
				transforms: [
					{ type: 'filter', filter: (row) => row.people >= 400 },
					{ type: 'shiftY', by: { y1: 1, y2: 1 } }
				],
				styles: { fill: '#0d9488' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** Without `y3`/`y4` a ribbon arrives at the height it left; with them it can widen or narrow on the way. */
export const Tapered: Story = {
	args: {
		markers: [
			{
				type: 'ribbon',
				data: [{}],
				x1: 1,
				x2: 9,
				y1: 4,
				y2: 6,
				y3: 1,
				y4: 9,
				styles: { fill: '#7c3aed', fillOpacity: 0.4, stroke: '#7c3aed' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `curvature` sets where the edges bend, from a straight band (`0`) to an S that turns at either end (`1`). */
export const Curvature: Story = {
	args: {
		markers: [0, 0.5, 1].map(
			(curvature, index): AxisBasedMarkersConfig => ({
				type: 'ribbon',
				data: [{}],
				x1: 1,
				x2: 9,
				y1: 7 - index * 3,
				y2: 8 - index * 3,
				y3: 9 - index * 3,
				y4: 10 - index * 3,
				curvature,
				styles: { fill: '#0d9488' }
			})
		)
	}
};

/** How many of every 10 work in CABA or GBA, in two years: some of CABA's moved to GBA. */
const SHARES = [
	{ year: '2003', place: 'CABA', low: 0, high: 6 },
	{ year: '2003', place: 'GBA', low: 6, high: 10 },
	{ year: '2025', place: 'CABA', low: 0, high: 4 },
	{ year: '2025', place: 'GBA', low: 4, high: 10 }
];
/**
 * On a band axis a ribbon leaves from the far edge of its start's band and arrives at the near edge of its
 * end's, so it joins the bars on either side. Here each ribbon is part of a 2003 bar that ends in a 2025 one:
 * CABA keeps 4 of its 6, and the other 2 move to GBA. Both markers color by place, so they share the colors;
 * the bars name them on the legend.
 */
export const BetweenBars: Story = {
	args: {
		scales: { x: { type: 'band', domain: ['2003', '2025'], padding: 0.6 }, y: { domain: [0, 10] } },
		markers: [
			{
				type: 'ribbon',
				data: [
					{ from: 'CABA', y1: 0, y2: 4, y3: 0, y4: 4 },
					{ from: 'CABA', y1: 4, y2: 6, y3: 4, y4: 6 },
					{ from: 'GBA', y1: 6, y2: 10, y3: 6, y4: 10 }
				],
				x1: () => '2003',
				x2: () => '2025',
				y1: 'y1',
				y2: 'y2',
				y3: 'y3',
				y4: 'y4',
				color: 'from',
				legend: false,
				styles: { fillOpacity: 0.35 }
			},
			{
				type: 'bar',
				role: 'segment',
				data: SHARES,
				x: 'year',
				y1: 'low',
				y2: 'high',
				color: 'place',
				styles: { stroke: 'white' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
