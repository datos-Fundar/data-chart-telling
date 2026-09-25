import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import { FEMALE_LIFE_EXPECTANCY_BY_PROVINCE, LIFE_EXPECTANCY_BY_PROVINCE } from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/BarPlot/Segments',
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
			control: false,
			table: { type: { summary: 'Series<TData>[]' }, category: 'Data' }
		},
		segments: {
			description: 'Segment styling rules.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'BarPlot' } }
	}
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Default key: segments that apply to every series ──────────────────────────

/**
 * Simplest form: one series-keyed Segment highlights a single area, and a
 * `default` catch-all styles everything else.
 *
 * The series key (`'female_life_expectancy'`) highlights Tucumán only; every
 * other province — including the Buenos Aires–Santa Fe range — isn't matched
 * by anything series-specific, so it falls through to the `default` catch-all's
 * dimmed style.
 */
export const HighlightedProvincesSegment: Story = {
	args: {
		series: [
			{
				name: 'female_life_expectancy',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			}
		],
		segments: {
			female_life_expectancy: [
				{
					areas: [
						{
							x: {
								from: 'Tucumán',
								to: 'Tucumán'
							}
						}
					],
					styles: {
						fillOpacity: 1.0
					}
				}
			],
			default: [
				{
					styles: {
						fillOpacity: 0.3
					}
				}
			]
		} satisfies SegmentsConfig<BarSegmentStyle>
	}
};

/**
 * Multiple bars with different opacity — highlights the highest and lowest
 * provinces with higher opacity while dimming the rest.
 */
export const MultipleAreasOneSegment: Story = {
	args: {
		series: [
			{
				name: 'female_life_expectancy',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			}
		],
		segments: {
			default: [
				{
					areas: [
						{ x: { from: 'Buenos Aires', to: 'Buenos Aires' } },
						{ x: { from: 'Tucumán', to: 'Tucumán' } }
					],
					styles: { fillOpacity: 0.9 }
				},
				{
					styles: { fillOpacity: 0.3 }
				}
			]
		} satisfies SegmentsConfig<BarSegmentStyle>
	}
};

/**
 * Two Segments with different colors targeting different provinces.
 *
 * - Segment 1: Buenos Aires to Santa Fe — high opacity.
 * - Segment 2: Rest — reduced opacity.
 */
export const TwoSegmentsDifferentStyles: Story = {
	args: {
		series: [
			{
				name: 'female_life_expectancy',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			}
		],
		segments: {
			default: [
				{
					areas: [{ x: { from: 'Buenos Aires', to: 'Santa Fe' } }],
					styles: { fill: 'tomato', fillOpacity: 0.85 }
				},
				{
					styles: { fillOpacity: 0.4 }
				}
			]
		} satisfies SegmentsConfig<BarSegmentStyle>
	}
};

/**
 * Same two-segment structure on two series (female and male).
 *
 * `default` segments apply identically to every series in the plot.
 */
export const TwoSegmentsOnAllSeries: Story = {
	args: {
		data: LIFE_EXPECTANCY_BY_PROVINCE,
		x: 'province',
		y: 'value',
		color: 'sex',
		segments: {
			default: [
				{
					areas: [{ x: { from: 'Buenos Aires', to: 'Santa Fe' } }],
					styles: { fillOpacity: 0.85 }
				},
				{
					styles: { fillOpacity: 0.4 }
				}
			]
		} satisfies SegmentsConfig<BarSegmentStyle>
	}
};

// ── Series-aware form ─────────────────────────────────────────────────────────

/**
 * Segments keyed by series name apply only to the named series.
 *
 * Here, highlighting is scoped explicitly to `'female'`. The male bars are
 * unaffected — the record key is the deciding factor.
 */
export const SegmentsOnOneSeriesOnly: Story = {
	args: {
		data: LIFE_EXPECTANCY_BY_PROVINCE,
		x: 'province',
		y: 'value',
		color: 'sex',
		segments: {
			female: [
				{
					areas: [{ x: { from: 'Buenos Aires', to: 'Santa Fe' } }],
					styles: { fillOpacity: 0.9 }
				},
				{
					styles: { fillOpacity: 0.3 }
				}
			]
		} satisfies SegmentsConfig<BarSegmentStyle>
	}
};

/**
 * Custom fills for different series — female bars are highlighted with a
 * range-specific opacity, male bars get a custom color.
 */
export const CustomFillsPerSeries: Story = {
	args: {
		data: LIFE_EXPECTANCY_BY_PROVINCE,
		x: 'province',
		y: 'value',
		color: 'sex',
		segments: {
			female: [
				{
					areas: [{ x: { from: 'Buenos Aires', to: 'Formosa' } }],
					styles: { fillOpacity: 0.8 }
				}
			],
			male: [
				{
					areas: [{ x: { from: 'Buenos Aires', to: 'Formosa' } }],
					styles: { fill: '#1971c2', fillOpacity: 0.85 }
				}
			]
		} satisfies SegmentsConfig<BarSegmentStyle>
	}
};
