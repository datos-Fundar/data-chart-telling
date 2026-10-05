import type { Meta, StoryObj } from '@storybook/svelte-vite';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import {
	WORLD_COUNTRIES,
	ARGENTINA_PROVINCES,
	type ArgentinaProvinceProps
} from '../../plots/geo/data';
import { argentinaBicontinental } from '$lib/layout/coordinates/projections/argentina';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import {
	FEMALE_LIFE_EXPECTANCY,
	MALE_LIFE_EXPECTANCY,
	LIFE_EXPECTANCY
} from '../../plots/line/data';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import LinePlot from '$lib/plots/line/Plot.svelte';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `geo-hover` marker — the in-map hover highlight, restyling whichever
// feature is under the cursor. Its own `type: 'geo-hover'` tag (rather than
// the axis-based plots' `'hover'`) keeps the two config shapes unambiguous.
// Needs real distinct features to hover between, which `WORLD_COUNTRIES`
// already provides — see the other stories in this file for more style
// variants.

const meta = {
	title: 'Markers/Hover',
	component: GeoPlot,
	tags: ['autodocs'],
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	}
} satisfies Meta<typeof GeoPlot>;

export default meta;

// Each story renders its own plot (the same marker works on any plot kind), so the
// host, its base args and its story type are declared per host below.
type GeoPlotStory = StoryObj<typeof GeoPlot>;
const renderGeoPlot: GeoPlotStory['render'] = (args) => ({ Component: GeoPlot, props: args });
type LinePlotStory = StoryObj<typeof LinePlot>;
const renderLinePlot: LinePlotStory['render'] = (args) => ({ Component: LinePlot, props: args });

const GEO_PLOT_ARGS = {
	width: 940,
	height: 500,
	data: WORLD_COUNTRIES
} satisfies GeoPlotStory['args'];
const GEO_PLOT_ARGS_2 = {
	width: 940,
	height: 500,
	data: ARGENTINA_PROVINCES,
	featureId: (f) => (f.properties as ArgentinaProvinceProps).nombre,
	coordinates: { projection: { type: argentinaBicontinental } }
} satisfies GeoPlotStory['args'];
const LINE_PLOT_ARGS = {
	width: 940,
	height: 400
} satisfies LinePlotStory['args'];

/** Hover a country — it gets a neutral translucent fill (the shared `hover.area` theme default). Matching follows the browser's own SVG hit-testing. */
export const Basic: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		markers: [{ type: 'geo-hover' }] satisfies GeoMarkersConfig[]
	}
};

// ── Stories ───────────────────────────────────────────────────────────────────

/** Basic hover marker — the feature under the cursor gets a neutral translucent fill (the shared `hover.area` theme default). Matching follows the browser's own SVG hit-testing, not distance to a centroid. */
export const ProvinceHighlight: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS_2,
		markers: [{ type: 'geo-hover' }] satisfies GeoMarkersConfig[]
	}
};

/** Custom style — overrides the hovered feature's stroke. */
export const CustomStyle: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS_2,
		markers: [
			{ type: 'geo-hover', styles: { stroke: '#7f1d1d', strokeWidth: 3 } }
		] satisfies GeoMarkersConfig[]
	}
};

/** Filled highlight — a semi-transparent fill on top of the feature's own choropleth color. */
export const FilledHighlight: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS_2,
		markers: [
			{
				type: 'geo-hover',
				styles: { fill: '#facc15', fillOpacity: 0.4, stroke: '#a16207', strokeWidth: 2 }
			}
		] satisfies GeoMarkersConfig[]
	}
};

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Basic hover marker — an in-SVG dot and value label appear at the nearest
 * point as the cursor moves over the line. A dashed vertical rule (ruleX)
 * is drawn by default. No floating HTML tooltip is involved.
 */
export const TimeSeries: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
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
 * Dot only — `showLabels: false` suppresses the value label next to the dot,
 * leaving just the position indicator and the crosshair rule.
 */
export const WithoutLabels: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
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
 * Dot and label only — `ruleX: false` hides the vertical crosshair rule,
 * so only the dot and its label are drawn on hover.
 */
export const WithoutRule: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
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
 * Both crosshair rules — `ruleX: true` (default) and `ruleY: true` together
 * draw a full crosshair: a vertical rule at the hovered x and a horizontal
 * rule at the hovered y. Omitting `ruleY` leaves only the vertical rule.
 */
export const WithBothAxis: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
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
 * Custom rule style — `rule` overrides the crosshair stroke individually.
 * Here the rule is rendered in red with a solid line and higher opacity.
 */
export const WithCustomRuleStyle: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
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
 * Two series — the unscoped hover marker responds to whichever line's point
 * is nearest the cursor. Move between the two lines to see each respond.
 */
export const TwoSeries: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
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
 * Series-scoped marker — `series: 'female'` restricts the hover highlight to
 * points that belong to the female line only. Hovering over the male line
 * produces no dot or label even though both lines are rendered.
 *
 * Compare with `TwoSeries` to see the difference.
 */
export const SeriesScoped: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
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
 * Two series from grouped data — `data / x / y / color` auto-creates one
 * series per unique `color` value. The unscoped hover marker responds to both.
 */
export const FromGroupedData: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
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
 * Grouped-data series-scoped — even though both series are rendered, the
 * hover marker only responds to female data points.
 */
export const GroupedSeriesScoped: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
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
