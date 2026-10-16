import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES } from '../../plots/geo/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `sphere` marker (svelteplot's own `Sphere`) - the outer globe outline,
// which only reads clearly on a hemisphere-style projection like
// `orthographic` (on `mercator` it's just the frame's own rectangle).
// `behind: true` is what lets its `fill` read as ocean-colored background
// rather than an opaque layer painted over every country - see
// `Markers/Graticule`'s `SphereOutline` story for `behind`'s
// own doc comment.

const meta = {
	title: 'Markers/Sphere',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: WORLD_COUNTRIES,
		coordinates: {
			projection: { type: 'orthographic', rotate: [60, 20] },
			zoom: true,
			rotate: true
		}
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

/** `behind: true` draws the sphere's fill under the countries - otherwise it'd paint over every one of them. Drag the globe to rotate it. */
export const Basic: Story = {
	args: {
		markers: [
			{
				type: 'sphere',
				behind: true,
				styles: { fill: '#eff6ff', stroke: 'currentColor', strokeWidth: 1 }
			}
		] satisfies GeoMarkersConfig[]
	}
};
