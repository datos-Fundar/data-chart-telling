import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES_AT_2007 } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Correlation/ScatterPlot/Markers/Hover',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: COUNTRIES_AT_2007,
		x: 'gdp',
		y: 'life'
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
 * The plot's own hover, with a tooltip: a crosshair along both axes through the hovered point, and its
 * value - the point is a dot already.
 */
export const Basic: Story = {
	args: {
		tooltip: true,
		markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
	}
};

/** `front: [{ type: 'dot' }]` keeps just the highlight dot, no text next to it. */
export const WithoutLabels: Story = {
	args: {
		markers: [{ type: 'hover', front: [{ type: 'dot' }] }] satisfies AxisBasedMarkersConfig[]
	}
};

/** A `rule` along each axis in `back` draws crosshair rules at the hovered point's own coordinates. */
export const WithCrosshair: Story = {
	args: {
		markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
	}
};

/** Custom dot/font style - overrides the highlight dot's fill/radius and the label's font. */
export const WithCustomStyle: Story = {
	args: {
		markers: [
			{
				type: 'hover',
				front: [
					{
						type: 'dot',
						styles: { dotFill: '#dc2626', dotRadius: 10, dotStrokeOpacity: 1, dotStroke: '#7f1d1d' }
					},
					{ type: 'text', styles: { fill: '#7f1d1d', fontWeight: 'bold', fontSize: 14 } }
				]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** Every continent - the unscoped hover marker responds to whichever cloud's point is nearest the cursor. */
export const GroupedByContinent: Story = {
	args: {
		data: COUNTRIES_AT_2007,
		color: 'continent',
		markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Series-scoped marker - `series: 'Americas'` restricts the hover highlight
 * to points in that continent only. Hovering the other continents produces no
 * dot or label even though every continent is rendered.
 */
export const SeriesScoped: Story = {
	args: {
		data: COUNTRIES_AT_2007,
		color: 'continent',
		markers: [{ type: 'hover', series: 'Americas' }] satisfies AxisBasedMarkersConfig[]
	}
};
