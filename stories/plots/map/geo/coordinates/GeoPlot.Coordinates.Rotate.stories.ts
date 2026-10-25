import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import type { CoordinatesConfig } from '$lib/types/layout/coordinates';
import { WORLD_COUNTRIES } from '$datasets/world-countries';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `coordinates.rotate` enables drag-to-spin-the-globe on an `orthographic`
// projection, claiming the drag gesture from `pan` there.

const meta = {
	title: 'Plots/Map/GeoPlot/Coordinates/Rotate',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: WORLD_COUNTRIES
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		coordinates: { control: false }
	},
	parameters: {
		docs: { source: { name: 'GeoPlot' } }
	}
} satisfies Meta<typeof GeoPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** `coordinates.rotate: true` - drag-to-spin-the-globe on `orthographic`. Only meaningful there. */
export const RotateEnabled: Story = {
	args: {
		coordinates: {
			projection: 'orthographic',
			rotate: true,
			zoom: true
		} satisfies CoordinatesConfig
	}
};
