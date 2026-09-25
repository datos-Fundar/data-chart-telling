import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { ScatterSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import { COUNTRIES } from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/ScatterPlot/Segments',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: COUNTRIES,
		x: 'gdpPerCapita',
		y: 'lifeExpectancy',
		color: 'region'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
		data: { control: false },
		segments: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * `default` targets every series — an area covering the high-GDP tail
 * (x ≥ 40) gets a distinct symbol and a stroke ring, regardless of region.
 */
export const AreaAcrossAllSeries: Story = {
	args: {
		segments: {
			default: [
				{
					areas: [{ x: { from: 40 } }],
					styles: { dotSymbol: 'triangle', dotStroke: '#111827', dotStrokeWidth: 1.5 }
				}
			]
		} satisfies SegmentsConfig<ScatterSegmentStyle>
	}
};

/**
 * Per-series catch-alls set each region's baseline color explicitly instead
 * of relying on the default palette — useful when a color needs to carry
 * meaning across multiple charts (e.g. a fixed region palette).
 */
export const PerSeriesColor: Story = {
	args: {
		segments: {
			Americas: [{ styles: { dotFill: '#0891b2' } }],
			Europe: [{ styles: { dotFill: '#9333ea' } }],
			Asia: [{ styles: { dotFill: '#ca8a04' } }],
			Africa: [{ styles: { dotFill: '#16a34a' } }]
		} satisfies SegmentsConfig<ScatterSegmentStyle>
	}
};

/**
 * Two Y-constrained areas flag life-expectancy outliers directly: below 65
 * in red, above 82 in green — independent of each series' own color.
 *
 * `default` keeps this cross-cutting rule on every region at once, rather
 * than repeating it per series.
 */
export const OutlierBands: Story = {
	args: {
		segments: {
			default: [
				{ areas: [{ y: { to: 65 } }], styles: { dotFill: '#dc2626', dotStrokeWidth: 0 } },
				{ areas: [{ y: { from: 82 } }], styles: { dotFill: '#16a34a', dotStrokeWidth: 0 } }
			]
		} satisfies SegmentsConfig<ScatterSegmentStyle>
	}
};

/**
 * Catch-all as a muted baseline that an area-specific segment overrides —
 * every point starts semi-transparent; the high-income, long-life quadrant
 * (x ≥ 30 AND y ≥ 80) is highlighted at full opacity with a larger radius.
 * The area segment inherits `dotFill` from the catch-all automatically,
 * since it only overrides `dotFillOpacity`/`dotRadius`.
 */
export const CatchAllWithHighlight: Story = {
	args: {
		segments: {
			default: [
				{ styles: { dotFill: '#6b7280', dotFillOpacity: 0.35 } },
				{
					areas: [{ x: { from: 30 }, y: { from: 80 } }],
					styles: { dotFillOpacity: 1, dotRadius: 8 }
				}
			]
		} satisfies SegmentsConfig<ScatterSegmentStyle>
	}
};
