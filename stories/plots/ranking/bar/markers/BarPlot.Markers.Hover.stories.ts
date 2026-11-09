import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { FEMALE_PROVINCE_VALUES, MALE_PROVINCE_VALUES, PROVINCE_VALUES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Ranking/BarPlot/Markers/Hover',
	component: BarPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500
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
		docs: { source: { name: 'BarPlot' } }
	}
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * The plot's own hover, with a tooltip: the hovered province's band behind its bar, in the configuration's
 * neutral gray `hover.area`.
 */
export const Basic: Story = {
	args: {
		tooltip: true,
		series: [
			{
				name: 'female',
				x: 'province',
				y: 'value',
				data: FEMALE_PROVINCE_VALUES
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
				x: 'province',
				y: 'value',
				data: FEMALE_PROVINCE_VALUES
			}
		],
		markers: [
			{
				type: 'hover',
				back: [{ type: 'rule', axis: 'x', points: 'active' }],
				front: [{ type: 'dot' }]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Dot and label only - `back: []` hides the vertical crosshair rule, so
 * only the dot and its label are drawn on hover.
 */
export const WithoutRule: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'province',
				y: 'value',
				data: FEMALE_PROVINCE_VALUES
			}
		],
		markers: [
			{ type: 'hover', back: [], front: [{ type: 'dot' }, { type: 'text' }] }
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Both crosshair rules - a `rule` along `x` and one along `y` in `back` together
 * draw a full crosshair: a vertical rule at the hovered province and a
 * horizontal rule at the hovered value.
 */
export const WithBothAxis: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'province',
				y: 'value',
				data: FEMALE_PROVINCE_VALUES
			}
		],
		markers: [
			{
				type: 'hover',
				back: [
					{ type: 'rule', axis: 'x', points: 'active' },
					{ type: 'rule', axis: 'y', points: 'active' }
				],
				front: [{ type: 'dot' }, { type: 'text' }]
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
				x: 'province',
				y: 'value',
				data: FEMALE_PROVINCE_VALUES
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
				],
				front: [{ type: 'dot' }, { type: 'text' }]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Two series - the unscoped hover marker responds to whichever series' bar
 * is nearest the cursor.
 */
export const TwoSeries: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'province',
				y: 'value',
				data: FEMALE_PROVINCE_VALUES
			},
			{
				name: 'male',
				x: 'province',
				y: 'value',
				data: MALE_PROVINCE_VALUES
			}
		],
		markers: [
			{
				type: 'hover',
				back: [{ type: 'rule', axis: 'x', points: 'active' }],
				front: [
					{ type: 'dot' },
					{
						type: 'text',
						styles: {
							dy: -10
						}
					}
				]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Series-scoped marker - `series: 'female'` restricts the hover highlight to
 * bars that belong to the female series only. Hovering over the male bars
 * produces no dot or label even though both are rendered.
 *
 * Compare with `TwoSeries` to see the difference.
 */
export const SeriesScoped: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'province',
				y: 'value',
				data: FEMALE_PROVINCE_VALUES
			},
			{
				name: 'male',
				x: 'province',
				y: 'value',
				data: MALE_PROVINCE_VALUES
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
 * Hover marker on `'grouped'` series - `data / x / y / color` auto-creates one
 * series per unique `color` value, and the unscoped hover marker responds to
 * all of them. A dot and a label in `front` land on each series' own bar
 * slice, not the shared category center, over the band the plot draws behind.
 */
export const GroupedSeries: Story = {
	args: {
		data: PROVINCE_VALUES,
		x: 'province',
		y: 'value',
		color: 'sex',
		markers: [
			{
				type: 'hover',
				front: [{ type: 'dot' }, { type: 'text' }]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * A `band` along `x` on `'grouped'` series - the hover matches every series of the
 * category, so the highlight covers the whole two-bar group, as the dots mark
 * both bars.
 */
export const GroupedSeriesWithHighlightArea: Story = {
	args: {
		data: PROVINCE_VALUES,
		x: 'province',
		y: 'value',
		color: 'sex',
		markers: [
			{
				type: 'hover',
				back: [{ type: 'band', axis: 'x' }],
				front: [{ type: 'dot' }, { type: 'text' }]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * A `band` along `y` on `'grouped'` series, horizontal orientation - the
 * highlight covers the whole group, same as
 * `GroupedSeriesWithHighlightArea` but on the other axis.
 */
export const GroupedSeriesWithHighlightAreaHorizontal: Story = {
	args: {
		data: PROVINCE_VALUES,
		x: 'value',
		y: 'province',
		color: 'sex',
		markers: [
			{
				type: 'hover',
				back: [{ type: 'band', axis: 'y' }],
				front: [{ type: 'dot' }, { type: 'text' }]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Hover marker on `'stacked'` series - the dot and label land at each
 * series' cumulative height (its own segment's top), not at its raw value
 * from a zero baseline, so they sit on the correct segment of the stack.
 */
export const StackedSeries: Story = {
	args: {
		data: PROVINCE_VALUES,
		x: 'province',
		y: 'value',
		color: 'sex',
		transforms: [{ type: 'stackY' as const }],
		markers: [
			{
				type: 'hover',
				front: [{ type: 'dot' }, { type: 'text' }]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * A `band` along `y` - a translucent area the height of the hovered province's
 * own row (its band width), spanning the full plot width,
 * replacing the thin crosshair rule with a highlight closer to how a
 * hovered row often reads in a horizontal bar chart. Defaults to a neutral
 * gray, overridable via the band's `styles` (see `WithCustomHighlightArea`) or
 * the `hover.area` theme config.
 */
export const WithHighlightArea: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'value',
				y: 'province',
				data: FEMALE_PROVINCE_VALUES
			}
		],
		markers: [
			{
				type: 'hover',
				back: [
					{ type: 'band', axis: 'y' },
					{ type: 'rule', axis: 'y', points: 'active' }
				],
				front: [{ type: 'dot' }, { type: 'text' }]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * A band's `styles` set the highlight area's color/opacity; its thickness is
 * always the hovered bar's band. A `band` and a crosshair `rule` are
 * independent markers in `back` and can be combined; here there is no rule,
 * so the band is the only highlight.
 */
export const WithCustomHighlightArea: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'province',
				y: 'value',
				data: FEMALE_PROVINCE_VALUES
			}
		],
		markers: [
			{
				type: 'hover',
				back: [
					{
						type: 'band',
						axis: 'x',
						styles: {
							fill: '#0891b2',
							fillOpacity: 0.18
						}
					}
				],
				front: [{ type: 'dot' }, { type: 'text' }]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
