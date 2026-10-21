import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { MarkerTransform } from '$lib/types/transforms';
import { REGION_CHANNEL_SALES } from '../../data/market-share';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `stackMosaicX` lays out a mosaic (Marimekko) chart: each `x` category gets a
// column as wide as its total `value`, split along `y` by its inner categories,
// each cell as tall as its share of the column. Both axes then carry the
// running totals, and every cell's `x1`/`x2`/`y1`/`y2` go to a `rect`.
// `stackMosaicY` swaps the axes. `percentX`/`percentY` turn either axis into
// fractions of the whole. `x`, `y` and `value` are field keys.

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
		scales: { x: { label: 'Sales, by region' }, y: { label: 'Sales, by channel' } }
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

/** The mosaic's cells, colored by sales channel, each labelled with its sales - short enough to fit even the narrowest cell. */
const mosaic = (transform: MarkerTransform): AxisBasedMarkersConfig[] => [
	{
		type: 'rect',
		data: REGION_CHANNEL_SALES,
		x: 'region',
		y: 'channel',
		color: 'channel',
		transforms: [transform],
		insetRight: 1,
		insetBottom: 1
	},
	{
		type: 'text',
		data: REGION_CHANNEL_SALES,
		x: 'region',
		y: 'channel',
		text: (d: { sales: number }) => String(d.sales),
		transforms: [transform],
		styles: { fontSize: 10, fill: 'white' }
	}
];

// ── Stories ───────────────────────────────────────────────────────────────────

/** Columns by region - Pampas, Cuyo, Patagonia, Northwest, left to right - each as wide as its sales; within each one, the channels' shares. */
export const MosaicX: Story = {
	args: { markers: mosaic({ type: 'stackMosaicX', value: 'sales' }) }
};

/** `percentX` and `percentY`: both axes as fractions of the whole - region shares along `x`, channel shares within each region along `y`. */
export const Percent: Story = {
	args: {
		scales: {
			x: { label: 'Share of sales', tickFormat: { style: 'percent' } },
			y: { label: 'Share of the region', tickFormat: { style: 'percent' } }
		},
		markers: mosaic({ type: 'stackMosaicX', value: 'sales', percentX: true, percentY: true })
	}
};

/** `stackMosaicY`: rows by region instead - Pampas at the bottom, Northwest at the top - each as tall as its sales, split along `x` by channel. */
export const MosaicY: Story = {
	args: {
		scales: { x: { label: 'Sales, by channel' }, y: { label: 'Sales, by region' } },
		markers: mosaic({ type: 'stackMosaicY', value: 'sales' }).map((marker) => ({
			...marker,
			x: 'channel',
			y: 'region'
		}))
	}
};
