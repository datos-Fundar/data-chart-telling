import type { Meta, StoryObj } from '@storybook/svelte-vite';
import type { PlotRowContext } from '$lib';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig, BarValueLabel, WithValues } from '$lib/types/layout/styles';

type BarStyles = WithValues<AxisBasedStylesConfig, BarValueLabel>;
import { FEMALE_PROVINCE_VALUES, MALE_PROVINCE_VALUES, type ProvinceRow } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Ranking/BarPlot/Styles/Values',
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
		styles: {
			description: 'Rendering style overrides.',
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
 * No style overrides - the plot uses the configured theme defaults.
 */
export const Default: Story = {
	args: { series: [FEMALE] }
};

/**
 * Value labels enabled with default settings - `styles.values.show: true`
 * renders the numeric Y value above (or anchored to) the top of each bar.
 *
 * The default format is `"${seriesName} - ${value}"` and the default layout
 * is `'path'` past each bar's tip (`edge: 'tip'`, `side: 'outside'`), which places the text above the bar.
 */
export const ShowValues: Story = {
	args: {
		series: [FEMALE],
		styles: {
			values: { show: true }
		} satisfies BarStyles
	}
};

/**
 * `layout: 'path'` past each bar's tip (explicit) - text appears above the bar, centered on it.
 * This is a bar plot's default.
 */
export const PathPastTheTip: Story = {
	args: {
		series: [FEMALE],
		styles: {
			values: {
				layout: 'path',
				edge: 'tip',
				side: 'outside',
				format: (v: number) => `${v.toFixed(1)} yr`
			}
		} satisfies BarStyles
	}
};

/** `layout: 'box'` with `anchor: 'top'` - inside each bar, at its top end, fitted to it. */
export const BoxTop: Story = {
	args: {
		series: [FEMALE],
		styles: {
			values: {
				layout: 'box',
				anchor: 'top',
				format: (v: number) => `${v.toFixed(1)} yr`,
				fontStyle: { fill: 'white' }
			}
		} satisfies BarStyles
	}
};

/**
 * `layout: 'box'` - the label is placed in the middle of the bar, in the color that reads best on it.
 * Works best for taller bars.
 */
export const BoxMiddle: Story = {
	args: {
		series: [FEMALE],
		styles: {
			values: {
				layout: 'box',
				format: (v: number) => `${v.toFixed(1)} yr`
			}
		} satisfies BarStyles
	}
};

/** `layout: 'path'` along each bar's `base`, inside it - at the end on zero, whatever the sign of its value. */
export const PathInsideTheBase: Story = {
	args: {
		series: [FEMALE],
		styles: {
			values: {
				layout: 'path',
				edge: 'base',
				side: 'inside',
				format: (v: number) => `${v.toFixed(1)} yr`,
				fontStyle: { fill: 'white' }
			}
		} satisfies BarStyles
	}
};

/**
 * `layout: 'point'` - the label starts at a point of each bar, `anchor: 'top'` the middle of its top edge, and is
 * written on its `side`. With `select`, only some bars are labelled: here the longest.
 */
export const PointAtTheTop: Story = {
	args: {
		series: [FEMALE],
		styles: {
			values: {
				layout: 'point',
				anchor: 'top',
				side: 'above',
				select: 'max',
				format: (v: number) => `max: ${v.toFixed(1)} yr`
			}
		} satisfies BarStyles
	}
};

/**
 * Custom format - the `format(value, seriesName)` callback receives the
 * numeric Y value and the series name. Return any string to override the
 * default `"${seriesName} - ${value}"` label.
 */
export const CustomFormat: Story = {
	args: {
		series: [FEMALE],
		styles: {
			values: {
				show: true,
				format: (v: number, _number: unknown, context: PlotRowContext) =>
					`${context.series} → ${v.toFixed(1)} yr`
			}
		} satisfies BarStyles
	}
};

/**
 * A custom gap - `gap` sets how far past its bar's tip the label sits, here
 * further above the bar.
 */
export const CustomGap: Story = {
	args: {
		series: [FEMALE],
		styles: {
			values: {
				gap: 12,
				format: (v: number) => `${v.toFixed(1)} yr`
			}
		} satisfies BarStyles
	}
};

/**
 * Two series with default labels - each series' bars get their own labels,
 * filled with the palette colour for that series. The default label past the tip
 * places both label sets above their respective bars.
 */
export const TwoSeriesWithLabels: Story = {
	args: {
		series: [FEMALE, MALE],
		styles: {
			values: {
				show: true,
				format: (v: number, _number: unknown, context: PlotRowContext) =>
					`${context.series} (${v.toFixed(1)})`
			}
		} satisfies BarStyles
	}
};

/**
 * Two series with `layout: 'box'` labels - labels appear inside the bars.
 * Works best when bars are tall enough to accommodate text.
 */
export const TwoSeriesLabelsMiddle: Story = {
	args: {
		series: [FEMALE, MALE],
		styles: {
			values: {
				layout: 'box',
				format: (v: number, _number: unknown, context: PlotRowContext) =>
					`${context.series}: ${v.toFixed(1)} yr`
			}
		} satisfies BarStyles
	}
};

/**
 * Grouped series with labels in the middle of their bars (`layout: 'box'`). The `\n` in the format
 * function creates a multi-line label.
 */
export const TwoSeriesGroupedLabelsMiddle: Story = {
	args: {
		series: [FEMALE, MALE],
		styles: {
			values: {
				layout: 'box',
				format: (v: number, _number: unknown, context: PlotRowContext) =>
					`${context.series}\n(${v.toFixed(1)} yr)`
			}
		} satisfies BarStyles
	}
};

/**
 * Stacked series - their labels are in the middle of each bar's segment of the stack by default
 * (`layout: 'box'`).
 */
export const TwoSeriesStackedLabelsMiddle: Story = {
	args: {
		series: [FEMALE, MALE],
		styles: {
			values: {
				format: (v: number, _number: unknown, context: PlotRowContext) =>
					`${context.series}\n(${v.toFixed(1)} yr)`
			}
		} satisfies BarStyles,
		transforms: [{ type: 'stackY' as const }]
	}
};
