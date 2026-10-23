import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import {
	FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
	LIFE_EXPECTANCY_BY_PROVINCE,
	type ProvincePoint
} from './data';
import { ARGENTINA_CHILE_TRENDS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Ranking/BarPlot/Scales',
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
		scales: {
			description: 'Per-axis scale configuration.',
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
 * No scale overrides - both axes are auto-fitted to the data extent.
 */
export const Default: Story = {
	args: {
		series: [
			{
				name: 'female_life_expectancy',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			} satisfies Series<ProvincePoint>
		]
	}
};

/**
 * Constrained Y domain - tightens the visible range to [75, 88], which makes
 * the variation in life expectancy more visible. Compare with `Default` to see
 * how the bars appear more spread out when the Y range is reduced.
 */
export const CustomYDomain: Story = {
	args: {
		series: [
			{
				name: 'female_life_expectancy',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			} satisfies Series<ProvincePoint>
		],
		scales: {
			y: { domain: [70, 88] }
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * Axis labels - a human-readable string appears alongside each axis.
 * Passing `false` to `label` suppresses the label svelteplot would infer
 * from the field name.
 */
export const WithAxisLabels: Story = {
	args: {
		series: [
			{
				name: 'female_life_expectancy',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			} satisfies Series<ProvincePoint>
		],
		scales: {
			x: { label: 'Province' },
			y: { label: 'Life expectancy (years)' }
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * Reversed Y axis - values increase downward instead of upward.
 * Useful for rankings where lower numbers are better.
 */
export const ReversedY: Story = {
	args: {
		series: [
			{
				name: 'female_life_expectancy',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			} satisfies Series<ProvincePoint>
		],
		scales: {
			y: { reverse: true }
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * Grid lines on the Y axis - adds horizontal reference lines at every tick,
 * making it easier to read off individual values without a ruler.
 */
export const WithGrid: Story = {
	args: {
		series: [
			{
				name: 'female_life_expectancy',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			} satisfies Series<ProvincePoint>
		],
		scales: {
			y: { grid: true }
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * Custom tick formatter on Y - the function receives the raw tick value and
 * returns the display string. Here it appends " yr" to every label.
 */
export const CustomTickFormat: Story = {
	args: {
		series: [
			{
				name: 'female_life_expectancy',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			} satisfies Series<ProvincePoint>
		],
		scales: {
			y: {
				tickFormat: (d: unknown) => `${d} yr`
			}
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * Rotated X tick labels at −45°. Useful when province names are long and
 * would otherwise overlap on a horizontal axis.
 */
export const RotatedXTicks: Story = {
	args: {
		series: [
			{
				name: 'female_life_expectancy',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			} satisfies Series<ProvincePoint>
		],
		scales: {
			x: {
				tickRotate: -45
			}
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * Zero-anchored Y axis - `zero: true` forces the Y domain to include 0
 * even when all data values are far above it. Makes relative magnitudes
 * honest but compresses the visible trend significantly.
 */
export const ZeroAnchoredY: Story = {
	args: {
		series: [
			{
				name: 'female_life_expectancy',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			} satisfies Series<ProvincePoint>
		],
		scales: {
			y: { zero: true }
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * Bars ordered by their own Y value (descending) instead of the default
 * alphabetical order of the X category. `scales.x.sort` receives the full
 * row on each side - not just the X value - so the comparator can read
 * `value` (or any other field) to decide the order.
 */
export const SortXByYDescending: Story = {
	args: {
		series: [
			{
				name: 'female_life_expectancy',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			} satisfies Series<ProvincePoint>
		],
		scales: {
			x: {
				sort: (a, b) => (b as ProvincePoint).value - (a as ProvincePoint).value
			}
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * All overrides combined on a two-series chart: labelled axes, a tighter
 * Y domain, rotated X tick labels, and a Y grid.
 */
export const CombinedOverrides: Story = {
	args: {
		data: LIFE_EXPECTANCY_BY_PROVINCE,
		x: 'province',
		y: 'value',
		color: 'sex',
		scales: {
			x: { label: 'Province', tickRotate: -45 },
			y: { label: 'Life expectancy (years)', domain: [70, 85], grid: true }
		} satisfies AxisBasedScalesConfig
	}
};

// ── Series layout (multiple series sharing a category) ────────────────────────
// Series that share a category sit side by side by default; a plot-level
// `stackY` transform stacks them instead.

/**
 * Default layout - each series gets its own slice of the category band, side
 * by side. The slice width is only an estimate (derived from this plot's own
 * width/margins, not svelteplot's actual measured scale), so it can be
 * slightly off when an `'auto'` margin ends up wider than expected. The gap
 * between bars within a group comes from the theme's `bar.seriesPadding`
 * (0.2 by default).
 */
export const GroupedSeries: Story = {
	args: {
		data: LIFE_EXPECTANCY_BY_PROVINCE,
		x: 'province',
		y: 'value',
		color: 'sex'
	}
};

/**
 * A plot-level `stackY` transform stacks series cumulatively within each
 * category's band instead of placing them side by side. `y` is always the
 * value, even on horizontal bars, so a stack is always `stackY`.
 */
export const StackedSeries: Story = {
	args: {
		data: LIFE_EXPECTANCY_BY_PROVINCE,
		x: 'province',
		y: 'value',
		color: 'sex',
		transforms: [{ type: 'stackY' as const }]
	}
};

/**
 * `scales.x.paddingInner` widens the gap *between* categories (provinces),
 * which - since side-by-side series estimate their slice width off the same band-scale
 * formula - also narrows every series' own bars accordingly.
 */
export const WideGroupSpacing: Story = {
	args: {
		data: LIFE_EXPECTANCY_BY_PROVINCE,
		x: 'province',
		y: 'value',
		color: 'sex',
		scales: {
			x: { paddingInner: 0.4 }
		} satisfies AxisBasedScalesConfig
	}
};

// ── Orientation (horizontal bars) ──────────────────────────────────────────────
// `x` and `y` are always the visual axes, as in svelteplot's `BarX`/`BarY`:
// the plot reads which one holds the categories off the values themselves.
// Categories on `x` draw vertical bars (`BarY`); categories on `y` draw
// horizontal ones (`BarX`), with the value along `x`.

/**
 * Horizontal bars - the province names are strings, so the plot puts them on
 * the Y axis it was given them on, and life expectancy (the value) on X.
 */
export const HorizontalBars: Story = {
	args: {
		series: [
			{
				name: 'female_life_expectancy',
				x: 'value',
				y: 'province',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			} satisfies Series<ProvincePoint>
		]
	}
};

/**
 * Horizontal bars with several series - the two series sit side by side
 * within each category's row, as they do vertically by default.
 */
export const HorizontalGroupedSeries: Story = {
	args: {
		data: LIFE_EXPECTANCY_BY_PROVINCE,
		x: 'value',
		y: 'province',
		color: 'sex'
	}
};

/**
 * `HorizontalGroupedSeries` with a plot-level `stackX` - the two series stack
 * end to end along each category's row, on the value axis, `x`.
 */
export const HorizontalStackedSeries: Story = {
	args: {
		...HorizontalGroupedSeries.args,
		transforms: [{ type: 'stackX' as const }]
	}
};

const YEARLY_VALUES = ARGENTINA_CHILE_TRENDS.filter((d) => d.country === 'Chile');

/**
 * Numeric categories, like years. With both `x` and `y` numeric, nothing in
 * the data says which one holds the categories - and a bar on a continuous
 * axis has no band to stand in. A bar plot needs one category axis, so it
 * takes `x` as one: each year gets its own band. Writing
 * `scales: { x: { type: 'band' } }` says the same thing explicitly.
 */
export const NumericCategories: Story = {
	args: {
		data: YEARLY_VALUES,
		x: 'year',
		y: 'value',
		color: 'metric'
	}
};

/**
 * The same years drawn as horizontal bars. With numeric categories the values
 * alone can't tell which way the bars run, so `scales.y.type: 'band'` says the
 * years on `y` are the categories.
 */
export const NumericCategoriesHorizontal: Story = {
	args: {
		data: YEARLY_VALUES,
		x: 'value',
		y: 'year',
		color: 'metric',
		scales: { y: { type: 'band' } }
	}
};
