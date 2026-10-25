import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { DAILY_TEMPERATURE, BUENOS_AIRES_TEMPERATURE, GOOGL_AUGUST_2026 } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `bollingerY` transform turns rows into Bollinger bands: a moving mean over
// `n` rows as `y`, and a band `k` standard deviations either side of it as
// `y1`/`y2`. It only reshapes rows - what is drawn is up to the mark that reads
// them. On the plot, it reshapes the rows of the plot's own dots; on a marker,
// only that marker's: an `area` draws the band from `y1`/`y2`, a `line` the
// mean, each styled and layered freely over the raw readings the plot draws.
// The `bollinger` marker and statistic draw both at once. `bollingerX` does the
// same on `x`.

const meta = {
	title: 'Transforms/Bollinger/Basics',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420,
		data: BUENOS_AIRES_TEMPERATURE,
		x: 'date',
		y: 'temp',
		segments: { default: [{ styles: { dotRadius: 2, dotFillOpacity: 0.6, dotStroke: 'none' } }] },
		scales: {
			x: { type: 'time', tickFormat: { month: 'short' } },
			y: { label: 'Temperature (°C)' }
		}
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false },
		transforms: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The band (an `area`) and the mean (a `line`), both reading the plot's own rows through the same options. */
const bands = (
	options: { n?: number; k?: number },
	color: string,
	y = 'temp'
): AxisBasedMarkersConfig[] => [
	{
		type: 'area',
		x: 'date',
		y,
		transforms: [{ type: 'bollingerY', ...options }],
		styles: { fill: color, fillOpacity: 0.18 }
	},
	{
		type: 'line',
		x: 'date',
		y,
		transforms: [{ type: 'bollingerY', ...options }],
		styles: { stroke: color, strokeWidth: 2 }
	}
];

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * On the plot, `transforms` reshapes the rows its dots draw: each dot moves to the 20-day mean of the
 * readings up to it, and the raw readings are no longer drawn. The band (`y1`/`y2`) goes unused, since a dot has a single `y`.
 */
export const PlotLevel: Story = {
	args: {
		segments: { default: [{ styles: { dotRadius: 3, dotFillOpacity: 0.8, dotStroke: 'none' } }] },
		transforms: [{ type: 'bollingerY' }],
		scales: {
			x: { type: 'time', tickFormat: { month: 'short' } },
			y: { label: 'Temperature (°C)', domain: [5, 30] }
		}
	}
};

/**
 * On a marker, `transforms` reshapes only that marker's rows, so the plot keeps drawing the raw
 * readings. The defaults, `n: 20` and `k: 2`: a 20-day mean, and a band two standard deviations wide around it.
 */
export const MarkerLevel: Story = {
	args: { markers: bands({}, '#2563eb') }
};

/** `n: 60` averages over two months: a smoother mean, and a band that widens where the weather is changeable. */
export const LongWindow: Story = {
	args: { markers: bands({ n: 60 }, '#7c3aed') }
};

/** `k: 1`: a band one standard deviation wide, which about two days in three fall inside. */
export const NarrowBand: Story = {
	args: { markers: bands({ k: 1 }, '#0d9488') }
};

/**
 * With `grouping`, every group gets its own bands, from its own rows only, and
 * a `color` on the band colors each one.
 */
export const ByGroup: Story = {
	args: {
		data: DAILY_TEMPERATURE,
		color: 'city',
		markers: [
			{
				type: 'area',
				x: 'date',
				y: 'temp',
				grouping: 'city',
				color: 'city',
				transforms: [{ type: 'bollingerY', n: 30 }],
				styles: { fillOpacity: 0.3 }
			},
			{
				type: 'line',
				x: 'date',
				y: 'temp',
				grouping: 'city',
				transforms: [{ type: 'bollingerY', n: 30 }]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** On a month of daily closing prices, a 5-day band: wide through the early-August drop, narrowing as the price settles. */
export const StockPrices: Story = {
	args: {
		data: GOOGL_AUGUST_2026,
		y: 'close',
		segments: { default: [{ styles: { dotRadius: 3, dotFillOpacity: 0.7, dotStroke: 'none' } }] },
		scales: {
			x: { type: 'time', tickFormat: { month: 'short', day: 'numeric' } },
			y: { label: 'GOOGL close (USD)' }
		},
		markers: bands({ n: 5 }, '#ea580c', 'close')
	}
};
