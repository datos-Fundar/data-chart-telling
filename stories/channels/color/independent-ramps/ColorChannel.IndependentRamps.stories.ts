import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import { renderSource } from '../../../common/docsSource';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import type { DotMarkerConfig } from '$lib/types/markers/basic';
import { WORLD_COUNTRIES, type WorldCountryProps } from '../../../plots/map/geo/data';
import { COUNTRIES_AT_2007, WEATHER_STATIONS } from '$datasets';
import { countryPopulation, countryGdp } from '../../../plots/map/geo/channels';

// ── Meta ──────────────────────────────────────────────────────────────────────
// This package resolves its own color ramp per consumer instead of routing
// every mark through one shared scale (svelteplot's own `color`) - so a
// plot's own channel and another consumer's own channel never fight over
// domain or scheme, even in the same plot. Four variants:
//
// - `Default`: a `dot` marker with a `color` accessor but no `scales` of its
//   own - it inherits the plot's own `scales.color` scheme, over its own values.
// - `IndependentRamp`: identical to `Default`, but the marker sets its own
//   `scales.color` - now it draws from a completely independent ramp instead
//   of inheriting the plot's.
// - `SegmentRamp`: a `segments` entry's own `scales`, overriding the plot's
//   own ramp for just the features that fall in that segment - same idea as
//   `IndependentRamp`, scoped by feature/grouping-bucket membership instead
//   of by marker.
// - `MarkerRampScatter`: the same marker-ramp mechanism as `IndependentRamp`,
//   on a different plot kind (`ScatterPlot`). Renders through a custom
//   `render` since this file's own `meta.component` is `GeoPlot`; its own
//   `parameters.docs.source.code` (via `renderSource`) overrides the
//   auto-generated code panel, which would otherwise show a `GeoPlot` call.
//
// Plain Mercator + WORLD_COUNTRIES, not an Argentina-fit projection - the
// weather stations in `Default`/`IndependentRamp` span from Bogotá down to
// Buenos Aires, well beyond any projection tightly fit to one country's own
// extremity points (see `Plots/GeoPlot/Markers/Dot`, which pairs the same
// WORLD_COUNTRIES + WEATHER_STATIONS combo under plain Mercator).

// A simplified, illustrative Global South/North split by continent - not a
// rigorous geopolitical classification, just enough categories for
// `SegmentRamp` to demonstrate a segment ramp against a real,
// unevenly-distributed value (GDP).
const GLOBAL_SOUTH_CONTINENTS = new Set(['Africa', 'Asia', 'South America', 'Oceania']);

function globalSouthOrNorth(f: { properties: WorldCountryProps }): string {
	return GLOBAL_SOUTH_CONTINENTS.has(f.properties.continent) ? 'global_south' : 'global_north';
}

const meta = {
	title: 'Channels/Color/Independent Ramps',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: WORLD_COUNTRIES,
		coordinates: { projection: 'mercator' }
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

/**
 * The plot's own `color`/`scales.color` colors countries by population (a
 * blue ramp). The `dot` marker reads its own `color` accessor (station
 * temperature) but sets no `scales` of its own, so it falls back to and
 * inherits the plot's own scheme - the same blue ramp, stretched over the
 * marker's own values (the plot's domain spans population, not temperature).
 */
export const Default: Story = {
	args: {
		color: countryPopulation,
		scales: { color: { domain: [1_000_000, 1_400_000_000], scheme: ['#e0e7ff', '#4f46e5'] } },
		styles: { stroke: '#94a3b8' },
		markers: [
			{
				type: 'dot',
				data: WEATHER_STATIONS,
				x: 'lon',
				y: 'lat',
				r: 8,
				color: 'tempC',
				styles: { dotStroke: '#1e293b' }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/**
 * Identical to `Default`, except the `dot` marker now sets its own
 * `scales.color` - an independent ramp (inferno), unrelated to the plot's
 * own blue one, neither aware of the other's domain or scheme.
 */
export const IndependentRamp: Story = {
	args: {
		color: countryPopulation,
		scales: { color: { domain: [1_000_000, 1_400_000_000], scheme: ['#e0e7ff', '#4f46e5'] } },
		styles: { stroke: '#94a3b8' },
		markers: [
			{
				type: 'dot',
				data: WEATHER_STATIONS,
				x: 'lon',
				y: 'lat',
				r: 8,
				color: 'tempC',
				scales: { color: { scheme: 'inferno' } },
				styles: { dotStroke: '#1e293b' }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/**
 * Every country's `color` reads the same `gdp_md` value, but `global_south`
 * countries are ramped through `reds` while the rest fall back to the
 * plot-level `blues` ramp - each ramp's own domain is built from just the
 * features in its own bucket, so neither hemisphere's range is skewed by
 * the other's outliers (e.g. the US/China GDP figures don't flatten the
 * Global South ramp).
 */
export const SegmentRamp: Story = {
	args: {
		color: countryGdp,
		grouping: (f) => globalSouthOrNorth(f as never),
		scales: {
			color: { scheme: 'blues' }
		},
		segments: {
			global_south: [{ scales: { color: { scheme: 'reds' } } }]
		}
	}
};

const scatterProps = {
	width: 940,
	height: 500,
	data: COUNTRIES_AT_2007,
	x: 'gdp',
	y: 'life',
	r: 6,
	color: 'continent',
	scales: {
		color: {
			scheme: {
				Americas: '#a78bfa',
				Europe: '#60a5fa',
				Asia: '#169ef9',
				Africa: '#34d3d3'
			}
		}
	},
	markers: [
		{
			type: 'dot',
			data: COUNTRIES_AT_2007.filter((d) => d.gdp > 30_000),
			x: 'gdp',
			y: 'life',
			r: 10,
			color: 'life',
			scales: { color: { scheme: 'reds' } },
			styles: { dotStroke: '#0f172a', dotStrokeWidth: 2 }
		}
	] satisfies DotMarkerConfig[]
};

/**
 * `ScatterPlot`'s own `color`/`scales.color` colors points by continent (a
 * discrete scheme); the `dot` marker's own `color`/`scales.color` colors a
 * highlighted subset of high-GDP countries by life expectancy (a continuous
 * red ramp) - same "marker sets its own ramp" mechanism as `IndependentRamp`,
 * on a different plot kind.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MarkerRampScatter: any = {
	parameters: {
		docs: { source: { code: renderSource('ScatterPlot', scatterProps) } }
	},
	render: () => ({
		Component: ScatterPlot,
		props: scatterProps
	})
};
