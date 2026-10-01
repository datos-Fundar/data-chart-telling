import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `difference` marker (svelteplot's own `DifferenceY`) — shaded area
// between two series, colored by which one is on top at each point. No
// `isHorizontal`: svelteplot ships only `DifferenceY`, so this always
// compares two `y` series over a shared `x`. Hosted on a `LinePlot` with the
// same rows as its own series, so the host and the marker share one scale.
// The demo series cross twice, so both bands (and the switch between them) show.

/** Actual vs. target output per year — actual starts below target, overtakes it, then falls back under. */
const COMPARISON = [
	{ year: 2008, actual: 72.0, target: 74.0 },
	{ year: 2009, actual: 73.2, target: 74.6 },
	{ year: 2010, actual: 75.4, target: 75.2 },
	{ year: 2011, actual: 77.6, target: 75.8 },
	{ year: 2012, actual: 79.1, target: 76.4 },
	{ year: 2013, actual: 80.0, target: 77.0 },
	{ year: 2014, actual: 79.4, target: 77.6 },
	{ year: 2015, actual: 78.0, target: 78.2 },
	{ year: 2016, actual: 76.6, target: 78.8 },
	{ year: 2017, actual: 75.9, target: 79.4 },
	{ year: 2018, actual: 76.8, target: 80.0 },
	{ year: 2019, actual: 78.9, target: 80.6 },
	{ year: 2020, actual: 81.4, target: 81.2 }
];

const meta = {
	title: 'Markers/Difference',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: COMPARISON,
		x: 'year',
		y: 'actual',
		scales: { y: { domain: [70, 84] } }
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

/** Actual (`y1`) vs. target (`y2`) — red where actual is above target, blue where it falls below; the two bands meet where the series cross. */
export const Basic: Story = {
	args: {
		markers: [
			{
				type: 'difference',
				x: 'year',
				y1: 'actual',
				y2: 'target'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** Custom fill colors for the positive/negative bands, instead of svelteplot's blue/red defaults. */
export const CustomColors: Story = {
	args: {
		markers: [
			{
				type: 'difference',
				x: 'year',
				y1: 'actual',
				y2: 'target',
				positiveFill: '#0ea5e9',
				negativeFill: '#f97316',
				positiveFillOpacity: 0.5,
				negativeFillOpacity: 0.5
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
