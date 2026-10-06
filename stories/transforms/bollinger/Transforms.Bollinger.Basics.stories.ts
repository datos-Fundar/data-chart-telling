import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { DAILY_TEMPERATURE, BUENOS_AIRES_TEMPERATURE } from '../../data/daily-temperature';
import { GOOGL_AUGUST_2026 } from '../../data/stockPrices';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `bollingerY` transform turns a marker's rows into Bollinger bands: a moving
// mean over `n` rows as `y`, and a band `k` standard deviations either side of
// it as `y1`/`y2`. An `area` draws the band, a `line` the mean. The `bollinger`
// marker and statistic draw both at once; the transform lets each part be its
// own marker, styled and layered freely. `bollingerX` does the same on `x`.

const meta = {
	title: 'Transforms/Bollinger/Basics',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420,
		data: [],
		x: 'x',
		y: 'y',
		scales: {
			x: { type: 'time', tickFormat: { month: 'short' } },
			y: { label: 'Temperature (°C)' }
		}
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

/** The band (an `area`), the mean (a `line`) and the raw readings (`dot`s), each from the same rows and options. */
const bands = (
	data: Record<string, unknown>[],
	options: { n?: number; k?: number },
	color: string,
	x = 'date',
	y = 'temp'
): AxisBasedMarkersConfig[] => [
	{
		type: 'area',
		data,
		x,
		y,
		transforms: [{ type: 'bollingerY', ...options }],
		styles: { fill: color, fillOpacity: 0.18 }
	},
	{
		type: 'dot',
		data,
		x,
		y,
		styles: { dotRadius: 2, dotFill: '#64748b', dotFillOpacity: 0.6, dotStroke: 'none' }
	},
	{
		type: 'line',
		data,
		x,
		y,
		transforms: [{ type: 'bollingerY', ...options }],
		styles: { stroke: color, strokeWidth: 2 }
	}
];

// ── Stories ───────────────────────────────────────────────────────────────────

/** The defaults, `n: 20` and `k: 2`: a 20-day mean, and a band two standard deviations wide around it. */
export const Default: Story = {
	args: { markers: bands(BUENOS_AIRES_TEMPERATURE, {}, '#2563eb') }
};

/** `n: 60` averages over two months: a smoother mean, and a band that widens where the weather is changeable. */
export const LongWindow: Story = {
	args: { markers: bands(BUENOS_AIRES_TEMPERATURE, { n: 60 }, '#7c3aed') }
};

/** `k: 1`: a band one standard deviation wide, which about two days in three fall inside. */
export const NarrowBand: Story = {
	args: { markers: bands(BUENOS_AIRES_TEMPERATURE, { k: 1 }, '#0d9488') }
};

/**
 * With `grouping`, every group gets its own bands, from its own rows only, and
 * a `color` on the band colors each one.
 */
export const ByGroup: Story = {
	args: {
		markers: [
			{
				type: 'area',
				data: DAILY_TEMPERATURE,
				x: 'date',
				y: 'temp',
				grouping: 'city',
				color: 'city',
				transforms: [{ type: 'bollingerY', n: 30 }],
				styles: { fillOpacity: 0.3 }
			},
			{
				type: 'line',
				data: DAILY_TEMPERATURE,
				x: 'date',
				y: 'temp',
				grouping: 'city',
				transforms: [{ type: 'bollingerY', n: 30 }],
				styles: { stroke: '#111827', strokeWidth: 1.5 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** On a month of daily closing prices, a 5-day band: wide through the early-August drop, narrowing as the price settles. */
export const StockPrices: Story = {
	args: {
		scales: {
			x: { type: 'time', tickFormat: { month: 'short', day: 'numeric' } },
			y: { label: 'GOOGL close (USD)' }
		},
		markers: bands(
			GOOGL_AUGUST_2026.map((d) => ({ ...d, date: new Date(d.date) })),
			{ n: 5 },
			'#ea580c',
			'date',
			'close'
		)
	}
};
