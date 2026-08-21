import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { CoordinatesConfig } from '$lib/types/layout/coordinates';
import { WORLD_COUNTRIES } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `coordinates.pan` enables drag-to-translate on a 2D projection, independent
// of `zoom`.

const meta = {
	title: 'Plots/GeoPlot/Coordinates/Pan',
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

/** `coordinates.pan: true` — drag-to-translate only, no scroll-zoom. */
export const PanEnabled: Story = {
	args: {
		coordinates: {
			pan: true
		} satisfies CoordinatesConfig
	}
};

/** `pan` + `zoom` together. */
export const PanAndZoomEnabled: Story = {
	args: {
		coordinates: {
			zoom: true,
			pan: true
		} satisfies CoordinatesConfig
	}
};
