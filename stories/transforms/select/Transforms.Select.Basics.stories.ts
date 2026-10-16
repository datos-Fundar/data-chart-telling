import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { DAILY_TEMPERATURE, type DailyTemperature } from '../../data/daily-temperature';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `select` transform keeps one row per group: the first or the last, or the
// one with the lowest or highest `x` or `y`. The shorthands `selectFirst`,
// `selectLast`, `selectMinY`, `selectMaxY`, … say it in the name. On a `text`
// or `dot` marker over the plot's own lines, it labels each series' end or
// marks its peak. Here the plot's own `windowY` smooths each city's year. A
// marker with transforms but no `data` of its own builds on the plot's: it
// starts from the smoothed rows, reads the plot's channels, and runs per series.

const meta = {
	title: 'Transforms/Select/Basics',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420,
		data: DAILY_TEMPERATURE,
		x: 'date',
		y: 'temp',
		color: 'city',
		transforms: [{ type: 'windowY', k: 30 }],
		scales: { y: { label: 'Temperature (°C), 30-day average' } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		transforms: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A marker over the plot's own smoothed rows, `select`ed per city. */
const picked = (
	select: 'selectFirst' | 'selectLast' | 'selectMinY' | 'selectMaxY',
	marker: Partial<AxisBasedMarkersConfig>
): AxisBasedMarkersConfig =>
	({ transforms: [{ type: select }], ...marker }) as AxisBasedMarkersConfig;

// ── Stories ───────────────────────────────────────────────────────────────────

/** `selectLast` on a `text`: each city's name at the end of its own line, in place of a legend. */
export const EndLabels: Story = {
	args: {
		markers: [
			picked('selectLast', {
				type: 'text',
				text: (d: DailyTemperature) => d.city,
				styles: { textAnchor: 'start', dx: 6, fontWeight: 'bold' }
			})
		]
	}
};

/** `selectMaxY` and `selectMinY` on `dot`s and `text`s: each city's warmest and coldest point of the smoothed year, labelled with its date. */
export const Peaks: Story = {
	args: {
		markers: [
			...(['selectMaxY', 'selectMinY'] as const).flatMap((select, i) => [
				picked(select, {
					type: 'dot',
					styles: { dotRadius: 5, dotFill: ['#dc2626', '#2563eb'][i], dotStroke: 'white' }
				}),
				picked(select, {
					type: 'text',
					text: (d: DailyTemperature) =>
						d.date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
					styles: { dy: i === 0 ? -12 : 14, fontSize: 11 }
				})
			])
		]
	}
};

/** `selectFirst` and `selectLast` on `dot`s: where each city's year starts and ends. */
export const FirstAndLast: Story = {
	args: {
		markers: (['selectFirst', 'selectLast'] as const).map((select) =>
			picked(select, {
				type: 'dot',
				styles: { dotRadius: 5, dotFill: 'white', dotStroke: '#111827', dotStrokeWidth: 2 }
			})
		)
	}
};

/**
 * `select` with its criteria spelled out: `{ y: 'min' }` is the same as
 * `selectMinY`. The markers set `y: 'temp'` themselves, so they read each
 * row's raw reading instead of the plot's average: the coldest single day.
 */
export const SelectBy: Story = {
	args: {
		markers: [
			{
				type: 'dot',
				y: 'temp',
				transforms: [{ type: 'select', select: { y: 'min' } }],
				styles: { dotRadius: 5, dotFill: '#2563eb', dotStroke: 'white' }
			},
			{
				type: 'text',
				y: 'temp',
				text: (d: DailyTemperature) => `Coldest day: ${d.temp} °C`,
				transforms: [{ type: 'select', select: { y: 'min' } }],
				styles: { dy: 14, fontSize: 11 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
