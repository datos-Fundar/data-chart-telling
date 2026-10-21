import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { FEMALE_LIFE_EXPECTANCY, MALE_LIFE_EXPECTANCY, LIFE_EXPECTANCY } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Evolution/LinePlot/Markers/Hover',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400
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

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Basic hover marker - an in-SVG dot and value label appear at the nearest
 * point as the cursor moves over the line. A dashed vertical rule (ruleX)
 * is drawn by default. No floating HTML tooltip is involved.
 */
export const Basic: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY
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
 * Dot only - `showLabels: false` suppresses the value label next to the dot,
 * leaving just the position indicator and the crosshair rule.
 */
export const WithoutLabels: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY
			}
		],
		markers: [
			{
				type: 'hover',
				showLabels: false
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Dot and label only - `ruleX: false` hides the vertical crosshair rule,
 * so only the dot and its label are drawn on hover.
 */
export const WithoutRule: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY
			}
		],
		markers: [
			{
				type: 'hover',
				ruleX: false
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Both crosshair rules - `ruleX: true` (default) and `ruleY: true` together
 * draw a full crosshair: a vertical rule at the hovered x and a horizontal
 * rule at the hovered y. Omitting `ruleY` leaves only the vertical rule.
 */
export const WithBothAxis: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY
			}
		],
		markers: [
			{
				type: 'hover',
				ruleX: true,
				ruleY: true
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Custom rule style - `rule` overrides the crosshair stroke individually.
 * Here the rule is rendered in red with a solid line and higher opacity.
 */
export const WithCustomRuleStyle: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY
			}
		],
		markers: [
			{
				type: 'hover',
				rule: {
					stroke: '#e63946',
					strokeOpacity: 0.7,
					strokeWidth: 2,
					strokeDasharray: '6 3'
				}
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Two series - the unscoped hover marker responds to whichever line's point
 * is nearest the cursor. Move between the two lines to see each respond.
 */
export const TwoSeries: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY
			},
			{
				name: 'male',
				x: 'year',
				y: 'value',
				data: MALE_LIFE_EXPECTANCY
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
 * Series-scoped marker - `series: 'female'` restricts the hover highlight to
 * points that belong to the female line only. Hovering over the male line
 * produces no dot or label even though both lines are rendered.
 *
 * Compare with `TwoSeries` to see the difference.
 */
export const SeriesScoped: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY
			},
			{
				name: 'male',
				x: 'year',
				y: 'value',
				data: MALE_LIFE_EXPECTANCY
			}
		],
		markers: [
			{
				type: 'hover',
				series: 'female'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Two series from grouped data - `data / x / y / color` auto-creates one
 * series per unique `color` value. The unscoped hover marker responds to both.
 */
export const FromGroupedData: Story = {
	args: {
		data: LIFE_EXPECTANCY,
		x: 'year',
		y: 'value',
		color: 'sex',
		markers: [
			{
				type: 'hover'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Grouped-data series-scoped - even though both series are rendered, the
 * hover marker only responds to female data points.
 */
export const GroupedSeriesScoped: Story = {
	args: {
		data: LIFE_EXPECTANCY,
		x: 'year',
		y: 'value',
		color: 'sex',
		markers: [
			{
				type: 'hover',
				series: 'female'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
