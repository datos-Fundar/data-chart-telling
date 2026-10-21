import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import type { GapsConfig } from '$lib/types/plots/gaps';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import { READINGS_WITH_GAPS, OTHER_READINGS_NO_GAPS } from '../data';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Orders month-abbreviation rows by calendar position, not alphabetically - see `LinePlot.Scales`' own `byMonth`. */
function byMonth(a: Record<string, unknown>, b: Record<string, unknown>): number {
	return MONTHS.indexOf(a.category as string) - MONTHS.indexOf(b.category as string);
}

// ── Meta ──────────────────────────────────────────────────────────────────────

// Unlike BarPlot's province datasets (no inherent order), months have a
// natural ascending order, which is what makes `styles.gaps`' interpolation
// worth looking at here - a trend being bridged, not an arbitrary category
// filled in. `READINGS_WITH_GAPS` has three kinds of holes, all `value:
// null`: no reading for Jan-Feb (start), an outage at Jun-Jul (middle), and
// nothing yet for Nov-Dec (end). Without `styles.gaps`, a missing value
// renders no bar at all - `styles.gaps` fills it with a distinctly-styled
// bar at an interpolated value instead, configured independently per zone.
// Like `segments`, it's keyed by series name (`'default'` for every series
// with no named entry of its own).

const meta = {
	title: 'Plots/Ranking/BarPlot/Styles/Gaps',
	component: BarPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		series: [{ name: 'reading', x: 'category', y: 'value', data: READINGS_WITH_GAPS }]
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
			description: 'Data series to render. Missing readings are `null`-valued rows.',
			control: false,
			table: { type: { summary: 'Series<TData>[]' }, category: 'Data' }
		},
		styles: {
			description:
				"`styles.gaps`: series name (or 'default') to that series' start/middle/end gap-fill config.",
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'BarPlot' } }
	}
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Baseline: no fill ────────────────────────────────────────────────────────

/**
 * Without `styles.gaps`, a missing reading simply renders no bar for that
 * category - not the fake zero-height bar a raw `null`/`undefined` value
 * would otherwise produce.
 */
export const NoGapsConfigured: Story = {
	args: {
		scales: { x: { sort: byMonth } } satisfies AxisBasedScalesConfig
	}
};

// ── Default key: gaps that apply to every series ─────────────────────────────

/**
 * `middle` fills the internal outage (Jun-Jul) with a bar interpolated
 * between its two real neighbours. No target needs to be configured - both
 * ends of an internal gap are real data, so the fill is fully determined by
 * the data itself. Default style: the series' own colour, faded.
 */
export const MiddleGapFilled: Story = {
	args: {
		scales: { x: { sort: byMonth } } satisfies AxisBasedScalesConfig,
		styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> }
	}
};

/**
 * `start`/`end` gaps have only one real boundary, so filling them is
 * opt-in: without an explicit `x` target, extrapolating past the real data
 * would imply a measurement that doesn't exist. Here both ends hold the
 * nearest real value flat (no `y` given) - `x`'s value itself isn't used
 * for a category axis, only its presence opts the zone in.
 */
export const LeadingAndTrailingGapsOptIn: Story = {
	args: {
		scales: { x: { sort: byMonth } } satisfies AxisBasedScalesConfig,
		styles: {
			gaps: { default: { start: { x: 0 }, end: { x: 13 } } } satisfies GapsConfig<BarSegmentStyle>
		}
	}
};

/**
 * Every zone accepts its own `style`, so start/middle/end can each read as
 * a visually distinct kind of "not real data".
 */
export const AllThreeZonesDistinctStyles: Story = {
	args: {
		scales: { x: { sort: byMonth } } satisfies AxisBasedScalesConfig,
		styles: {
			gaps: {
				default: {
					start: { x: 0, style: { fillOpacity: 0.25 } },
					middle: { style: { fillOpacity: 0.5 } },
					end: { x: 13, style: { fillOpacity: 0.75 } }
				}
			} satisfies GapsConfig<BarSegmentStyle>
		}
	}
};

// ── Series-aware form ─────────────────────────────────────────────────────────

const TWO_READINGS = [
	{ name: 'reading', x: 'category' as const, y: 'value' as const, data: READINGS_WITH_GAPS },
	{ name: 'other', x: 'category' as const, y: 'value' as const, data: OTHER_READINGS_NO_GAPS }
];

/**
 * A gap entry keyed by series name applies only to that series - `other`
 * has no missing readings, so it's unaffected either way.
 */
export const GapsOnOneSeriesOnly: Story = {
	args: {
		series: TWO_READINGS,
		scales: { x: { sort: byMonth } } satisfies AxisBasedScalesConfig,
		styles: { gaps: { reading: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> }
	}
};

// ── Series layout ─────────────────────────────────────────────────────────────
// A gap-fill bar picks up exactly the same side-by-side slice / stacked span a
// real bar for that row would.

/**
 * Side by side (the default): each series gets its own slice of the
 * category band - a filled gap bar lands in the same slice its series
 * would occupy anywhere else.
 */
export const GroupedLayout: Story = {
	args: {
		series: TWO_READINGS,
		scales: {
			x: { sort: byMonth }
		} satisfies AxisBasedScalesConfig,
		styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> }
	}
};

/**
 * A plot-level `stackY` stacks series cumulatively within each category's
 * band - a series stacked *above* a gap-owning one keeps a correct baseline
 * whether that gap is filled (contributes its interpolated value to the
 * stack) or left unfilled (contributes nothing).
 */
export const StackedLayout: Story = {
	args: {
		series: TWO_READINGS,
		scales: {
			x: { sort: byMonth }
		} satisfies AxisBasedScalesConfig,
		transforms: [{ type: 'stackY' as const }],
		styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> }
	}
};

// ── Global configuration ──────────────────────────────────────────────────────

/**
 * A zone with no `style` of its own falls back to `cfg.bar.gap` - set via
 * `setConfiguration`, the same way `cfg.line.gap` backs `LinePlot`'s own
 * gap-fill default.
 */
export const GlobalConfigDefault: Story = {
	args: {
		scales: { x: { sort: byMonth } } satisfies AxisBasedScalesConfig,
		styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> }
	},
	parameters: {
		docs: {
			description: {
				story:
					"Run `setConfiguration({ bar: { gap: { fillOpacity: 0.2 } } })` to change every unfilled zone's default look at once."
			}
		}
	}
};
