import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { FEMALE_LIFE, LIFE } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

// Delta annotations are a `'delta'` marker, LinePlot's own kind-specific
// marker kind: `data` (the plot's own resolved series) is supplied
// automatically, so a delta marker only ever needs its own config fields.

const meta = {
	title: 'Plots/Evolution/LinePlot/Markers/Deltas',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		scales: { x: { nice: false } }
	},
	argTypes: {
		width: {
			description: 'Plot width in pixels.',
			control: { type: 'range', min: 300, max: 940, step: 50 }
		},
		height: {
			description: 'Plot height in pixels.',
			control: { type: 'range', min: 200, max: 700, step: 50 }
		},
		series: {
			description: 'Data series to render.',
			control: false,
			table: { type: { summary: 'Series<TData>[]' }, category: 'Data' }
		},
		markers: {
			description: 'Marker annotations.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── X-axis deltas ─────────────────────────────────────────────────────────────

/**
 * Vertical delta line between two series at a given X position.
 */
export const XDeltaBetweenTwoSeries: Story = {
	args: {
		data: LIFE,
		x: 'year',
		y: 'value',
		color: 'sex',
		markers: [
			{
				type: 'delta',
				axis: 'x',
				at: 2009,
				from: { type: 'series', series: 'female' },
				to: { type: 'series', series: 'male' },
				line: { stroke: 'grey', strokeDasharray: '6 6' },
				formatDiff: (d) => d.toFixed(0),
				text: { dx: 12, lineAnchor: 'middle' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Delta from a series down to the Y=0 baseline (no `to` target).
 * Useful for labelling the absolute value of a series at a point.
 */
export const XDeltaToBaseline: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE
			}
		],
		markers: [
			{
				type: 'delta',
				yDomain: [60, 85],
				axis: 'x',
				at: 2009,
				from: { type: 'series', series: 'female' },
				text: { dx: 20, lineAnchor: 'middle' }
			}
		] satisfies AxisBasedMarkersConfig[],
		scales: {
			x: { nice: false },
			y: { domain: [60, 85] }
		}
	}
};

/**
 * Delta to an explicit axis threshold (e.g. a policy target at y=70).
 */
export const XDeltaToAxisValue: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE
			}
		],
		markers: [
			{
				type: 'delta',
				axis: 'x',
				at: 2009,
				from: { type: 'series', series: 'female' },
				to: { type: 'axis', value: 70 },
				text: { dx: 20, lineAnchor: 'middle' }
			},
			{
				type: 'rule',
				axis: 'y',
				value: 70,
				styles: { stroke: 'grey', strokeDasharray: '6 6' }
			}
		] satisfies AxisBasedMarkersConfig[],
		scales: {
			x: { nice: false },
			y: { domain: [60, 85] }
		}
	}
};

/**
 * Multiple X delta annotations on the same chart at different years.
 */
export const MultipleXDeltas: Story = {
	args: {
		data: LIFE,
		x: 'year',
		y: 'value',
		color: 'sex',
		markers: [
			{
				type: 'delta',
				axis: 'x',
				at: 2019,
				from: { type: 'series', series: 'female' },
				to: { type: 'series', series: 'male' },
				formatDiff: (d) => d.toFixed(0),
				text: { dx: -12, lineAnchor: 'middle' }
			},
			{
				type: 'delta',
				axis: 'x',
				at: 1947,
				from: { type: 'series', series: 'female' },
				to: { type: 'series', series: 'male' },
				formatDiff: (d) => d.toFixed(0),
				text: { dx: 12, lineAnchor: 'middle' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

// ── Y-axis deltas ─────────────────────────────────────────────────────────────

/**
 * Horizontal delta between two series at a given Y value.
 * Shows the distance between male and female life expectancy at a given Y value.
 */
export const YDeltaBetweenTwoSeries: Story = {
	args: {
		data: LIFE,
		x: 'year',
		y: 'value',
		color: 'sex',
		markers: [
			{
				type: 'delta',
				axis: 'y',
				at: 70,
				from: { type: 'series', series: 'female' },
				to: { type: 'series', series: 'male' },
				formatDiff: (d) => `${d.toFixed(1)} yr`,
				text: { dy: -10, lineAnchor: 'middle' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Horizontal delta from a series down to the x=0 baseline (no `to` target).
 * Shows the distance from the x=0 baseline at a given Y value.
 * `scales.x.domain` keeps the axis tight around the data; the line is clamped
 * to the domain edge visually, but the label still shows the true distance from x=0.
 */
export const YDeltaToBaseline: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE
			}
		],
		markers: [
			{
				type: 'delta',
				xDomain: [1947, 1990],
				axis: 'y',
				at: 75,
				from: { type: 'series', series: 'female' },
				formatDiff: (d) => `${d.toFixed(1)} yr`,
				text: { dy: -10, lineAnchor: 'middle' }
			}
		] satisfies AxisBasedMarkersConfig[],
		scales: { x: { domain: [1947, 2019] } }
	}
};

/**
 * Horizontal delta from a series point to an explicit X axis value.
 * Shows the distance from a series point to a target X axis value.
 */
export const YDeltaToAxisValue: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE
			}
		],
		markers: [
			{
				type: 'delta',
				axis: 'y',
				at: 75,
				from: { type: 'series', series: 'female' },
				to: { type: 'axis', value: 2010 },
				line: { strokeDasharray: '6 4' },
				formatDiff: (d) => `${d.toFixed(1)} yr`,
				text: { dy: -10, lineAnchor: 'middle' }
			},
			{
				type: 'rule',
				axis: 'x',
				value: 2010,
				styles: { stroke: 'grey', strokeDasharray: '6 6' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Multiple Y delta annotations at different Y values on the same chart.
 */
export const MultipleYDeltas: Story = {
	args: {
		data: LIFE,
		x: 'year',
		y: 'value',
		color: 'sex',
		markers: [
			{
				type: 'delta',
				axis: 'y',
				at: 70,
				from: { type: 'series', series: 'female' },
				to: { type: 'series', series: 'male' },
				formatDiff: (d) => `${d.toFixed(1)} yr`,
				text: { dy: -10, lineAnchor: 'middle' }
			},
			{
				type: 'delta',
				axis: 'y',
				at: 72,
				from: { type: 'series', series: 'female' },
				to: { type: 'series', series: 'male' },
				formatDiff: (d) => `${d.toFixed(1)} yr`,
				text: { dy: -10, lineAnchor: 'middle' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
