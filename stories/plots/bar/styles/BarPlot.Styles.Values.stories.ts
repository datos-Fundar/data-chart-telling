import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import {
	FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
	MALE_LIFE_EXPECTANCY_BY_PROVINCE,
	type ProvincePoint
} from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/BarPlot/Styles/Values',
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
	data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
} satisfies Series<ProvincePoint>;

const MALE = {
	name: 'male',
	x: 'province',
	y: 'value',
	data: MALE_LIFE_EXPECTANCY_BY_PROVINCE
} satisfies Series<ProvincePoint>;

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
 * The default format is `"${seriesName} - ${value}"` and the default anchor
 * is `'outside'`, which places the text above the bar.
 */
export const ShowValues: Story = {
	args: {
		series: [FEMALE],
		styles: {
			values: { show: true }
		} satisfies AxisBasedStylesConfig
	}
};

/**
 * Anchor `'outside'` (explicit) - text appears above the bar, centered on it.
 * This is the default when `anchor` is omitted for bar charts.
 */
export const AnchorOutside: Story = {
	args: {
		series: [FEMALE],
		styles: {
			values: {
				show: true,
				anchor: 'outside',
				format: (v: number) => `${v.toFixed(1)} yr`
			}
		} satisfies AxisBasedStylesConfig
	}
};

/**
 * Anchor `'end'` - the label appears at the end of the bar (top),
 * useful when labels need to be directly on the bar.
 */
export const AnchorEnd: Story = {
	args: {
		series: [FEMALE],
		styles: {
			values: {
				show: true,
				anchor: 'end',
				format: (v: number) => `${v.toFixed(1)} yr`,
				fontStyle: { dy: -10 }
			}
		} satisfies AxisBasedStylesConfig
	}
};

/**
 * Anchor `'middle'` - the label is placed in the middle of the bar.
 * Works best for taller bars with good contrast.
 */
export const AnchorMiddle: Story = {
	args: {
		series: [FEMALE],
		styles: {
			values: {
				show: true,
				anchor: 'middle',
				format: (v: number) => `${v.toFixed(1)} yr`
			}
		} satisfies AxisBasedStylesConfig
	}
};

/**
 * Anchor `'start'` - text appears at the start of the bar (bottom),
 * useful for showing baseline values.
 */
export const AnchorStart: Story = {
	args: {
		series: [FEMALE],
		styles: {
			values: {
				show: true,
				anchor: 'start',
				format: (v: number) => `${v.toFixed(1)} yr`,
				fontStyle: { dy: 10 }
			}
		} satisfies AxisBasedStylesConfig
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
				format: (v: number, name: string) => `${name} → ${v.toFixed(1)} yr`
			}
		} satisfies AxisBasedStylesConfig
	}
};

/**
 * Custom offsets - `dx` and `dy` fine-tune the label position in pixels,
 * overriding the defaults computed from `anchor`. Useful for nudging a label
 * away from another bar or legend.
 *
 * Here `anchor: 'outside'` is combined with `dy` to push the label further
 * above the bar.
 */
export const CustomOffsets: Story = {
	args: {
		series: [FEMALE],
		styles: {
			values: {
				show: true,
				anchor: 'outside',
				format: (v: number) => `${v.toFixed(1)} yr`,
				fontStyle: { dy: -12 }
			}
		} satisfies AxisBasedStylesConfig
	}
};

/**
 * Two series with default labels - each series' bars get their own labels,
 * filled with the palette colour for that series. The default `anchor: 'outside'`
 * places both label sets above their respective bars.
 */
export const TwoSeriesWithLabels: Story = {
	args: {
		series: [FEMALE, MALE],
		styles: {
			values: {
				show: true,
				format: (v: number, name: string) => `${name} (${v.toFixed(1)})`
			}
		} satisfies AxisBasedStylesConfig
	}
};

/**
 * Two series with `anchor: 'middle'` labels - labels appear inside the bars.
 * Works best when bars are tall enough to accommodate text.
 */
export const TwoSeriesLabelsMiddle: Story = {
	args: {
		series: [FEMALE, MALE],
		styles: {
			values: {
				show: true,
				anchor: 'middle',
				format: (v: number, name: string) => `${name}: ${v.toFixed(1)} yr`
			}
		} satisfies AxisBasedStylesConfig
	}
};

/**
 * Grouped series with labels anchored to the middle. The `\n` in the format
 * function creates a multi-line label.
 */
export const TwoSeriesGroupedLabelsMiddle: Story = {
	args: {
		series: [FEMALE, MALE],
		styles: {
			values: {
				show: true,
				anchor: 'middle',
				format: (v: number, name: string) => `${name}\n(${v.toFixed(1)} yr)`
			}
		} satisfies AxisBasedStylesConfig
	}
};

/**
 * Stacked series with labels anchored to the middle. The labels are centered
 * within each bar's segment of the stack.
 */
export const TwoSeriesStackedLabelsMiddle: Story = {
	args: {
		series: [FEMALE, MALE],
		styles: {
			values: {
				show: true,
				anchor: 'middle',
				format: (v: number, name: string) => `${name}\n(${v.toFixed(1)} yr)`
			}
		} satisfies AxisBasedStylesConfig,
		transforms: [{ type: 'stackY' as const }]
	}
};

/**
 * Custom text anchor and line anchor - bypasses the `anchor` shorthand and
 * sets svelteplot's low-level `textAnchor` / `lineAnchor` directly. The label
 * is right-aligned (`textAnchor: 'end'`) and sits above the bar
 * (`lineAnchor: 'bottom'`), with a nudge via `dy`.
 */
export const LowLevelTextPlacement: Story = {
	args: {
		series: [FEMALE],
		styles: {
			values: {
				show: true,
				format: (v: number) => `${v.toFixed(1)} yr`,
				fontStyle: {
					textAnchor: 'end',
					lineAnchor: 'bottom',
					dy: -8,
					dx: 0
				}
			}
		} satisfies AxisBasedStylesConfig
	}
};
