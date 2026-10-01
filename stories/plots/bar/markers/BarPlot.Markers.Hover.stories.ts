import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import {
	FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
	MALE_LIFE_EXPECTANCY_BY_PROVINCE,
	LIFE_EXPECTANCY_BY_PROVINCE
} from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/BarPlot/Markers/Hover',
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
 * Basic hover marker — an in-SVG dot and value label appear at the nearest
 * bar as the cursor moves over the plot. A dashed vertical rule (ruleX) is
 * drawn by default. No floating HTML tooltip is involved.
 */
export const Basic: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
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
 * Dot only — `showLabels: false` suppresses the value label next to the dot,
 * leaving just the position indicator and the crosshair rule.
 */
export const WithoutLabels: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
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
 * Dot and label only — `ruleX: false` hides the vertical crosshair rule, so
 * only the dot and its label are drawn on hover.
 */
export const WithoutRule: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
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
 * Both crosshair rules — `ruleX: true` (default) and `ruleY: true` together
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
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
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
 * Custom rule style — `rule` overrides the crosshair stroke individually.
 * Here the rule is rendered in red with a solid line and higher opacity.
 */
export const WithCustomRuleStyle: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
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
 * Two series — the unscoped hover marker responds to whichever series' bar
 * is nearest the cursor.
 */
export const TwoSeries: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			},
			{
				name: 'male',
				x: 'province',
				y: 'value',
				data: MALE_LIFE_EXPECTANCY_BY_PROVINCE
			}
		],
		markers: [
			{
				type: 'hover',
				text: {
					dy: -10
				}
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Series-scoped marker — `series: 'female'` restricts the hover highlight to
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
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			},
			{
				name: 'male',
				x: 'province',
				y: 'value',
				data: MALE_LIFE_EXPECTANCY_BY_PROVINCE
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
 * Two series from grouped data — `data / x / y / color` auto-creates one
 * series per unique `color` value. The unscoped hover marker responds to both.
 */
export const FromGroupedData: Story = {
	args: {
		data: LIFE_EXPECTANCY_BY_PROVINCE,
		x: 'province',
		y: 'value',
		color: 'sex',
		markers: [
			{
				type: 'hover',
				text: {
					dy: -10
				}
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Overlaped-data series-scoped — even though both series are rendered, the
 * hover marker only responds to female data points.
 */
export const OverlapedSeriesScoped: Story = {
	args: {
		data: LIFE_EXPECTANCY_BY_PROVINCE,
		x: 'province',
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

/**
 * Hover marker on `'grouped'` series — the dot, label, and crosshair rule
 * land on each series' own bar slice, not the shared category center.
 */
export const GroupedSeries: Story = {
	args: {
		data: LIFE_EXPECTANCY_BY_PROVINCE,
		x: 'province',
		y: 'value',
		color: 'sex',
		scales: {
			grouping: { seriesLayout: 'grouped', seriesPadding: 0.2 }
		},
		markers: [
			{
				type: 'hover'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * `areaX: true` on `'grouped'` series — the highlight narrows to the
 * hovered series' own bar, not the whole two-bar group.
 */
export const GroupedSeriesWithHighlightArea: Story = {
	args: {
		data: LIFE_EXPECTANCY_BY_PROVINCE,
		x: 'province',
		y: 'value',
		color: 'sex',
		scales: {
			grouping: { seriesLayout: 'grouped', seriesPadding: 0.2 }
		},
		markers: [
			{
				type: 'hover',
				areaX: true,
				ruleX: false
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * `areaY: true` on `'grouped'` series, horizontal orientation — the
 * highlight narrows to the hovered series' own bar, same as
 * `GroupedSeriesWithHighlightArea` but on the other axis.
 */
export const GroupedSeriesWithHighlightAreaHorizontal: Story = {
	args: {
		data: LIFE_EXPECTANCY_BY_PROVINCE,
		x: 'province',
		y: 'value',
		color: 'sex',
		scales: {
			y: { type: 'categorical' },
			grouping: { seriesLayout: 'grouped', seriesPadding: 0.2 }
		},
		markers: [
			{
				type: 'hover',
				areaY: true,
				ruleY: false
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Hover marker on `'stacked'` series — the dot and label land at each
 * series' cumulative height (its own segment's top), not at its raw value
 * from a zero baseline, so they sit on the correct segment of the stack.
 */
export const StackedSeries: Story = {
	args: {
		data: LIFE_EXPECTANCY_BY_PROVINCE,
		x: 'province',
		y: 'value',
		color: 'sex',
		scales: {
			grouping: { seriesLayout: 'stacked' }
		},
		markers: [
			{
				type: 'hover'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * `areaY: true` — a translucent area the height of the hovered province's
 * own row (its band width plus 2px), spanning the full plot width,
 * replacing the thin crosshair rule with a highlight closer to how a
 * hovered row often reads in a horizontal bar chart. Defaults to a neutral
 * gray, overridable via `area` (see `WithCustomHighlightArea`) or the
 * `hover.area` theme config.
 */
export const WithHighlightArea: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			}
		],
		scales: {
			y: { type: 'categorical' }
		},
		markers: [
			{
				type: 'hover',
				areaY: true
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * `area` overrides the highlight area's color/opacity; its thickness is
 * always sized to the hovered bar's own width plus 2px. `areaX`/`areaY` and
 * the crosshair rule are independent and can be combined; here the rule is
 * turned off so the area is the only highlight.
 */
export const WithCustomHighlightArea: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			}
		],
		markers: [
			{
				type: 'hover',
				areaX: true,
				ruleX: false,
				area: {
					fill: '#0891b2',
					fillOpacity: 0.18
				}
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
