import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES, AMERICAS } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/ScatterPlot/Markers/Hover',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: AMERICAS,
		x: 'gdpPerCapita',
		y: 'lifeExpectancy'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Basic hover marker — an in-SVG dot and value label appear at the nearest
 * point as the cursor moves over the plot. No crosshair rule is drawn by
 * default: scatter's `'punctual'` strategy matches a single point, not a
 * shared x/y value, so a rule has nothing meaningful to line up against.
 */
export const Basic: Story = {
	args: {
		markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
	}
};

/** `showLabels: false` keeps just the highlight dot, no text next to it. */
export const WithoutLabels: Story = {
	args: {
		markers: [{ type: 'hover', showLabels: false }] satisfies AxisBasedMarkersConfig[]
	}
};

/** `ruleX`/`ruleY` opt back into crosshair rules at the hovered point's own coordinates. */
export const WithCrosshair: Story = {
	args: {
		markers: [{ type: 'hover', ruleX: true, ruleY: true }] satisfies AxisBasedMarkersConfig[]
	}
};

/** Custom dot/font style — overrides the highlight dot's fill/radius and the label's font. */
export const WithCustomStyle: Story = {
	args: {
		markers: [
			{
				type: 'hover',
				dot: { dotFill: '#dc2626', dotRadius: 10, dotStrokeOpacity: 1, dotStroke: '#7f1d1d' },
				text: { fill: '#7f1d1d', fontWeight: 'bold', fontSize: 14 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** Two regions — the unscoped hover marker responds to whichever cloud's point is nearest the cursor. */
export const GroupedByRegion: Story = {
	args: {
		data: COUNTRIES,
		color: 'region',
		markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Series-scoped marker — `series: 'Americas'` restricts the hover highlight
 * to points in that region only. Hovering the other regions produces no
 * dot or label even though every region is rendered.
 */
export const SeriesScoped: Story = {
	args: {
		data: COUNTRIES,
		color: 'region',
		markers: [{ type: 'hover', series: 'Americas' }] satisfies AxisBasedMarkersConfig[]
	}
};
