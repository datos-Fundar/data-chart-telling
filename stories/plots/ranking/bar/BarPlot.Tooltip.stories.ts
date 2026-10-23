import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import RichTooltip from './RichTooltip.svelte';
import StackedRichTooltip from './StackedRichTooltip.svelte';
import {
	FEMALE_PROVINCE_VALUES,
	MALE_PROVINCE_VALUES,
	PROVINCE_VALUES,
	type ProvinceRow,
	AGE_SHARES_BY_YEAR,
	type AgeShareRow
} from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Ranking/BarPlot/Tooltip',
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
			control: false
		},
		tooltip: {
			description: 'Tooltip runtime configuration.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'BarPlot' } }
	}
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const FEMALE = {
	name: 'female',
	x: 'province',
	y: 'value',
	data: FEMALE_PROVINCE_VALUES
} satisfies Series<ProvinceRow>;

const MALE = {
	name: 'male',
	x: 'province',
	y: 'value',
	data: MALE_PROVINCE_VALUES
} satisfies Series<ProvinceRow>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Basic tooltip - the `format` callback receives the nearest hovered row and
 * returns the string shown in the floating box.
 *
 * Hover over any bar to activate.
 */
export const BasicTooltip: Story = {
	args: {
		series: [FEMALE],
		tooltip: {
			sync: false,
			format: (row) => {
				const { province, value } = row as ProvinceRow;
				return `${province}: ${value} yr`;
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
		series: [FEMALE],
		tooltip: {
			sync: false,
			format: (row) => {
				const { province, value } = row as ProvinceRow;
				return `Province: ${province}\nLife expectancy: ${value.toFixed(1)} yr`;
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
		series: [FEMALE],
		tooltip: {
			sync: false,
			format: (row) => {
				const { province, value } = row as ProvinceRow;
				const delta = (value - 80).toFixed(1);
				const sign = value >= 80 ? '+' : '';
				return `${province}: ${value.toFixed(1)} yr (${sign}${delta} vs 80)`;
			}
		}
	}
};

/**
 * Two-series chart - the tooltip fires for whichever series' bar is nearest
 * to the cursor. Move the cursor between female and male bars to see each respond
 * independently.
 */
export const TwoSeries: Story = {
	args: {
		series: [FEMALE, MALE],
		tooltip: {
			sync: false,
			format: (row) => {
				const { province, value } = row as ProvinceRow;
				return `${province}: ${value.toFixed(1)} yr`;
			}
		}
	}
};

/**
 * Series-filtered tooltip - `series: ['female']` restricts hover matching
 * to bars that belong to the named series only. Hovering over male bars shows
 * no tooltip even though both series are rendered.
 *
 * Compare with `TwoSeries` to see the difference.
 */
export const SeriesFiltered: Story = {
	args: {
		series: [FEMALE, MALE],
		tooltip: {
			sync: false,
			series: ['female'],
			format: (row) => {
				const { province, value } = row as ProvinceRow;
				return `Female - ${province}: ${value.toFixed(1)} yr`;
			}
		}
	}
};

/**
 * Two series from grouped data - `data / x / y / color` auto-creates one
 * series per unique `color` value. The row type is `ProvinceRow`,
 * which carries the `sex` field so the format can include it directly.
 */
export const TwoSeriesFromGroupedData: Story = {
	args: {
		data: PROVINCE_VALUES,
		x: 'province',
		y: 'value',
		color: 'sex',
		tooltip: {
			sync: false,
			format: (row) => {
				const { sex, province, value } = row as ProvinceRow;
				return `${sex} (${province}): ${value.toFixed(1)} yr`;
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
		data: PROVINCE_VALUES,
		x: 'province',
		y: 'value',
		color: 'sex',
		tooltip: {
			sync: false,
			series: ['female'],
			format: (row) => {
				const { sex, province, value } = row as ProvinceRow;
				return `${sex} (${province}): ${value.toFixed(1)} yr`;
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
 * `anchorX`/`anchorY` override the system default (`'right'`/`'bottom'`).
 * Here it's pinned above-and-to-the-left of the cursor instead - still
 * falls back toward the opposite side (via the centered position) if the
 * cursor gets close enough to an edge that the preferred side would
 * overflow.
 */
export const CustomAnchor: Story = {
	args: {
		series: [FEMALE],
		tooltip: {
			sync: false,
			anchorX: 'left',
			anchorY: 'top',
			format: (row) => {
				const { province, value } = row as ProvinceRow;
				return `${province}: ${value.toFixed(1)} yr`;
			}
		}
	}
};

// ── Horizontal, many categories ─────────────────────────────────────────────

/**
 * Horizontal, stacked, many categories - year on the y-axis (22 of
 * them: the censuses and the projections up to 2040), broad age groups
 * stacked to 100% per year. Exercises the same hover-hit-area path as the stories
 * above, just with a much larger, thinner-banded category count.
 */
export const HorizontalStackedTooltip: Story = {
	args: {
		width: 900,
		height: 900,
		data: AGE_SHARES_BY_YEAR,
		x: 'share',
		y: 'year',
		color: 'ageGroup',
		scales: {
			y: { type: 'band' },
			color: { scheme: 'RdBu' }
		} satisfies AxisBasedScalesConfig,
		tooltip: {
			sync: false,
			format: (row) => {
				const { year, ageGroup, share } = row as AgeShareRow;
				return `${year} / ${ageGroup}: ${share}`;
			}
		},
		transforms: [{ type: 'stackX' as const }],
		markers: [{ type: 'hover', showLabels: false }]
	}
};

/**
 * Same horizontal, many-category layout as above, but a single age group -
 * no stacking, no `color`/`grouping`.
 */
export const HorizontalSingleSeriesTooltip: Story = {
	args: {
		width: 900,
		height: 900,
		data: AGE_SHARES_BY_YEAR.filter((d) => d.ageGroup === '0-14'),
		x: 'share',
		y: 'year',
		scales: {
			y: { type: 'band' },
			color: { scheme: 'RdBu' }
		} satisfies AxisBasedScalesConfig,
		tooltip: {
			sync: false,
			format: (row) => {
				const { year, share } = row as AgeShareRow;
				return `${year}: ${share}`;
			}
		}
	}
};

/**
 * `HorizontalStackedTooltip`'s data/layout with a fully custom `content`
 * card instead of the default tooltip box - see `CustomContent` above for
 * the two-series version and `StackedRichTooltip.svelte` for the markup.
 */
export const HorizontalStackedCustomTooltip: StoryObj = {
	render: () => ({ Component: StackedRichTooltip })
};
