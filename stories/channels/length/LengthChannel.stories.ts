import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, POPULATION_SHIFT } from '../../plots/geo/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `length` sizes every vector by a per-row magnitude — see
// `Plots/GeoPlot/Markers/Vector` for the channel itself. This page is
// specifically about `scales.length`: unlike `color`, svelteplot binds
// `length` to exactly one scale shared by every mark in the plot (there's no
// per-mark equivalent), so `scales.length` is plot-level only — `domain`/
// `range` are threaded straight into svelteplot's own `length` scale rather
// than resolved independently.

const meta = {
	title: 'Channels/Length',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: WORLD_COUNTRIES,
		coordinates: { projection: 'mercator' },
		styles: { fill: '#e2e8f0', stroke: '#94a3b8' },
		markers: [
			{
				type: 'vector',
				data: POPULATION_SHIFT,
				x: 'lon',
				y: 'lat',
				length: 'magnitude',
				rotate: 'direction'
			}
		] satisfies GeoMarkersConfig[]
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'GeoPlot' } }
	}
} satisfies Meta<typeof GeoPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No `scales.length` — svelteplot's own auto-fit pixel range, sized to the plot's own bounds. */
export const Default: Story = {};

/** `scales.length.range` sets an explicit `[min, max]` pixel length instead of svelteplot's auto-fit. */
export const CustomRange: Story = {
	args: {
		scales: {
			length: { range: [4, 60] }
		}
	}
};

/** `scales.length.domain` clamps the input range — rows below/above it render at the domain's own min/max length instead of their real, more extreme magnitude. */
export const CustomDomain: Story = {
	args: {
		scales: {
			length: { domain: [0, 15], range: [4, 40] }
		}
	}
};
