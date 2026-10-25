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
 * Basic hover marker - a dot appears on the hovered cell as the cursor moves
 * over the plot, along with a full crosshair (both `ruleX` and `ruleY` are
 * implied by the heatmap's `'punctual'` hover strategy) and a value label,
 * on by default like every other plot kind. Since heatmap cells already show
 * their value permanently, the label next to the hover dot duplicates it -
 * see `WithoutLabels` to turn it off. No floating HTML tooltip is involved.
 */
export const Basic: Story = {
	args: {
		series: SERIES,
		markers: [
			{
				type: 'hover'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Without labels - `showLabels: false` turns off the hover marker's own
 * value label, the recommended setting for heatmaps specifically: each
 * cell already shows its value permanently, so the hover dot's own label
 * would just duplicate it right next to it.
 */
export const WithoutLabels: Story = {
	args: {
		series: SERIES,
		markers: [
			{
				type: 'hover',
				showLabels: false
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * No crosshair - `ruleX: false` and `ruleY: false` suppress both rules the
 * `'punctual'` strategy implies by default, leaving just the hover dot.
 */
export const WithoutRules: Story = {
	args: {
		series: SERIES,
		markers: [
			{
				type: 'hover',
				ruleX: false,
				ruleY: false
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Row rule only - `ruleX: false` keeps just the horizontal (`ruleY`) rule,
 * highlighting the hovered cell's species row without the vertical island rule.
 */
export const RowRuleOnly: Story = {
	args: {
		series: SERIES,
		markers: [
			{
				type: 'hover',
				ruleX: false,
				ruleY: true
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Column rule only - `ruleY: false` keeps just the vertical (`ruleX`) rule,
 * highlighting the hovered cell's island column without the horizontal species rule.
 */
export const ColumnRuleOnly: Story = {
	args: {
		series: SERIES,
		markers: [
			{
				type: 'hover',
				ruleX: true,
				ruleY: false
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Custom rule style - `rule` overrides the crosshair stroke. Here the
 * rules render in red with a solid line and higher opacity.
 */
export const WithCustomRuleStyle: Story = {
	args: {
		series: SERIES,
		markers: [
			{
				type: 'hover',
				showLabels: false,
				rule: {
					stroke: '#e63946',
					strokeOpacity: 0.3,
					strokeWidth: 2,
					strokeDasharray: '6 3'
				},
				dot: {
					dotFill: '#e63946',
					dotFillOpacity: 0.2,
					dotStrokeOpacity: 1,
					dotRadius: 20
				}
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * `areaX`/`areaY` together - since both of a heatmap's axes are band scales,
 * the two translucent highlight areas cross exactly at the hovered cell,
 * highlighting its full row and column at once. Each defaults to a neutral
 * gray sized to the cell's own width/height plus 2px.
 */
export const WithHighlightCross: Story = {
	args: {
		series: SERIES,
		markers: [
			{
				type: 'hover',
				areaX: true,
				areaY: true
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
