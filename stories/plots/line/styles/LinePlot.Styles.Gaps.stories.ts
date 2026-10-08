import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { GapsConfig } from '$lib/types/plots/gaps';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { EasingName } from '$lib/types/misc/easing';
import {
	FEMALE_LIFE_EXPECTANCY_WITH_GAPS,
	MALE_LIFE_EXPECTANCY_WITH_GAPS,
	MALE_LIFE_EXPECTANCY
} from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────

// `FEMALE_LIFE_EXPECTANCY_WITH_GAPS` - the same series every other LinePlot
// story already uses - has three holes, all `value: null` (the same
// convention svelteplot's own Line mark already uses to break a line): the
// first year (start), one internal year (middle), and the last year (end).
// Without `styles.gaps`, the line already breaks visually at every hole -
// `styles.gaps` fills the break with an interpolated, distinctly-styled
// bridge, configured independently per zone. Like `segments`, it's keyed by
// series name (`'default'` for every series with no named entry of its own).

const meta = {
	title: 'Plots/LinePlot/Styles/Gaps',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		series: [{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY_WITH_GAPS }]
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
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Baseline: no fill ────────────────────────────────────────────────────────

/**
 * Without `styles.gaps`, missing rows just break the line - svelteplot's own
 * Line mark already skips `null`/`undefined`/`NaN` values (the same
 * convention gap detection relies on). No bridge is drawn anywhere.
 */
export const NoGapsConfigured: Story = {
	args: {}
};

// ── Default key: gaps that apply to every series ─────────────────────────────
// Use `{ default: {...} }` to apply the same zone config to every series -
// exactly like `segments`' own `default` key.

/**
 * `middle` bridges the internal outage (2012, bounded by real readings at
 * 2010 and 2014) between its two real boundary points. No target needs to
 * be configured - both ends of an internal gap are real data, so the bridge
 * is fully determined by the data itself. Default style: the series' own
 * colour, dashed and slightly muted.
 */
export const MiddleGapFilled: Story = {
	args: {
		styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<LineSegmentStyle> }
	}
};

/**
 * `start`/`end` gaps have only one real boundary, so filling them is opt-in:
 * without an explicit `x` target, extrapolating past the real data would
 * imply a measurement that doesn't exist. Here both ends are configured to
 * extend two years past the real domain (2006 and 2022), holding the
 * nearest real value flat (no `y` given).
 */
export const LeadingAndTrailingGapsOptIn: Story = {
	args: {
		styles: {
			gaps: {
				default: { start: { x: 2006 }, end: { x: 2022 } }
			} satisfies GapsConfig<LineSegmentStyle>
		}
	}
};

// ── All three zones, independently styled ────────────────────────────────────

/**
 * Every zone accepts its own `style` (and `interpolate`), so start/middle/end
 * can each read as a visually distinct kind of "not real data": a muted
 * dotted lead-in, a dashed mid-series estimate, and a lighter, thinner
 * trailing projection.
 */
export const AllThreeZonesDistinctStyles: Story = {
	args: {
		styles: {
			gaps: {
				default: {
					start: {
						x: 2006,
						style: { stroke: { stroke: '#9333ea', strokeDasharray: '1 4', strokeLinecap: 'round' } }
					},
					middle: {
						style: { stroke: { strokeDasharray: '6 4', strokeOpacity: 0.7 } }
					},
					end: {
						x: 2022,
						style: { stroke: { strokeWidth: 1.5, strokeOpacity: 0.4, strokeDasharray: '2 3' } }
					}
				}
			} satisfies GapsConfig<LineSegmentStyle>
		}
	}
};

// ── Dots at the bridge endpoints ──────────────────────────────────────────────

/**
 * Setting `style.dots` on a zone marks its bridge's two endpoints - mirrors
 * how a `LineSegmentStyle` adds dots anywhere else in the plot. Dots are
 * drawn only at the run's real/target endpoints, not along every sampled
 * bridge point.
 */
export const DotsAtBridgeEndpoints: Story = {
	args: {
		styles: {
			gaps: {
				default: {
					middle: { style: { dots: { dotRadius: 5, dotSymbol: 'circle' } } },
					end: { x: 2022, style: { dots: { dotRadius: 5, dotSymbol: 'triangle' } } }
				}
			} satisfies GapsConfig<LineSegmentStyle>
		}
	}
};

