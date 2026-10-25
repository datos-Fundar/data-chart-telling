import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { MarkerTransform } from '$lib/types/transforms';
import { IRIS_LONG, IRIS_METRICS, type IrisMetricRow } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `normalizeParallelY` is `normalizeY` for parallel coordinates: every `x`
// category is an axis of its own, normalized on its own, while `grouping` still
// joins one record's values into one line. Without it, the metric with the largest
// values (sepal length) flattens the smallest (petal width) against the bottom of
// the plot.

const meta = {
	title: 'Transforms/Normalize/Parallel coordinates',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420,
		data: [],
		x: 'x',
		y: 'y',
		// The axes in the rows' own order, so each line visits them left to right.
		scales: { x: { domain: [...IRIS_METRICS] } }
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

/** One flower of each species gets a label, so the plot stays readable. */
const LABELLED = new Set(['Flower 1', 'Flower 51', 'Flower 101']);

/** One line per flower across the measurement axes, and a dot per value colored by species, both run through `transforms`. */
const parallel = (transforms?: MarkerTransform[]): AxisBasedMarkersConfig[] => [
	{
		type: 'line',
		data: IRIS_LONG,
		x: 'metric',
		y: 'value',
		grouping: 'flower',
		transforms,
		styles: { stroke: '#94a3b8', strokeWidth: 1, strokeOpacity: 0.4 }
	},
	{
		type: 'dot',
		data: IRIS_LONG,
		x: 'metric',
		y: 'value',
		grouping: 'flower',
		color: 'species',
		transforms,
		styles: { dotRadius: 2.5, dotFillOpacity: 0.6 }
	}
];

/** No transform: sepal length, up to 7.9 cm, sets the scale, and petal width, under 2.5 cm, sits flat near the bottom. */
export const Raw: Story = {
	args: {
		markers: parallel(undefined),
		scales: { x: { domain: [...IRIS_METRICS] }, y: { label: 'Centimeters' } }
	}
};

/** `basis: 'extent'`: every measurement spans 0-1 between its own lowest and highest flower, so the lines show which species are small or large on each axis. */
export const Extent: Story = {
	args: {
		markers: parallel([{ type: 'normalizeParallelY', basis: 'extent' }]),
		scales: { x: { domain: [...IRIS_METRICS] }, y: { label: 'Within each metric’s range' } }
	}
};

/** `basis: 'deviation'`: every measurement in standard deviations from its own mean - how unusual each flower is, measurement by measurement. */
export const Deviation: Story = {
	args: {
		markers: parallel([{ type: 'normalizeParallelY', basis: 'deviation' }]),
		scales: { x: { domain: [...IRIS_METRICS] }, y: { label: 'Std. deviations from mean' } }
	}
};

/** A labelled end: a `text` with `selectLast` names a flower of each species at its last axis. */
export const WithLabels: Story = {
	args: {
		scales: { x: { domain: [...IRIS_METRICS] }, y: { label: 'Within each metric’s range' } },
		markers: [
			...parallel([{ type: 'normalizeParallelY', basis: 'extent' }]),
			{
				type: 'text',
				data: IRIS_LONG,
				x: 'metric',
				y: 'value',
				grouping: 'flower',
				text: (d: IrisMetricRow) => d.flower,
				transforms: [
					{ type: 'normalizeParallelY', basis: 'extent' },
					{ type: 'selectLast' },
					{ type: 'filter', filter: (d: IrisMetricRow) => LABELLED.has(d.flower) }
				],
				styles: { textAnchor: 'start', dx: 10, fontSize: 11 }
			}
		]
	}
};
