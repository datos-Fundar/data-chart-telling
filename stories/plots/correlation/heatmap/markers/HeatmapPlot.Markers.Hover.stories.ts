import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { PENGUIN_COUNTS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Correlation/HeatmapPlot/Markers/Hover',
	component: HeatmapPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		series: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'HeatmapPlot' } }
	}
} satisfies Meta<typeof HeatmapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const SERIES = [
	{
		name: 'penguins',
		x: 'island',
		y: 'species',
		color: 'count',
		data: PENGUIN_COUNTS
	}
];

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * The plot's own hover, with a tooltip: the hovered cell outlined, in the configuration's `hover.active`.
 * A cell writes its own value, so the hover draws no crosshair, dot or label - `active` and `others` restyle
 * the cells (see `Layout/Hover/Active and others`).
 */
export const Basic: Story = {
	args: {
		tooltip: true,
		series: SERIES,
		markers: [
			{
				type: 'hover'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Without labels - `front: [{ type: 'dot' }]` drops the hover marker's own
 * value label, the recommended setting for heatmaps specifically: each
 * cell already shows its value permanently, so the hover dot's own label
 * would just duplicate it right next to it.
 */
export const WithoutLabels: Story = {
	args: {
		series: SERIES,
		markers: [{ type: 'hover', front: [{ type: 'dot' }] }] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * No crosshair - `back: []` drops both rules the
 * `'punctual'` strategy implies by default, leaving just the hover dot.
 */
export const WithoutRules: Story = {
	args: {
		series: SERIES,
		markers: [{ type: 'hover', back: [] }] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Row rule only - a single `rule` along `y` in `back` keeps just the horizontal rule,
 * highlighting the hovered cell's species row without the vertical island rule.
 */
export const RowRuleOnly: Story = {
	args: {
		series: SERIES,
		markers: [
			{ type: 'hover', back: [{ type: 'rule', axis: 'y', points: 'active' }] }
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Column rule only - a single `rule` along `x` in `back` keeps just the vertical rule,
 * highlighting the hovered cell's island column without the horizontal species rule.
 */
export const ColumnRuleOnly: Story = {
	args: {
		series: SERIES,
		markers: [
			{ type: 'hover', back: [{ type: 'rule', axis: 'x', points: 'active' }] }
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Custom rule style - the `styles` of a `rule` in `back` set the crosshair stroke. Here the
 * rules render in red with a solid line and higher opacity.
 */
export const WithCustomRuleStyle: Story = {
	args: {
		series: SERIES,
		markers: [
			{
				type: 'hover',
				back: [
					{
						type: 'rule',
						axis: 'x',
						points: 'active',
						styles: {
							stroke: '#e63946',
							strokeOpacity: 0.3,
							strokeWidth: 2,
							strokeDasharray: '6 3'
						}
					},
					{
						type: 'rule',
						axis: 'y',
						points: 'active',
						styles: {
							stroke: '#e63946',
							strokeOpacity: 0.3,
							strokeWidth: 2,
							strokeDasharray: '6 3'
						}
					}
				],
				front: [
					{
						type: 'dot',
						styles: {
							dotFill: '#e63946',
							dotFillOpacity: 0.2,
							dotStrokeOpacity: 1,
							dotRadius: 20
						}
					}
				]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * A `band` along each axis in `back` - since both of a heatmap's axes are band
 * scales, the two translucent bands cross exactly at the hovered cell,
 * highlighting its full row and column at once. Each defaults to the
 * configuration's neutral gray `hover.area`, the width of the cell's band.
 */
export const WithHighlightCross: Story = {
	args: {
		series: SERIES,
		markers: [
			{
				type: 'hover',
				back: [
					{ type: 'band', axis: 'x' },
					{ type: 'band', axis: 'y' },
					{ type: 'rule', axis: 'x', points: 'active' },
					{ type: 'rule', axis: 'y', points: 'active' }
				]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Two series from separate per-species arrays - the unscoped hover marker
 * responds identically whether the grid comes from one combined series or,
 * as here, two merged per-species series (see `TwoSeriesBySpecies` in the Series
 * stories).
 */
export const TwoSeriesBySpecies: Story = {
	args: {
		series: [
			{
				name: 'adelie',
				x: 'island',
				y: 'species',
				color: 'count',
				data: PENGUIN_COUNTS.filter((d) => d.species === 'Adelie')
			},
			{
				name: 'others',
				x: 'island',
				y: 'species',
				color: 'count',
				data: PENGUIN_COUNTS.filter((d) => d.species !== 'Adelie')
			}
		],
		markers: [
			{
				type: 'hover'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Using the data/x/y/color shorthand - equivalent to `Basic`, built without an
 * explicit series array.
 */
export const FromGroupedData: Story = {
	args: {
		data: PENGUIN_COUNTS,
		x: 'island',
		y: 'species',
		color: 'count',
		markers: [
			{
				type: 'hover'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
