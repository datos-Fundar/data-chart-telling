import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { FEMALE_PROVINCE_VALUES, type ProvinceRow } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `bar` marker's own `color` + `scales.color` is independent of the plot's
// own channel (see `Channels/Color/Plot Level/Bar`). `BarMarkerConfig`
// (`role: 'segment'`) is normally built internally by BarPlot's own "markers"
// phase - every real bar you'd see is already one - this is the first
// hand-authored use of it in this codebase, so `y1`/`y2` are raw data-domain
// values (not pixels), same as the real bars: `<BarY>` scales them itself.
// The plot's own bars render flat (no color channel); the hand-authored
// `bar` marker overlays a narrower bar inside the same category band
// (`insetLeft`/`insetRight: 0.3`), colored by its own ramp.

const meta = {
	title: 'Channels/Color/Marker Level/Bar',
	component: BarPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: FEMALE_PROVINCE_VALUES,
		x: 'province',
		y: 'value'
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'BarPlot' } }
	}
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The `bar` marker's own `color: 'value'` accessor drives its fill - the
 * default palette's own continuous ramp, since the marker sets no `scales`
 * of its own.
 */
export const Default: Story = {
	args: {
		markers: [
			{
				type: 'bar',
				role: 'segment',
				isHorizontal: false,
				x: (d) => (d as ProvinceRow).province,
				y1: () => 0,
				y2: (d) => (d as ProvinceRow).value,
				insetLeft: 0.3,
				insetRight: 0.3,
				color: 'value'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** The marker's own `scales.color.scheme` swaps its ramp, independent of the plot's own (unset here). */
export const CustomScheme: Story = {
	args: {
		markers: [
			{
				type: 'bar',
				role: 'segment',
				isHorizontal: false,
				x: (d) => (d as ProvinceRow).province,
				y1: () => 0,
				y2: (d) => (d as ProvinceRow).value,
				insetLeft: 0.3,
				insetRight: 0.3,
				color: 'value',
				scales: { color: { domain: [70, 85], scheme: 'viridis' } }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
