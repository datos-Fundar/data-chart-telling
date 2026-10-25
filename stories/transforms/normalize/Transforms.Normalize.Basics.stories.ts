import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { GOOGL_AUGUST_2026, AMZN_AUGUST_2026 } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `normalizeY` transform divides each group's `y` values by a `basis` of the
// group's own: its first value, its mean, its sum… so groups on very different
// scales share one axis. As a plot's own `transforms`, every series is a group:
// here two stocks, each about 100 dollars apart, compared by how they moved.

type Close = { date: Date; ticker: string; close: number };

/** Both stocks' daily closes, one row per ticker per day. */
const CLOSES: Close[] = [
	...GOOGL_AUGUST_2026.map((d) => ({ date: d.date, ticker: 'GOOGL', close: d.close })),
	...AMZN_AUGUST_2026.map((d) => ({ date: d.date, ticker: 'AMZN', close: d.close }))
];

const meta = {
	title: 'Transforms/Normalize/Basics',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420,
		data: CLOSES,
		x: 'date',
		y: 'close',
		color: 'ticker'
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		color: { control: false },
		transforms: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** No transform: the prices themselves. The gap between the stocks dwarfs how each one moved. */
export const Raw: Story = {
	args: { scales: { y: { label: 'Close (USD)' } } }
};

/** `basis: 'first'`, the default: each stock indexed to its first close, so both start at 1 and read as growth since then. */
export const IndexToFirst: Story = {
	args: {
		transforms: [{ type: 'normalizeY' }],
		scales: {
			y: {
				label: 'Close ÷ first close',
				tickFormat: { minimumFractionDigits: 2, maximumFractionDigits: 2 }
			}
		}
	}
};

/** `basis: 'mean'`: each stock relative to its own monthly average - above 1, a better-than-average day. */
export const Mean: Story = {
	args: {
		transforms: [{ type: 'normalizeY', basis: 'mean' }],
		scales: {
			y: {
				label: 'Close ÷ mean close',
				tickFormat: { minimumFractionDigits: 2, maximumFractionDigits: 2 }
			}
		}
	}
};

/** `basis: 'extent'` stretches each stock between its own low (0) and high (1): only the shape of the month remains. */
export const Extent: Story = {
	args: {
		transforms: [{ type: 'normalizeY', basis: 'extent' }],
		scales: { y: { label: 'Position in the month’s range' } }
	}
};

/** `basis: 'deviation'`: z-scores, each close in standard deviations from its stock's mean. */
export const Deviation: Story = {
	args: {
		transforms: [{ type: 'normalizeY', basis: 'deviation' }],
		scales: { y: { label: 'Std. deviations from mean' } }
	}
};

/** A function basis: here each stock relative to its last close, so both end at 1. */
export const CustomBasis: Story = {
	args: {
		transforms: [
			{
				type: 'normalizeY',
				basis: (index: number[], values: number[]) => values[index[index.length - 1]]
			}
		],
		scales: {
			y: {
				label: 'Close ÷ last close',
				tickFormat: { minimumFractionDigits: 2, maximumFractionDigits: 2 }
			}
		}
	}
};

/**
 * On markers of their own, over an empty plot: a `line` normalized per
 * `grouping` and colored per ticker, and a `text` that runs the same `normalizeY` and then
 * `selectLast`, so each label sits on its stock's last normalized close.
 */
export const OnMarkers: Story = {
	args: {
		data: [],
		color: undefined,
		scales: {
			x: { type: 'time', tickFormat: { month: 'short', day: 'numeric' }, nice: false },
			y: {
				label: 'Close ÷ first close',
				tickFormat: { minimumFractionDigits: 2, maximumFractionDigits: 2 }
			}
		},
		markers: [
			{
				type: 'line',
				data: CLOSES,
				x: 'date',
				y: 'close',
				grouping: 'ticker',
				color: 'ticker',
				transforms: [{ type: 'normalizeY' }],
				styles: { strokeWidth: 2 }
			},
			{
				type: 'text',
				data: CLOSES,
				x: 'date',
				y: 'close',
				grouping: 'ticker',
				text: (d: Close) => d.ticker,
				transforms: [{ type: 'normalizeY' }, { type: 'selectLast' }],
				styles: { textAnchor: 'start', dx: 6, fontWeight: 'bold' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
