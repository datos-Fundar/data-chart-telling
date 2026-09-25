import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import DotMarker from '$lib/markers/DotMarker.svelte';
import TextMarker from '$lib/markers/TextMarker.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { CountryPoint } from '../data';
import { COUNTRIES } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/ScatterPlot/Markers/Custom',
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
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** `DotMarker` overlays a second, independently-styled dot layer — here, a ring around every country above 82 years of life expectancy, on top of the plot's own dots. */
export const WithDotMarker: Story = {
	args: {
		markers: [
			{
				type: 'component',
				component: DotMarker,
				data: COUNTRIES.filter((d) => d.lifeExpectancy > 82),
				props: {
					x: (d: CountryPoint) => d.gdpPerCapita,
					y: (d: CountryPoint) => d.lifeExpectancy,
					styles: {
						dotRadius: 10,
						dotFill: 'transparent',
						dotStroke: '#111827',
						dotStrokeWidth: 1.5
					}
				}
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `TextMarker` labels a handful of points directly on the plot — here, every country above 82 years of life expectancy. */
export const WithTextMarker: Story = {
	args: {
		markers: [
			{
				type: 'component',
				component: TextMarker,
				data: COUNTRIES.filter((d) => d.lifeExpectancy > 82),
				props: {
					x: (d: CountryPoint) => d.gdpPerCapita,
					y: (d: CountryPoint) => d.lifeExpectancy,
					text: (d: CountryPoint) => d.country,
					styles: { dy: -12, fontSize: 11 }
				}
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
