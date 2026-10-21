import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { MarkerTransform } from '$lib/types/transforms';
import { GOOGL_AUGUST_2026, type StockDay } from '../../data/stockPrices';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `line` joins its rows in order, so reordering them redraws the path through
// the same points. Here the plot draws each August day's open against its close,
// and one `line` marker over the plot's own rows runs a `sort`: by a field, by
// another channel's value, or by a comparator of two rows.

const meta = {
	title: 'Transforms/Sort/Line order',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420,
		data: GOOGL_AUGUST_2026,
		x: 'open',
		y: 'close',
		scales: { x: { label: 'Open (USD)' }, y: { label: 'Close (USD)' } },
		segments: { default: [{ styles: { dotRadius: 4, dotStroke: 'white' } }] }
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

/** The one `line` every story draws: the plot's own rows (it sets no `data`), through `transforms`. */
const path = (transforms?: MarkerTransform[]): AxisBasedMarkersConfig[] => [
	{
		type: 'line',
		x: 'open',
		y: 'close',
		transforms,
		styles: { stroke: '#94a3b8', strokeWidth: 1.5 }
	}
];

// ── Stories ───────────────────────────────────────────────────────────────────

/** No sort: the rows' own order is by date, so the line is a connected scatterplot that traces the month day by day. */
export const DataOrder: Story = {
	args: { markers: path() }
};

/** `sort: 'open'`: by the open price, the same points become a curve from left to right. */
export const SortByField: Story = {
	args: { markers: path([{ type: 'sort', sort: 'open' }]) }
};

/** `sort: { channel: 'y' }` sorts by another channel's value - here the close, so the path climbs from the bottom up. */
export const SortByChannel: Story = {
	args: { markers: path([{ type: 'sort', sort: { channel: 'y' } }]) }
};

/** A comparator of two rows: by each day's move, close minus open, so the path runs from the worst day to the best. */
export const Comparator: Story = {
	args: {
		markers: path([
			{
				type: 'sort',
				sort: (a: StockDay, b: StockDay) => a.close - a.open - (b.close - b.open)
			}
		])
	}
};
