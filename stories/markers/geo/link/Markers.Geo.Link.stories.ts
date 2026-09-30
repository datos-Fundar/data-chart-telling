import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, FLIGHT_ROUTES } from '../../../plots/geo/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `link` marker (svelteplot's own `Link`) — a connection between two
// points, `curve: 'auto'` (the default) tracing a great-circle arc on a
// geographic projection instead of a straight line. Geo-only, so `GeoPlot`
// stands in for the empty canvas the rest of `Markers/*` uses — see
// `Plots/GeoPlot/Markers/Link` for the `'linear'` curve and an orthographic
// globe comparison.

const meta = {
	title: 'Markers/Geo/Link',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: WORLD_COUNTRIES,
		coordinates: { projection: 'equal-earth' },
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

/** `x1`/`y1`/`x2`/`y2` are each route's own endpoint fields — the geodesic arc curvature comes from `curve: 'auto'`, the default. */
export const Basic: Story = {
	args: {
		markers: [
			{
				type: 'link',
				data: FLIGHT_ROUTES,
				x1: 'fromLon',
				y1: 'fromLat',
				x2: 'toLon',
				y2: 'toLat',
				styles: { stroke: '#dc2626', strokeWidth: 1.5, strokeOpacity: 0.8 }
			}
		] satisfies GeoMarkersConfig[]
	}
};
