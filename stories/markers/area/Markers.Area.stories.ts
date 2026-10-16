import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { FEMALE_LIFE_EXPECTANCY, MALE_LIFE_EXPECTANCY } from '../../plots/line/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// An `area` marker (svelteplot's own `AreaX`/`AreaY`) - a filled area under a
// curve, or a band between two curves. Orientation is automatic: `AreaX` when
// `x` is the quantitative axis and `y` a categorical/temporal one (here a
// time scale), `AreaY` otherwise - the config never names "X" or "Y" itself. Hosted on a `LinePlot` with its own
// real series, so the underlying line and the area marker share one scale.

const CONFIDENCE_BAND = FEMALE_LIFE_EXPECTANCY.map((d, i) => ({
	year: d.year,
	low: MALE_LIFE_EXPECTANCY[i].value,
	high: d.value
}));

const meta = {
	title: 'Markers/Area',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: FEMALE_LIFE_EXPECTANCY,
		x: 'year',
		y: 'value',
		scales: { y: { domain: [0, 86] } }
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

/** Default orientation (`AreaY`) - a simple area-under-curve from a single `y` value, implicitly stacked against a zero baseline, filled under the plot's own line. */
export const Basic: Story = {
	args: {
		markers: [
			{
				type: 'area',
				x: 'year',
				y: 'value',
				styles: { fillOpacity: 0.35 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** Explicit `y1`/`y2` draws a band between two curves instead of a curve-to-baseline fill - here, the male-female life-expectancy gap over time. */
export const Band: Story = {
	args: {
		data: CONFIDENCE_BAND,
		y: 'high',
		scales: { y: { label: '↑ Male-Female Life Expectancy' } },
		segments: {
			default: [
				{
					areas: [],
					styles: {
						stroke: { stroke: 'red' }
					}
				}
			]
		},
		markers: [
			{
				type: 'area',
				x: 'year',
				y1: 'low',
				y2: 'high',
				styles: { fillOpacity: 0.25 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** A quantitative `x` with a temporal `y` picks `AreaX` - the same data, filled along the horizontal axis instead. */
export const Horizontal: Story = {
	args: {
		data: FEMALE_LIFE_EXPECTANCY.map((d) => ({ ...d, year: new Date(d.year, 0, 1) })),
		x: 'value',
		y: 'year',
		scales: { x: { domain: [0, 86] }, y: { type: 'time', tickFormat: { year: 'numeric' } } },
		markers: [
			{
				type: 'area',
				x: 'value',
				y: 'year',
				styles: { fill: '#16a34a', fillOpacity: 0.35 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
