import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES_AT_2007 } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `tick` marker (svelteplot's own `TickX`/`TickY`) - a short line per row
// along one axis, a strip plot. Orientation is automatic: `TickX` when `x` is
// the quantitative axis and `y` a band one, `TickY` otherwise. Demoed on an
// empty host with a band category axis (same convention as `Markers/Box`) so
// only the marker itself is on screen. `color` resolves through this
// package's own `cfg.palette` into `stroke`.

const CONTINENT_DOMAIN = ['Americas', 'Europe', 'Asia', 'Africa'];

const meta = {
	title: 'Markers/Tick',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: [],
		x: 'gdp',
		y: 'continent',
		scales: { x: { domain: [0, 50_000] }, y: { type: 'band', domain: CONTINENT_DOMAIN } }
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

/** GDP per capita strip by continent - `TickX`, since `x` is quantitative and `y` a band. */
export const Horizontal: Story = {
	args: {
		markers: [
			{ type: 'tick', data: COUNTRIES_AT_2007, x: 'gdp', y: 'continent' }
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** Swapping the axes flips the marker to `TickY`. */
export const Vertical: Story = {
	args: {
		x: 'continent',
		y: 'gdp',
		scales: { y: { domain: [0, 50_000] }, x: { type: 'band', domain: CONTINENT_DOMAIN } },
		markers: [
			{ type: 'tick', data: COUNTRIES_AT_2007, x: 'continent', y: 'gdp' }
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `color` tints each tick by continent; `tickLength` and `styles` control the rest. */
export const ColoredByContinent: Story = {
	args: {
		markers: [
			{
				type: 'tick',
				data: COUNTRIES_AT_2007,
				x: 'gdp',
				y: 'continent',
				color: 'continent',
				styles: { strokeWidth: 2, strokeOpacity: 0.8 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
