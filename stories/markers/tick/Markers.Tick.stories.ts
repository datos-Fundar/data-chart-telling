import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES } from '../../plots/scatter/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `tick` marker (svelteplot's own `TickX`/`TickY`) — a short line per row
// along one axis, a strip plot. Orientation is automatic: `TickX` when `x` is
// the quantitative axis and `y` a band one, `TickY` otherwise. Demoed on an
// empty host with a band category axis (same convention as `Markers/Box`) so
// only the marker itself is on screen. `color` resolves through this
// package's own `cfg.palette` into `stroke`.

const REGION_DOMAIN = ['Americas', 'Europe', 'Asia', 'Africa'];

const meta = {
	title: 'Markers/Tick',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: [],
		x: 'gdpPerCapita',
		y: 'region',
		scales: { x: { domain: [0, 110] }, y: { type: 'band', domain: REGION_DOMAIN } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** GDP per capita strip by region — `TickX`, since `x` is quantitative and `y` a band. */
export const Horizontal: Story = {
	args: {
		markers: [
			{ type: 'tick', data: COUNTRIES, x: 'gdpPerCapita', y: 'region' }
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** Swapping the axes flips the marker to `TickY`. */
export const Vertical: Story = {
	args: {
		x: 'region',
		y: 'gdpPerCapita',
		scales: { y: { domain: [0, 110] }, x: { type: 'band', domain: REGION_DOMAIN } },
		markers: [
			{ type: 'tick', data: COUNTRIES, x: 'region', y: 'gdpPerCapita' }
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `color` tints each tick by region; `tickLength` and `styles` control the rest. */
export const ColoredByRegion: Story = {
	args: {
		markers: [
			{
				type: 'tick',
				data: COUNTRIES,
				x: 'gdpPerCapita',
				y: 'region',
				color: 'region',
				styles: { strokeWidth: 2, strokeOpacity: 0.8 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
