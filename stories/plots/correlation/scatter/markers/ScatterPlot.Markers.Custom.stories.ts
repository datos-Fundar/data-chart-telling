import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { type CountryYearRow, COUNTRIES_AT_2007 } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Correlation/ScatterPlot/Markers/Custom',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: COUNTRIES_AT_2007,
		x: 'gdp',
		y: 'life',
		color: 'continent'
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

/** `DotMarker` overlays a second, independently-styled dot layer - here, a ring around every country above 82 years of life expectancy, on top of the plot's own dots. */
export const WithDotMarker: Story = {
	args: {
		markers: [
			{
				type: 'dot',
				data: COUNTRIES_AT_2007.filter((d) => d.life > 82),
				x: (d: CountryYearRow) => d.gdp,
				y: (d: CountryYearRow) => d.life,
				styles: {
					dotRadius: 10,
					dotFill: 'transparent',
					dotStroke: '#111827',
					dotStrokeWidth: 1.5
				}
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `TextMarker` labels a handful of points directly on the plot - here, every country above 82 years of life expectancy. */
export const WithTextMarker: Story = {
	args: {
		markers: [
			{
				type: 'text',
				data: COUNTRIES_AT_2007.filter((d) => d.life > 82),
				x: (d: CountryYearRow) => d.gdp,
				y: (d: CountryYearRow) => d.life,
				text: (d: CountryYearRow) => d.country,
				styles: { dy: -12, fontSize: 11 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
