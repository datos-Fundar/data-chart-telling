import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { LIFE_EXPECTANCY_BY_PROVINCE_SEX, type ProvinceSexCell } from '../../../plots/heatmap/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `cell` marker's own `color` + `scales.color` is independent of the
// plot's own channel (see `Channels/Color/Plot Level/Heatmap`). `CellMarkerConfig`
// is normally built internally by HeatmapPlot's own "markers" phase — every
// cell you'd normally see is already one — but it's a regular entry in the
// `markers` prop like any other marker, so a hand-authored one works the same
// way. Here the plot's own cells render flat (no color channel); the
// hand-authored `cell` marker overlays the same grid at the same size
// (`inset: 0.5`, matching the base cells'), now colored by its own ramp.

const meta = {
	title: 'Channels/Color/Marker Level/Cell',
	component: HeatmapPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420,
		data: LIFE_EXPECTANCY_BY_PROVINCE_SEX,
		x: 'province',
		y: 'sex',
		// The base cells carry no `color` of their own here, so their default
		// value-label formatter has nothing to read — hidden to avoid a
		// confusing "NaN" under the marker's own colored overlay.
		styles: { values: { show: false } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'HeatmapPlot' } }
	}
} satisfies Meta<typeof HeatmapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The `cell` marker's own `color: 'value'` accessor drives its fill — the
 * default palette's own continuous ramp, since the marker sets no `scales`
 * of its own. `fill` is still required by `CellMarkerConfig`'s own shape,
 * but `color` takes priority over it whenever it resolves to a value.
 */
export const Default: Story = {
	args: {
		markers: [
			{
				type: 'cell',
				x: (d) => (d as ProvinceSexCell).province,
				y: (d) => (d as ProvinceSexCell).sex,
				fill: () => '#e5e7eb',
				color: 'value',
				inset: 0.5
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** The marker's own `scales.color.scheme` swaps its ramp, independent of the plot's own (unset here). */
export const CustomScheme: Story = {
	args: {
		markers: [
			{
				type: 'cell',
				x: (d) => (d as ProvinceSexCell).province,
				y: (d) => (d as ProvinceSexCell).sex,
				fill: () => '#e5e7eb',
				color: 'value',
				scales: { color: { domain: [70, 85], scheme: 'viridis' } },
				inset: 0.5
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
