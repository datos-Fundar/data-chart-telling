import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { FEMALE_LIFE, MALE_LIFE, LIFE } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Evolution/LinePlot/Markers/Hover',
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

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * The plot's own hover, with a tooltip: a dashed crosshair along `x` at the hovered year, and a dot and the
 * value on the line.
 */
export const Basic: Story = {
	args: {
		tooltip: true,
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
				type: 'hover'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Dot only - `front: [{ type: 'dot' }]` keeps the dot and drops the value label next to it,
 * leaving just the position indicator and the crosshair rule.
 */
export const WithoutLabels: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE
			}
		],
		markers: [{ type: 'hover', front: [{ type: 'dot' }] }] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Dot and label only - `back: []` hides the vertical crosshair rule,
 * so only the dot and its label are drawn on hover.
 */
export const WithoutRule: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE
			}
		],
		markers: [{ type: 'hover', back: [] }] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Both crosshair rules - a `rule` along `x` and one along `y` in `back` together
 * draw a full crosshair: a vertical rule at the hovered x and a horizontal
 * rule at the hovered y. Leaving the `y` one out leaves only the vertical rule.
 */
export const WithBothAxis: Story = {
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
				type: 'hover',
				back: [
					{ type: 'rule', axis: 'x', points: 'active' },
					{ type: 'rule', axis: 'y', points: 'active' }
				]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Custom rule style - the `styles` of a `rule` in `back` set the crosshair stroke individually.
 * Here the rule is rendered in red with a solid line and higher opacity.
 */
export const WithCustomRuleStyle: Story = {
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
				type: 'hover',
				back: [
					{
						type: 'rule',
						axis: 'x',
						points: 'active',
						styles: {
							stroke: '#e63946',
							strokeOpacity: 0.7,
							strokeWidth: 2,
							strokeDasharray: '6 3'
						}
					}
				]
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
				data: FEMALE_LIFE
			},
			{
				name: 'male',
				x: 'year',
				y: 'value',
				data: MALE_LIFE
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
				data: FEMALE_LIFE
			},
			{
				name: 'male',
				x: 'year',
				y: 'value',
				data: MALE_LIFE
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
		data: LIFE,
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
		data: LIFE,
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
