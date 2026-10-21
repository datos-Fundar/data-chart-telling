import type { Meta, StoryObj } from '@storybook/svelte-vite';
import PyramidPlot from '$lib/plots/distribution/pyramid/Plot.svelte';
import type { GapsConfig } from '$lib/types/plots/gaps';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import {
	AGE_GROUPS,
	POPULATION_PYRAMID,
	FEMALE_2022_WITH_GAPS
} from '../../../../data/population-pyramid';

// ── Meta ──────────────────────────────────────────────────────────────────────

// `FEMALE_2022_WITH_GAPS` - the same 2022 slice every other PyramidPlot
// story already uses - has three holes, all `pct: null`: the first two age
// groups (start), an internal pair (middle), and the last two (end).
// Without `styles.gaps`, a missing value renders no bar at all -
// `styles.gaps` fills it with a distinctly-styled bar at an interpolated
// magnitude instead, on whichever side ('Female'/'Male') that series
// already renders.

const meta = {
	title: 'Plots/Distribution/PyramidPlot/Styles/Gaps',
	component: PyramidPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 520,
		series: [{ name: 'Female', x: 'pct', y: 'ageGroup', data: FEMALE_2022_WITH_GAPS }],
		scales: { y: { domain: AGE_GROUPS } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 320, max: 800, step: 20 } },
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
		docs: { source: { name: 'PyramidPlot' } }
	}
} satisfies Meta<typeof PyramidPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Baseline: no fill ────────────────────────────────────────────────────────

/**
 * Without `styles.gaps`, a missing reading simply renders no bar for that
 * category, on either side of the diverging baseline.
 */
export const NoGapsConfigured: Story = {
	args: {}
};

// ── Default key: gaps that apply to every series ─────────────────────────────

/**
 * `middle` fills the internal outage (40-44 to 45-49, bounded by real
 * readings for 35-39 and 50-54) with a bar interpolated between its two
 * real neighbours.
 */
export const MiddleGapFilled: Story = {
	args: {
		styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> }
	}
};

/**
 * `start`/`end` gaps are opt-in - an explicit `x` (its presence, not its
 * value, since the category axis isn't continuous) is required before a
 * leading/trailing hole gets filled.
 */
export const LeadingAndTrailingGapsOptIn: Story = {
	args: {
		styles: {
			gaps: { default: { start: { x: 0 }, end: { x: 0 } } } satisfies GapsConfig<BarSegmentStyle>
		}
	}
};

// ── Series-aware form, both sides ─────────────────────────────────────────────

const FEMALE_AND_MALE_2022 = [
	{ name: 'Female', x: 'pct' as const, y: 'ageGroup' as const, data: FEMALE_2022_WITH_GAPS },
	{
		name: 'Male',
		x: 'pct' as const,
		y: 'ageGroup' as const,
		data: POPULATION_PYRAMID.filter((d) => d.year === 2022 && d.sex === 'Male')
	}
];

/**
 * A gap entry keyed by series name applies only to that series - here only
 * `Female` (left side) gets its middle gap filled; `Male` (right side,
 * no missing readings of its own) is unaffected either way.
 */
export const GapsOnOneSeriesOnly: Story = {
	args: {
		series: FEMALE_AND_MALE_2022,
		styles: { gaps: { Female: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> }
	}
};

// ── Global configuration ──────────────────────────────────────────────────────

/**
 * A zone with no `style` of its own falls back to `cfg.pyramid.gap` - set
 * via `setConfiguration`, mirroring `cfg.bar.gap`/`cfg.line.gap`.
 */
export const GlobalConfigDefault: Story = {
	args: {
		styles: { gaps: { default: { middle: {} } } satisfies GapsConfig<BarSegmentStyle> }
	},
	parameters: {
		docs: {
			description: {
				story:
					"Run `setConfiguration({ pyramid: { gap: { fillOpacity: 0.2 } } })` to change every unfilled zone's default look at once."
			}
		}
	}
};
