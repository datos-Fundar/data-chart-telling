import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { MarkerTransform } from '$lib/types/transforms';
import { CAR_SPECS, METRIC_ORDER, type CarSpec } from '../../data/car-specs';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `normalizeParallelY` is `normalizeY` for parallel coordinates: every `x`
// category is an axis of its own, normalized on its own, while `grouping` still
// joins one record's values into one line. Without it, a metric in the thousands
// (weight) flattens every other one against the bottom of the plot.

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
		scales: { x: { domain: [...METRIC_ORDER] } }
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

/** One line per model across the metric axes, and a dot per value colored by segment, both run through `transforms`. */
const parallel = (transforms?: MarkerTransform[]): AxisBasedMarkersConfig[] => [
	{
		type: 'line',
		data: CAR_SPECS,
		x: 'metric',
		y: 'value',
		grouping: 'model',
		transforms,
		styles: { stroke: '#94a3b8', strokeWidth: 1.5 }
	},
	{
		type: 'dot',
		data: CAR_SPECS,
		x: 'metric',
		y: 'value',
		grouping: 'model',
		color: 'segment',
		transforms,
		styles: { dotRadius: 5 }
	}
];

/** No transform: weight, in kilograms, sets the scale, and power, economy and price all sit near zero. */
export const Raw: Story = {
	args: {
		markers: parallel(undefined),
		scales: { x: { domain: [...METRIC_ORDER] }, y: { label: 'Value' } }
	}
};

/** `basis: 'extent'`: every metric spans 0-1 between its own lowest and highest model, so the lines cross where models trade off. */
export const Extent: Story = {
	args: {
		markers: parallel([{ type: 'normalizeParallelY', basis: 'extent' }]),
		scales: { x: { domain: [...METRIC_ORDER] }, y: { label: 'Within each metric’s range' } }
	}
};

/** `basis: 'deviation'`: every metric in standard deviations from its own mean - how unusual each model is, metric by metric. */
export const Deviation: Story = {
	args: {
		markers: parallel([{ type: 'normalizeParallelY', basis: 'deviation' }]),
		scales: { x: { domain: [...METRIC_ORDER] }, y: { label: 'Std. deviations from mean' } }
	}
};

/** A labelled end: a `text` with `selectLast` names each model at its last axis. */
export const WithLabels: Story = {
	args: {
		scales: { x: { domain: [...METRIC_ORDER] }, y: { label: 'Within each metric’s range' } },
		markers: [
			...parallel([{ type: 'normalizeParallelY', basis: 'extent' }]),
			{
				type: 'text',
				data: CAR_SPECS,
				x: 'metric',
				y: 'value',
				grouping: 'model',
				text: (d: CarSpec) => d.model,
				transforms: [{ type: 'normalizeParallelY', basis: 'extent' }, { type: 'selectLast' }],
				styles: { textAnchor: 'start', dx: 10, fontSize: 11 }
			}
		]
	}
};
