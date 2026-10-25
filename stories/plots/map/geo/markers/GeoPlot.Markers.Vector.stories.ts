import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { isAntarcticPart, provinceName } from '../../../../common/argentinaMainland';
import { ARGENTINA_PROVINCES } from '$datasets/argentina-provinces';
import { WIND_VECTORS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `vector` places arrow/spike shapes at points - mirrors svelteplot's
// `vector/shift-map` example: one arrow per city (here, its prevailing wind -
// see `WIND_VECTORS`), sized by magnitude and oriented by direction.

const meta = {
	title: 'Plots/Map/GeoPlot/Markers/Vector',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: ARGENTINA_PROVINCES,
		featureId: provinceName,
		excludeParts: isAntarcticPart,
		coordinates: { projection: { type: 'mercator', domain: 'data' } },
		scales: { length: { range: [10, 70] } },
		styles: { fill: '#e2e8f0', stroke: '#94a3b8' }
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

// ── Stories ───────────────────────────────────────────────────────────────────

/** Basic arrows - no `shape` set, so each defaults to `'arrow-filled'`. `length`/`rotate` accessors size/orient each arrow from the row's own magnitude/direction fields. */
export const Basic: Story = {
	args: {
		markers: [
			{
				type: 'vector',
				data: WIND_VECTORS,
				x: 'lon',
				y: 'lat',
				length: 'magnitude',
				rotate: 'direction'
			}
		] satisfies GeoMarkersConfig[]
	}
};

/** Open arrow - `shape: 'arrow'` draws a thin stroked shaft with an open arrowhead, instead of the default filled triangle. */
export const OpenArrow: Story = {
	args: {
		markers: [
			{
				type: 'vector',
				data: WIND_VECTORS,
				x: 'lon',
				y: 'lat',
				length: 'magnitude',
				rotate: 'direction',
				shape: 'arrow'
			}
		] satisfies GeoMarkersConfig[]
	}
};

/** Spike shape - `shape: 'spike'` draws a thin triangular spike instead of an arrowhead, anchored at its base. */
export const SpikeShape: Story = {
	args: {
		markers: [
			{
				type: 'vector',
				data: WIND_VECTORS,
				x: 'lon',
				y: 'lat',
				length: 'magnitude',
				rotate: 'direction',
				shape: 'spike',
				anchor: 'start',
				styles: { stroke: '#7c3aed' }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/** Filled arrow, custom color - `shape: 'arrow-filled'` (the default) with a custom fill/stroke instead of the theme's own. */
export const CustomFilledArrow: Story = {
	args: {
		markers: [
			{
				type: 'vector',
				data: WIND_VECTORS,
				x: 'lon',
				y: 'lat',
				length: 'magnitude',
				rotate: 'direction',
				shape: 'arrow-filled',
				styles: { fill: '#0891b2', stroke: '#164e63', strokeWidth: 1 }
			}
		] satisfies GeoMarkersConfig[]
	}
};
