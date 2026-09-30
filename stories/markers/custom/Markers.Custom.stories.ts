import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import PeakMarker from '$lib/markers/PeakMarker.svelte';
import type { LineMarkersConfig } from '$lib/types/markers/line';
import { FEMALE_LIFE_EXPECTANCY } from '../../plots/line/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Three marker kinds that need real series data (or real pointer
// interaction) to mean anything, so they don't fit the empty-canvas pattern
// the rest of `Markers/*` uses. `delta` is LinePlot's own kind-specific
// marker (`LineMarkersConfig` only) — see `Plots/LinePlot/Markers/Deltas`
// for every axis/target combination. `peak` is a hand-authored `component`
// marker (`PeakMarker.svelte`) — see `Plots/LinePlot/Markers/Custom` for it
// alongside `DotMarker`/`TextMarker` and segment-scoped examples. `hover`
// needs real points to crosshair over — see `Plots/*/Markers/Hover` for
// every plot kind's own flavor (dot+label, area highlight, etc.).

const meta = {
	title: 'Markers/Custom',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 440,
		series: [{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY }]
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		series: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A `delta` marker computes and labels the gap between a series and a fixed axis value, at one X. */
export const Delta: Story = {
	args: {
		markers: [
			{
				type: 'delta',
				axis: 'x',
				at: 2018,
				from: { type: 'series', series: 'female' },
				to: { type: 'axis', value: 80 },
				fontStyle: { dx: 16, lineAnchor: 'middle' }
			}
		] satisfies LineMarkersConfig[]
	}
};

/** `PeakMarker`, a `component` marker, finds and labels the series' own max point — `mode: 'min'` finds the lowest instead. */
export const Peak: Story = {
	args: {
		markers: [
			{
				type: 'component',
				series: 'female',
				component: PeakMarker,
				props: { xProp: 'year', yProp: 'value', mode: 'max', label: 'Max' }
			}
		] satisfies LineMarkersConfig[]
	}
};

/** A `hover` marker draws an in-SVG dot, value label, and crosshair rule at the nearest point as the cursor moves — no floating HTML tooltip involved. */
export const Hover: Story = {
	args: {
		markers: [{ type: 'hover' }] satisfies LineMarkersConfig[]
	}
};
