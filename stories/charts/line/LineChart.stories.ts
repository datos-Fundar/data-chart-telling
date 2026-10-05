import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LineChart from '$lib/charts/line/Chart.svelte';
import LineTimeline from './LineTimeline.svelte';
import LineTimelineInterpolated from './LineTimelineInterpolated.svelte';
import LineCustomHeader from './LineCustomHeader.svelte';
import { TIME_SERIES, type SeriesPoint } from '../../data/time-series';

const meta = {
	title: 'Charts/LineChart',
	component: LineChart,
	tags: ['autodocs'],
	args: {
		width: 680,
		height: 460,
		data: TIME_SERIES,
		x: 'year',
		y: 'value'
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 1000, step: 20 } },
		height: { control: { type: 'range', min: 240, max: 700, step: 20 } },
		data: { control: false },
		x: { control: false },
		y: { control: false },
		color: { control: false },
		segments: { control: false },
		facet: { control: false },
		timeline: { control: false },
		legend: { control: false }
	}
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Container chrome ────────────────────────────────────────────────────────────

/** A single ungrouped series wrapped in the full chart container. */
export const Default: Story = {
	args: {
		title: 'Economic indicator',
		subtitle: 'North region · single series',
		caption: 'Source: synthetic demo data.',
		data: TIME_SERIES.filter((d) => d.region === 'North' && d.metric === 'GDP')
	}
};

// ── Grouping (color) ────────────────────────────────────────────────────────────────
export const Grouping: Story = {
	args: {
		title: 'GDP vs. Employment',
		subtitle: 'Grouping by metric',
		data: TIME_SERIES.filter((d) => d.region === 'North'),
		grouping: 'metric' as keyof SeriesPoint
	}
};

/** Same grouping, now with a discrete legend built from the colour map. */
export const GroupedWithLegend: Story = {
	args: {
		title: 'GDP vs. Employment',
		subtitle: 'With discrete legend',
		caption: 'The legend and the chart use the default color map.',
		data: TIME_SERIES.filter((d) => d.region === 'North'),
		color: 'metric' as keyof SeriesPoint,
		legend: [
			{
				type: 'discrete',
				title: 'Indicator',
				items: [
					{
						name: 'GDP',
						symbol: 'line'
					},
					{
						name: 'Employment',
						symbol: 'line'
					}
				],
				columns: 2
			}
		]
	}
};

/**
 * `interactive: { enabled: true }` on the discrete legend section turns each
 * item into a toggle: click "GDP" or "Employment" to dim that line (and its
 * dots) in place, click again to bring it back. `disabled: { mode: 'style',
 * style }` is caller-provided — here a near-full fade; omit `style` to fall
 * back to the package's default dim opacity. A hidden series also drops out of
 * hover/tooltip matching, not just the visual fade — `tooltip: true` shows that.
 */
export const InteractiveLegend: Story = {
	args: {
		title: 'GDP vs. Employment',
		subtitle: 'Interactive legend — click a category to hide it',
		data: TIME_SERIES.filter((d) => d.region === 'North'),
		color: 'metric' as keyof SeriesPoint,
		tooltip: true,
		legend: [
			{
				type: 'discrete',
				title: 'Indicator',
				interactive: { enabled: true, disabled: { mode: 'style', style: { opacity: 0.08 } } },
				items: [
					{ name: 'GDP', symbol: 'line' },
					{ name: 'Employment', symbol: 'line' }
				],
				columns: 2
			}
		]
	}
};

// ── Timeline ────────────────────────────────────────────────────────────────────

/**
 * Unlike bar/heatmap, a line timeline defaults to a *cumulative* reveal
 * (`filterMode: 'upTo'`) — the line grows up to the selected year instead of
 * collapsing to a single point. Drag the scrubber to watch it grow.
 */
export const WithTimeline: StoryObj = {
	render: () => ({ Component: LineTimeline })
};

/**
 * `interpolate` tweens the line's leading edge continuously between real
 * years instead of jumping straight from one to the next — `interpolate: true`
 * (or `{ progressEasing: ... }` like here) reuses the chart's own `y`/`color`
 * as the tweened value and per-series key, no extra wiring needed.
 */
export const WithInterpolatedTimeline: StoryObj = {
	render: () => ({ Component: LineTimelineInterpolated })
};

// ── Faceting ────────────────────────────────────────────────────────────────────

/**
 * `facet.by` splits into small multiples (one plot per region); `color` still
 * groups within each facet. A single shared legend sits above the grid.
 */
export const Faceted: Story = {
	args: {
		title: 'GDP vs. Employment by region',
		subtitle: 'Faceted by region',
		color: 'metric' as keyof SeriesPoint,
		legend: [
			{
				type: 'discrete',
				title: 'Indicator',
				items: [
					{
						name: 'GDP',
						symbol: 'line'
					},
					{
						name: 'Employment',
						symbol: 'line'
					}
				],
				columns: 2
			}
		],
		facet: { by: 'region' as keyof SeriesPoint, columns: 2 }
	}
};

// ── Custom header & footer ──────────────────────────────────────────────────────

/**
 * `header` and `footer` snippets replace the string `title`/`subtitle`/`caption`
 * props with arbitrary markup. Here: a two-column header (title + subtitle on
 * the left, a logo mark on the right) and a footer with a source note and an
 * update timestamp.
 */
export const WithCustomHeaderAndFooter: StoryObj = {
	render: () => ({ Component: LineCustomHeader })
};

// ── Markers ─────────────────────────────────────────────────────────────────────

/** Rule markers pass straight through to the underlying line plot. */
export const WithMarkers: Story = {
	args: {
		title: 'With markers',
		data: TIME_SERIES.filter((d) => d.region === 'North'),
		color: 'metric' as keyof SeriesPoint,
		markers: [
			{
				type: 'rule',
				axis: 'x',
				value: 2020,
				styles: {
					strokeDasharray: '4 4',
					strokeOpacity: 0.6
				}
			}
		]
	}
};
