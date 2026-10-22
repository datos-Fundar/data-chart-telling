import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { MarkerTransform } from '$lib/types/transforms';
import { PENGUIN_COUNTS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `stackMosaicX` lays out a mosaic (Marimekko) chart: each `x` category gets a
// column as wide as its total `value`, split along `y` by its inner categories,
// each cell as tall as its share of the column. Both axes then carry the
// running totals, and every cell's `x1`/`x2`/`y1`/`y2` go to a `rect`.
// `stackMosaicY` swaps the axes. `percentX`/`percentY` turn either axis into
// fractions of the whole. `x`, `y` and `value` are field keys.

/** The penguins of each species on each island; a species missing from an island leaves no cell. */
const PENGUINS = PENGUIN_COUNTS.filter((d) => d.count > 0);

const meta = {
	title: 'Transforms/Stack/Mosaic',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: [],
		x: 'x',
		y: 'y',
		scales: { x: { label: 'Penguins, by island' }, y: { label: 'Penguins, by species' } }
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

/** The mosaic's cells, colored by species, each labelled with its count - short enough to fit even the narrowest cell. */
const mosaic = (transform: MarkerTransform): AxisBasedMarkersConfig[] => [
	{
		type: 'rect',
		data: PENGUINS,
		x: 'island',
		y: 'species',
		color: 'species',
		transforms: [transform],
		insetRight: 1,
		insetBottom: 1
	},
	{
		type: 'text',
		data: PENGUINS,
		x: 'island',
		y: 'species',
		text: (d: { count: number }) => String(d.count),
		transforms: [transform],
		styles: { fontSize: 10, fill: 'white' }
	}
];

// ── Stories ───────────────────────────────────────────────────────────────────

/** Columns by island - Biscoe, Dream, Torgersen, left to right - each as wide as its penguins; within each one, the species' shares. */
export const MosaicX: Story = {
	args: { markers: mosaic({ type: 'stackMosaicX', value: 'count' }) }
};

/** `percentX` and `percentY`: both axes as fractions of the whole - island shares along `x`, species shares within each island along `y`. */
export const Percent: Story = {
	args: {
		scales: {
			x: { label: 'Share of penguins', tickFormat: { style: 'percent' } },
			y: { label: 'Share of the island', tickFormat: { style: 'percent' } }
		},
		markers: mosaic({ type: 'stackMosaicX', value: 'count', percentX: true, percentY: true })
	}
};

/** `stackMosaicY`: rows by island instead - Biscoe at the bottom, Torgersen at the top - each as tall as its penguins, split along `x` by species. */
export const MosaicY: Story = {
	args: {
		scales: { x: { label: 'Penguins, by species' }, y: { label: 'Penguins, by island' } },
		markers: mosaic({ type: 'stackMosaicY', value: 'count' }).map((marker) => ({
			...marker,
			x: 'species',
			y: 'island'
		}))
	}
};
