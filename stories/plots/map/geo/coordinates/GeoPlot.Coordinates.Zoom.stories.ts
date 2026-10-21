import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import type { CoordinatesConfig } from '$lib/types/layout/coordinates';
import { WORLD_COUNTRIES } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `coordinates.zoom` enables scroll/pinch-to-zoom, independent of `pan`/`rotate`.

const meta = {
	title: 'Plots/Map/GeoPlot/Coordinates/Zoom',
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

/** `coordinates.zoom: true` - scroll/pinch-to-zoom only, no drag. See `Pan/PanEnabled`/`Pan/PanAndZoomEnabled`. */
export const ZoomEnabled: Story = {
	args: {
		coordinates: {
			zoom: true
		} satisfies CoordinatesConfig
	}
};

/** Zoom with limits - `coordinates.zoom.min`/`max` clamp how far in/out the scroll wheel can go. */
export const ZoomWithLimits: Story = {
	args: {
		coordinates: {
			zoom: { min: 1, max: 4 }
		} satisfies CoordinatesConfig
	}
};
