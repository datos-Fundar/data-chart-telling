import type { Meta, StoryObj } from '@storybook/svelte-vite';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { FEMALE_LIFE, LIFE } from '$datasets';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `rule` marker (svelteplot's own `RuleX`/`RuleY`) - a vertical/horizontal
// reference line at `value`, or one per row with `data`. Demoed on an empty
// `LinePlot` canvas so only the marker itself is on screen - see
// `Plots/*/Markers/Rules` for markers used alongside real chart data.

const meta = {
	title: 'Markers/Rule',
	component: LinePlot,
	tags: ['autodocs'],
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;

// Each story renders its own plot (the same marker works on any plot kind), so the
// host, its base args and its story type are declared per host below.
type LinePlotStory = StoryObj<typeof LinePlot>;
const renderLinePlot: LinePlotStory['render'] = (args) => ({ Component: LinePlot, props: args });

const LINE_PLOT_ARGS = {
	width: 940,
	height: 460,
	data: [],
	x: 'x',
	y: 'y',
	scales: { x: { domain: [0, 10] }, y: { domain: [0, 10] } }
} satisfies LinePlotStory['args'];
const LINE_PLOT_ARGS_2 = {
	width: 940,
	height: 400
} satisfies LinePlotStory['args'];

/** `axis: 'x'`, a literal `value` - one vertical line, spanning the full plot by default. */
export const Basic: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
		markers: [{ type: 'rule', axis: 'x', value: 6 }] satisfies AxisBasedMarkersConfig[]
	}
};

/** A list as `value` - a line at each, all with the same style, from a single marker. */
export const ManyValues: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
		markers: [
			{
				type: 'rule',
				axis: 'x',
				value: [2, 5, 8],
				styles: { stroke: 'crimson', strokeDasharray: '4 4' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `data` + a field-key `value` - one horizontal line per row, from a single marker. */
export const MultipleFromData: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
		markers: [
			{
				type: 'rule',
				axis: 'y',
				data: [{ v: 3 }, { v: 7 }],
				value: 'v',
				styles: { stroke: '#0891b2' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `y1`/`y2` bound the line's own extent instead of spanning the full plot; `styles` sets color/dash pattern. */
export const Bounded: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
		markers: [
			{
				type: 'rule',
				axis: 'x',
				value: 6,
				y1: 2,
				y2: 8,
				styles: { stroke: '#7c3aed', strokeWidth: 2, strokeDasharray: '6 3' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Vertical rule markers (ruleX) to highlight specific years.
 */
export const WithRuleXMarkers: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS_2,
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
				type: 'rule',
				axis: 'x',
				value: 1991,
				styles: {
					strokeDasharray: '4 4',
					strokeOpacity: 0.7
				}
			},
			{
				type: 'rule',
				axis: 'x',
				value: 2009,
				styles: {
					strokeDasharray: '4 4',
					strokeOpacity: 0.7
				}
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Horizontal rule markers (ruleY) to highlight threshold values.
 */
export const WithRuleYMarkers: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS_2,
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
				type: 'rule',
				axis: 'y',
				value: 70.8,
				styles: {
					strokeDasharray: '6 6',
					strokeOpacity: 0.5
				}
			},
			{
				type: 'rule',
				axis: 'y',
				value: 78.8,
				styles: {
					strokeDasharray: '6 6',
					strokeOpacity: 0.5
				}
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Mixing vertical and horizontal markers on the same chart.
 */
export const WithMixedMarkers: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS_2,
		data: LIFE,
		x: 'year',
		y: 'value',
		color: 'sex',
		markers: [
			{
				type: 'rule',
				axis: 'x',
				value: 2009,
				styles: {
					strokeDasharray: '4 4',
					strokeOpacity: 0.6
				}
			},
			{
				type: 'rule',
				axis: 'y',
				value: 72.1,
				styles: {
					strokeDasharray: '6 6',
					strokeOpacity: 0.5
				}
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