// ── Interpolation ─────────────────────────────────────────────────────────────

/**
 * `interpolate` eases the bridge's Y value between its two endpoints instead
 * of a straight line - the same named easings `TimelineLayout` uses
 * elsewhere in this library. Use the **Interpolate** control to compare
 * `linear` (default) against an eased curve on the middle bridge.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const InterpolatedBridge: any = {
	args: {
		interpolate: 'quadOut'
	},
	argTypes: {
		interpolate: {
			control: { type: 'select' },
			options: [
				'linear',
				'quadIn',
				'quadOut',
				'cubicIn',
				'cubicOut',
				'quartIn',
				'quartOut',
				'expoOut'
			],
			description: "Easing applied to the middle bridge's Y value.",
			table: { category: 'Interpolation' }
		}
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	render: (args: any) => ({
		Component: LinePlot,
		props: {
			series: args.series,
			width: args.width,
			height: args.height,
			styles: {
				gaps: {
					default: {
						middle: {
							interpolate: args.interpolate as EasingName,
							style: { stroke: { strokeDasharray: '6 4' }, dots: { dotRadius: 4 } }
						}
					}
				} satisfies GapsConfig<LineSegmentStyle>
			}
		}
	})
};

// ── Series-aware form ─────────────────────────────────────────────────────────
// Keys in the record target exactly one series; series with no entry are left
// unfilled (or fall back to `default`, if one is present).

const FEMALE_AND_MALE_NO_GAPS = [
	{
		name: 'female',
		x: 'year' as const,
		y: 'value' as const,
		data: FEMALE_LIFE_EXPECTANCY_WITH_GAPS
	},
	{ name: 'male', x: 'year' as const, y: 'value' as const, data: MALE_LIFE_EXPECTANCY }
];

const FEMALE_AND_MALE_BOTH_WITH_GAPS = [
	{
		name: 'female',
		x: 'year' as const,
		y: 'value' as const,
		data: FEMALE_LIFE_EXPECTANCY_WITH_GAPS
	},
	{ name: 'male', x: 'year' as const, y: 'value' as const, data: MALE_LIFE_EXPECTANCY_WITH_GAPS }
];

/**
 * A gap entry keyed by series name applies only to that series.
 *
 * Here only `female` gets its middle gap filled - `male` has no missing
 * readings of its own here, so it's unaffected either way, exactly as
 * `LinePlot.Segments`' `SegmentsOnOneSeriesOnly` scopes a style to one
 * series regardless of the other series' own values.
 */
export const GapsOnOneSeriesOnly: Story = {
	args: {
		series: FEMALE_AND_MALE_NO_GAPS,
		styles: {
			gaps: {
				female: { middle: { style: { stroke: { strokeDasharray: '6 4' } } } }
			} satisfies GapsConfig<LineSegmentStyle>
		}
	}
};

/**
 * `default` supplies a shared baseline (fill every zone, dashed) while a
 * named entry overrides just one zone for that series - at zone
 * granularity, not by replacing the whole config. `male` (whose only hole
 * is a single middle year) keeps `default`'s treatment; `female` keeps
 * `default`'s `start`/`end` but gets its own colour on `middle`.
 */
export const DefaultWithPerSeriesOverride: Story = {
	args: {
		series: FEMALE_AND_MALE_BOTH_WITH_GAPS,
		styles: {
			gaps: {
				default: { start: { x: 2006 }, middle: {}, end: { x: 2022 } },
				female: { middle: { style: { stroke: { stroke: '#16a34a', strokeDasharray: '2 3' } } } }
			} satisfies GapsConfig<LineSegmentStyle>
		}
	}
};

// ── Multiple series, uniform treatment ────────────────────────────────────────

/**
 * `default` applies to every series in the plot uniformly - here a second
 * series with its own, different hole gets the same middle-gap treatment
 * as the first, with no per-series entry needed.
 */
export const MultipleSeries: Story = {
	args: {
		series: FEMALE_AND_MALE_BOTH_WITH_GAPS,
		styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<LineSegmentStyle> }
	}
};
