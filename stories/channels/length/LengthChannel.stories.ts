import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { isAntarcticPart, provinceName } from '../../common/argentinaMainland';
import { ARGENTINA_PROVINCES } from '$datasets/argentina-provinces';
import { WIND_VECTORS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `length` sizes every vector by a per-row magnitude - see
// `Plots/GeoPlot/Markers/Vector` for the channel itself. This page is
// specifically about `scales.length`: unlike `color`, svelteplot binds
// `length` to exactly one scale shared by every mark in the plot (there's no
// per-mark equivalent), so `scales.length` is plot-level only - `domain`/
// `range` are threaded straight into svelteplot's own `length` scale rather
// than resolved independently.

const meta = {
	title: 'Channels/Length',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: ARGENTINA_PROVINCES,
		featureId: provinceName,
		excludeParts: isAntarcticPart,
		coordinates: { projection: { type: 'mercator', domain: 'data' } },
		styles: { fill: '#e2e8f0', stroke: '#94a3b8' },
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

/**
 * `scales.length` maps a magnitude (the `length` field, here wind speed in km/h)
 * to a vector's length in pixels, linearly. `domain` is the input side: the
 * `[min, max]` magnitudes. `range` is the output side: the pixel lengths those
 * two magnitudes get. Left out, the domain is the data's own extent and the
 * range is svelteplot's auto-fit one, sized to the plot - the fastest wind gets
 * the longest vector.
 */
export const Default: Story = {};

/**
 * `range` sets the pixel lengths: the smallest magnitude in the domain is drawn
 * `4` px long and the largest `60` px. The domain is still the data's own, so
 * only the scale of the drawing changes, not which wind looks strongest.
 */
export const CustomRange: Story = {
	args: {
		scales: {
			length: { range: [4, 60] }
		}
	}
};

/**
 * `domain` sets which magnitudes sit at the two ends of the range. Here `0` km/h
 * is a zero-length vector and `40` km/h is `60` px, so a length means the same
 * wind speed in every plot that uses this scale, whatever its own data holds.
 * A magnitude past the domain is not clipped: it keeps going along the same
 * line, longer than the range's end.
 */
export const CustomDomain: Story = {
	args: {
		scales: {
			length: { domain: [0, 40], range: [0, 60] }
		}
	}
};
