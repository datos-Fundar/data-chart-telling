import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import {
	LIFE_EXPECTANCY_BY_PROVINCE_SEX,
	FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
	MALE_LIFE_EXPECTANCY_BY_PROVINCE
} from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/HeatmapPlot/Markers/Hover',
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
		name: 'life_expectancy',
		x: 'province',
		y: 'sex',
		color: 'value',
		data: LIFE_EXPECTANCY_BY_PROVINCE_SEX
	}
];

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Basic hover marker — a dot appears on the hovered cell as the cursor moves
 * over the plot, along with a full crosshair (both `ruleX` and `ruleY` are
 * implied by the heatmap's `'punctual'` hover strategy) and a value label,
 * on by default like every other plot kind. Since heatmap cells already show
 * their value permanently, the label next to the hover dot duplicates it —
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
 * Without labels — `showLabels: false` turns off the hover marker's own
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
 * No crosshair — `ruleX: false` and `ruleY: false` suppress both rules the
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
 * Row rule only — `ruleX: false` keeps just the horizontal (`ruleY`) rule,
 * highlighting the hovered cell's sex row without the vertical province rule.
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
 * Column rule only — `ruleY: false` keeps just the vertical (`ruleX`) rule,
 * highlighting the hovered cell's sex column without the horizontal sex rule.
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
 * Custom rule style — `ruleStyle` overrides the crosshair stroke. Here the
 * rules render in red with a solid line and higher opacity.
 */
export const WithCustomRuleStyle: Story = {
	args: {
		series: SERIES,
		markers: [
			{
				type: 'hover',
				showLabels: false,
				ruleStyle: {
					stroke: '#e63946',
					strokeOpacity: 0.3,
					strokeWidth: 2,
					strokeDasharray: '6 3'
				},
				dotStyle: {
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
 * `areaX`/`areaY` together — since both of a heatmap's axes are band scales,
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
 * Two series from separate per-sex arrays — the unscoped hover marker
 * responds identically whether the grid comes from one combined series or,
 * as here, two merged per-sex series (see `TwoSeriesBySex` in the Series
 * stories).
 */
export const TwoSeriesBySex: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'province',
				y: 'sex',
				color: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			},
			{
				name: 'male',
				x: 'province',
				y: 'sex',
				color: 'value',
				data: MALE_LIFE_EXPECTANCY_BY_PROVINCE
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
 * Using the data/x/y/color shorthand — equivalent to `Basic`, built without an
 * explicit series array.
 */
export const FromGroupedData: Story = {
	args: {
		data: LIFE_EXPECTANCY_BY_PROVINCE_SEX,
		x: 'province',
		y: 'sex',
		color: 'value',
		markers: [
			{
				type: 'hover'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
