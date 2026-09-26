import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import { renderSource } from '../../common/docsSource';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { LIFE_EXPECTANCY_BY_PROVINCE_SEX } from '../../plots/heatmap/data';
import { WORLD_COUNTRIES, WEATHER_STATIONS } from '../../plots/geo/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The `opacity` channel: a plot-level `opacity` accessor plus `scales.opacity`
// dims every default mark independently of `color` — here, HeatmapPlot's own
// cells. Unlike `color`, an opacity value can't be handed to svelteplot as a
// live per-row function (it has no "already resolved, don't rescale me"
// escape hatch for a bare number) — cells sharing the same resolved,
// quantized opacity are grouped into their own mark instance, each with a
// literal constant `fillOpacity`.
//
// `MarkerLevelDot` is the same mechanism scoped to a single `dot` marker
// instead of the plot's own channel — a hand-authored marker's own
// `opacity`/`scales.opacity`, independent of whatever the host plot does.
// Renders through a custom `render` since this file's own `meta.component`
// is `HeatmapPlot`; its own `parameters.docs.source.code` (via
// `renderSource`) overrides the auto-generated code panel, which would
// otherwise show a `HeatmapPlot` call.

const meta = {
	title: 'Channels/Opacity',
	component: HeatmapPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420,
		data: LIFE_EXPECTANCY_BY_PROVINCE_SEX,
		x: 'province',
		y: 'sex',
		color: 'value'
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false }
	},
	parameters: {
		docs: { source: { name: 'HeatmapPlot' } }
	}
} satisfies Meta<typeof HeatmapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `opacity: 'value'` dims lower life-expectancy cells, independent of
 * `color` (which is also driven by `value` here, but could just as easily
 * read a different field entirely).
 */
export const Default: Story = {
	args: {
		opacity: 'value'
	}
};

/** `scales.opacity.range` narrows the dimming — cells never drop below 0.5 opacity here, instead of the theme's own default floor. */
export const CustomRange: Story = {
	args: {
		opacity: 'value',
		scales: {
			opacity: { domain: [70, 85], range: [0.5, 1] }
		}
	}
};

const markerLevelProps = {
	width: 940,
	height: 500,
	data: WORLD_COUNTRIES,
	coordinates: { projection: 'mercator' },
	styles: { stroke: '#94a3b8' },
	markers: [
		{
			type: 'dot',
			data: WEATHER_STATIONS,
			x: 'lon',
			y: 'lat',
			r: 8,
			color: 'tempC',
			opacity: 'tempC',
			scales: { opacity: { range: [0.25, 1] } },
			styles: { dotStroke: '#1e293b' }
		}
	] satisfies GeoMarkersConfig[]
};

/** Weather-station dots dimmed by their own temperature — the base map carries no opacity channel of its own. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MarkerLevelDot: any = {
	parameters: {
		docs: { source: { code: renderSource('GeoPlot', markerLevelProps) } }
	},
	render: () => ({
		Component: GeoPlot,
		props: markerLevelProps
	})
};
