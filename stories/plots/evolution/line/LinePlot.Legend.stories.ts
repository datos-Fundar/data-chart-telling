import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedStylesConfig, GapsAwarePlotStylesConfig } from '$lib/types/layout/styles';
import type { GapsConfig } from '$lib/types/plots/gaps';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { LegendSection } from '$lib/types/layout/legend';
import { FEMALE_LIFE, MALE_LIFE, FEMALE_LIFE_GAPS, MALE_LIFE_GAPS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// An interactive `legend` toggles each series: by default a toggled-off series
// dims, or with `interactive.disabled: { mode: 'omit' }` it's removed.

const meta = {
	title: 'Plots/Evolution/LinePlot/Legend',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		scales: { x: { nice: false } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
		series: { control: false },
		styles: { control: false },
		legend: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const SERIES = [
	{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE },
	{ name: 'male', x: 'year', y: 'value', data: MALE_LIFE }
];

const SERIES_WITH_GAPS = [
	{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_GAPS },
	{ name: 'male', x: 'year', y: 'value', data: MALE_LIFE_GAPS }
];

/** One interactive item per sex; `mode` sets what a toggled-off series does. */
function sexLegend(mode: 'dim' | 'hide' | 'omit'): LegendSection[] {
	return [
		{
			type: 'discrete',
			title: 'Sex',
			interactive: { enabled: true, ...(mode !== 'dim' ? { disabled: { mode } } : {}) },
			items: [
				{ name: 'female', label: 'Female', symbol: 'line' },
				{ name: 'male', label: 'Male', symbol: 'line' }
			]
		}
	];
}

const VALUE_LABELS = {
	show: true,
	format: (v: number, name: string) => `${name} (${v.toFixed(1)})`
};

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * A legend-disabled series dims its value label too, not just its line.
 * Toggling "Female" or "Male" off in the legend above fades that
 * series' end-of-line label along with the line itself, instead of leaving
 * the label at full opacity while the line fades.
 */
export const LegendDisabledDimsLabel: Story = {
	args: {
		series: SERIES,
		legend: sexLegend('dim'),
		scales: { x: { nice: false } },
		styles: { values: VALUE_LABELS } satisfies AxisBasedStylesConfig
	}
};

/**
 * A legend-disabled series also dims its gap-fill bridge, not just its real
 * line. Both `female` and `male` have a `styles.gaps.default.middle` bridge
 * filling their internal outage - toggling either off in the legend above
 * should fade its bridge right along with the rest of the line, instead of
 * leaving the dashed bridge at full opacity while the real line fades.
 */
export const LegendDisabledDimsGapBridge: Story = {
	args: {
		series: SERIES_WITH_GAPS,
		legend: sexLegend('dim'),
		scales: { x: { nice: false } },
		styles: {
			gaps: { default: { middle: {} } } satisfies GapsConfig<LineSegmentStyle>
		} satisfies GapsAwarePlotStylesConfig<LineSegmentStyle>
	}
};

/** `interactive.disabled: { mode: 'omit' }` removes a toggled-off series from the plot and rescales the y-axis. */
export const LegendOmitRescalesDomain: Story = {
	args: {
		series: SERIES,
		legend: sexLegend('omit'),
		scales: { x: { nice: false } }
	}
};

/**
 * `interactive.disabled: { mode: 'hide' }` makes a toggled-off series fully
 * transparent, but the y-axis keeps the range it had with every series.
 * Compare with `LegendOmitRescalesDomain`.
 */
export const LegendHideKeepsDomain: Story = {
	args: {
		series: SERIES,
		legend: sexLegend('hide'),
		scales: { x: { nice: false } }
	}
};

/**
 * `styles.values.hoverIsolate: true` dims every other series while the
 * pointer rests over a value label, exactly like toggling that series off
 * in the legend would - reverting on mouse-leave. Hover either series'
 * end-of-line label to see the other line and label fade.
 */
export const HoverIsolate: Story = {
	args: {
		series: SERIES,
		scales: { x: { nice: false } },
		styles: { values: { ...VALUE_LABELS, hoverIsolate: true } } satisfies AxisBasedStylesConfig
	}
};

/**
 * `styles.values.hoverIsolate` also dims a hovered-out series' gap-fill
 * bridge, not just its real line - mirrors `LegendDisabledDimsGapBridge`
 * above, but triggered by hovering a value label instead of clicking the
 * legend. Both `female` and `male` have a `styles.gaps.default.middle`
 * bridge filling their internal outage; hover either series' end-of-line
 * label to see the *other* series' bridge fade along with its line.
 */
export const HoverIsolateDimsGapBridge: Story = {
	args: {
		series: SERIES_WITH_GAPS,
		scales: { x: { nice: false } },
		styles: {
			values: { ...VALUE_LABELS, hoverIsolate: true },
			gaps: { default: { middle: {} } } satisfies GapsConfig<LineSegmentStyle>
		} satisfies GapsAwarePlotStylesConfig<LineSegmentStyle>
	}
};

/** `interactive.disabled: { mode: 'omit' }` combined with value labels and a gap-fill bridge. */
export const LegendOmitDropsLabelAndBridge: Story = {
	args: {
		series: SERIES_WITH_GAPS,
		legend: sexLegend('omit'),
		scales: { x: { nice: false } },
		styles: {
			values: { ...VALUE_LABELS, hoverIsolate: true },
			gaps: { default: { middle: {} } } satisfies GapsConfig<LineSegmentStyle>
		} satisfies GapsAwarePlotStylesConfig<LineSegmentStyle>
	}
};
