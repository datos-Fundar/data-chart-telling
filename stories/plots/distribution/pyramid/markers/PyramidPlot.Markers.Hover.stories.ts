import type { Meta, StoryObj } from '@storybook/svelte-vite';
import PyramidPlot from '$lib/plots/distribution/pyramid/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { Series } from '$lib/types/plots/data/common';
import { AGE_GROUPS, POPULATION_BY_AGE, type AgeRow } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Distribution/PyramidPlot/Markers/Hover',
	component: PyramidPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 520
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 320, max: 800, step: 20 } },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'PyramidPlot' } }
	}
} satisfies Meta<typeof PyramidPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const DATA = POPULATION_BY_AGE.filter((d) => d.year === 2022);

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * The plot's own hover, with a tooltip: the hovered age group's band, across both sides of the pyramid.
 */
export const Basic: Story = {
	args: {
		tooltip: true,
		data: DATA,
		x: 'share',
		y: 'ageGroup',
		color: 'sex',
		scales: { y: { domain: AGE_GROUPS } },
		markers: [
			{
				type: 'hover'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Dots only - `front: [{ type: 'dot' }]` drops the value labels next to each
 * dot, leaving just the position indicators and the crosshair rule.
 */
export const WithoutLabels: Story = {
	args: {
		data: DATA,
		x: 'share',
		y: 'ageGroup',
		color: 'sex',
		scales: { y: { domain: AGE_GROUPS } },
		markers: [{ type: 'hover', front: [{ type: 'dot' }] }] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Dots and labels only - `back: []` hides the horizontal crosshair rule
 * that's implied by default, so only the dots and their labels are drawn.
 */
export const WithoutRule: Story = {
	args: {
		data: DATA,
		x: 'share',
		y: 'ageGroup',
		color: 'sex',
		scales: { y: { domain: AGE_GROUPS } },
		markers: [{ type: 'hover', back: [] }] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Both crosshair rules - a `rule` along `x` adds a vertical rule at the hovered bar's
 * magnitude on top of the default row rule along `y`, drawing a full
 * crosshair per side.
 */
export const WithBothAxis: Story = {
	args: {
		data: DATA,
		x: 'share',
		y: 'ageGroup',
		color: 'sex',
		scales: { y: { domain: AGE_GROUPS } },
		markers: [
			{
				type: 'hover',
				back: [
					{ type: 'rule', axis: 'x', points: 'active' },
					{ type: 'rule', axis: 'y', points: 'active' }
				]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Custom rule style - the `styles` of a `rule` in `back` set the crosshair stroke. Here the
 * rule renders in red with a solid line and higher opacity.
 */
export const WithCustomRuleStyle: Story = {
	args: {
		data: DATA,
		x: 'share',
		y: 'ageGroup',
		color: 'sex',
		scales: {
			x: { domain: [-6, 6] },
			y: { domain: AGE_GROUPS }
		},
		markers: [
			{
				type: 'hover',
				back: [
					{
						type: 'rule',
						axis: 'y',
						points: 'active',
						styles: {
							stroke: '#e63946',
							strokeOpacity: 0.7,
							strokeWidth: 2,
							strokeDasharray: '6 3'
						}
					}
				]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Label anchored outside the dot - two `text` markers in `front`, each kept to
 * one side of zero by `points`: the female (negative x) label sits to the
 * left of its dot, the male (positive x) label to the right - mirroring the
 * value labels, which sit past each bar's tip by default.
 */
export const LabelOutsideDot: Story = {
	args: {
		data: DATA,
		x: 'share',
		y: 'ageGroup',
		color: 'sex',
		scales: {
			x: { domain: [-6, 6] },
			y: { domain: AGE_GROUPS }
		},
		markers: [
			{
				type: 'hover',
				front: [
					{ type: 'dot' },
					{
						type: 'text',
						points: (p) => Number(p.x) >= 0,
						styles: { textAnchor: 'start', lineAnchor: 'middle', dx: 10, dy: 0 }
					},
					{
						type: 'text',
						points: (p) => Number(p.x) < 0,
						styles: { textAnchor: 'end', lineAnchor: 'middle', dx: -10, dy: 0 }
					}
				]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Series-scoped marker - `series: 'Female'` restricts the hover dot to the
 * female (left) side only. Hovering over the male bars produces no dot even
 * though both sides are rendered.
 *
 * Compare with `Basic` to see the difference.
 */
export const SeriesScoped: Story = {
	args: {
		data: DATA,
		x: 'share',
		y: 'ageGroup',
		color: 'sex',
		scales: { y: { domain: AGE_GROUPS } },
		markers: [
			{
				type: 'hover',
				series: 'Female',
				front: [
					{ type: 'dot' },
					{
						type: 'text',
						points: (p) => Number(p.x) >= 0,
						styles: { textAnchor: 'start', lineAnchor: 'middle', dx: 10, dy: 0 }
					},
					{
						type: 'text',
						points: (p) => Number(p.x) < 0,
						styles: { textAnchor: 'end', lineAnchor: 'middle', dx: -10, dy: 0 }
					}
				]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * A `band` along `y` in `back` - a translucent area across the hovered age
 * group's full row, spanning both sides of the pyramid, alongside the thin
 * crosshair. Defaults to the configuration's neutral gray `hover.area`, the
 * width of the row's band; a band along `x` draws nothing here since
 * pyramid's diverging magnitude axis isn't a band scale.
 */
export const WithHighlightArea: Story = {
	args: {
		data: DATA,
		x: 'share',
		y: 'ageGroup',
		color: 'sex',
		scales: { y: { domain: AGE_GROUPS } },
		markers: [
			{
				type: 'hover',
				back: [
					{ type: 'band', axis: 'y' },
					{ type: 'rule', axis: 'y', points: 'active' }
				]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Hover marker on explicit series - the same unscoped hover marker behaves
 * identically whether the pyramid is built from the data/x/y/color shorthand
 * (see `Basic`) or, as here, an explicit two-series array (see `ExplicitSeries`
 * in the Series stories).
 */
export const FromExplicitSeries: Story = {
	args: {
		series: [
			{
				name: 'Female',
				x: 'share',
				y: 'ageGroup',
				data: DATA.filter((d) => d.sex === 'Female')
			} satisfies Series<AgeRow>,
			{
				name: 'Male',
				x: 'share',
				y: 'ageGroup',
				data: DATA.filter((d) => d.sex === 'Male')
			} satisfies Series<AgeRow>
		],
		scales: { y: { domain: AGE_GROUPS } },
		markers: [
			{
				type: 'hover',
				front: [
					{ type: 'dot' },
					{
						type: 'text',
						points: (p) => Number(p.x) >= 0,
						styles: { textAnchor: 'start', lineAnchor: 'middle', dx: 10, dy: 0 }
					},
					{
						type: 'text',
						points: (p) => Number(p.x) < 0,
						styles: { textAnchor: 'end', lineAnchor: 'middle', dx: -10, dy: 0 }
					}
				]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
