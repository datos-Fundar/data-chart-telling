import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import RichTooltip from './RichTooltip.svelte';
import {
	FEMALE_LIFE_EXPECTANCY,
	MALE_LIFE_EXPECTANCY,
	LIFE_EXPECTANCY,
	type YearPoint,
	type LifeExpectancyPoint
} from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Evolution/LinePlot/Tooltip',
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
			control: false
		},
		tooltip: {
			description: 'Tooltip runtime configuration.',
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
 * Basic tooltip - the `format` callback receives the nearest hovered row and
 * returns the string shown in the floating box.
 *
 * Hover over the line to activate.
 */
export const BasicTooltip: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY
			}
		],
		tooltip: {
			sync: false,
			format: (row) => {
				const { year, value } = row as YearPoint;
				return `${year}: ${value} yr`;
			}
		}
	}
};

/**
 * Rich multi-line format - `\n` splits the tooltip string across lines.
 * The portion before the first break is used as the heading; the rest is
 * the body text.
 */
export const RichFormat: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY
			}
		],
		tooltip: {
			sync: false,
			format: (row) => {
				const { year, value } = row as YearPoint;
				return `Year: ${year}\nLife expectancy: ${value.toFixed(1)} yr`;
			}
		}
	}
};

/**
 * Computed tooltip text - the format function can derive any string from the
 * row. Here it shows the difference relative to an 80-year threshold.
 */
export const ComputedFormat: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY
			}
		],
		tooltip: {
			sync: false,
			format: (row) => {
				const { year, value } = row as YearPoint;
				const delta = (value - 80).toFixed(1);
				const sign = value >= 80 ? '+' : '';
				return `${year}: ${value.toFixed(1)} yr (${sign}${delta} vs 80)`;
			}
		}
	}
};

/**
 * Two-series chart - the tooltip fires for whichever series' point is nearest
 * to the cursor. Move the cursor between the two lines to see each respond
 * independently.
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
		tooltip: {
			sync: false,
			format: (row) => {
				const { year, value } = row as YearPoint;
				return `${year}: ${value.toFixed(1)} yr`;
			}
		}
	}
};

/**
 * Series-filtered tooltip - `series: ['female']` restricts hover matching
 * to points that belong to the named series only. Hovering over the male
 * line shows no tooltip even though both lines are rendered.
 *
 * Compare with `TwoSeries` to see the difference.
 */
export const SeriesFiltered: Story = {
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
		tooltip: {
			sync: false,
			series: ['female'],
			format: (row) => {
				const { year, value } = row as YearPoint;
				return `Female: ${value.toFixed(1)} yr (${year})`;
			}
		}
	}
};

/**
 * Two series from grouped data - `data / x / y / color` auto-creates one
 * series per unique `color` value. The row type is `LifeExpectancyPoint`,
 * which carries the `sex` field so the format can include it directly.
 */
export const TwoSeriesFromGroupedData: Story = {
	args: {
		data: LIFE_EXPECTANCY,
		x: 'year',
		y: 'value',
		color: 'sex',
		tooltip: {
			sync: false,
			format: (row) => {
				const { sex, year, value } = row as LifeExpectancyPoint;
				return `${sex} (${year}): ${value.toFixed(1)} yr`;
			}
		}
	}
};

/**
 * Grouped-data tooltip filtered to one sex - even though both series are
 * rendered, the tooltip only responds to female data points.
 */
export const GroupedDataSeriesFiltered: Story = {
	args: {
		data: LIFE_EXPECTANCY,
		x: 'year',
		y: 'value',
		color: 'sex',
		tooltip: {
			sync: false,
			series: ['female'],
			format: (row) => {
				const { year, value } = row as LifeExpectancyPoint;
				return `Female (${year}): ${value.toFixed(1)} yr`;
			}
		}
	}
};

/**
 * Fully custom tooltip markup via `content` - replaces the default floating
 * label entirely with an arbitrary snippet: a bold header, a colour-coded
 * per-series list sorted by value, and a footnote. `format` is still required
 * by the type but is ignored once `content` is set.
 *
 * See `RichTooltip.svelte` for the markup - the library automatically drops
 * its default dark tooltip box (background/padding/border) whenever
 * `content` is set, so the custom card fully owns the look.
 */
export const CustomContent: StoryObj = {
	render: () => ({ Component: RichTooltip })
};

/**
 * `anchorX`/`anchorY` override the system default (`'right'`/`'bottom'` -
 * the tooltip sits to the right of the cursor and below it, so it never
 * covers the hovered point). Here it's pinned above-and-to-the-left
 * instead. Whatever side is picked, it still falls back toward the opposite
 * side (via the centered position) if the cursor gets close enough to an
 * edge that the preferred side would overflow - try hovering near the plot's
 * own left/top edges to see it happen.
 */
export const CustomAnchor: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY
			}
		],
		tooltip: {
			sync: false,
			anchorX: 'left',
			anchorY: 'top',
			format: (row) => {
				const { year, value } = row as YearPoint;
				return `${year}: ${value.toFixed(1)} yr`;
			}
		}
	}
};
