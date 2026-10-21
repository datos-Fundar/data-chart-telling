import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import { WORLD_COUNTRIES, WORLD_TOPOLOGY, type WorldCountryProps } from './data';
import { countryPopulation } from './channels';

// ── Meta ──────────────────────────────────────────────────────────────────────
// GeoPlot has no x/y series concept - "data" is the map itself. These
// stories cover the shapes `data` accepts (a GeoJSON feature array, a
// FeatureCollection, or an optional TopoJSON Topology) and the `featureId`/
// `value` accessors read off each feature.

const meta = {
	title: 'Plots/Map/GeoPlot/Series',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false }
	},
	parameters: {
		docs: { source: { name: 'GeoPlot' } }
	}
} satisfies Meta<typeof GeoPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * `data` as a plain array of GeoJSON features - the simplest form. Real
 * boundaries for the world's countries (Natural Earth, 110m). Each
 * feature's `properties.id` is used as its id by default (see the
 * `Segments` stories for styling one of them by that id).
 */
export const FeatureArray: Story = {
	args: {
		data: WORLD_COUNTRIES
	}
};

/**
 * `data` as a GeoJSON `FeatureCollection` - equivalent to `FeatureArray`,
 * just wrapped the way most real-world GeoJSON sources hand it back.
 */
export const FeatureCollection: Story = {
	args: {
		data: { type: 'FeatureCollection', features: WORLD_COUNTRIES }
	}
};

/**
 * Explicit `featureId` accessor - instead of relying on the default
 * (`feature.id ?? properties.id ?? properties.name`), a function picks the
 * id explicitly. Useful when the natural key lives under a different
 * property name, or needs normalizing. Here it's each country's own `name`
 * rather than its ISO code.
 */
export const ExplicitFeatureId: Story = {
	args: {
		data: WORLD_COUNTRIES,
		featureId: (f) => (f.properties as WorldCountryProps).name
	}
};

/**
 * Continuous `color` accessor - feeds each feature's numeric value into the
 * choropleth color ramp (see the `Styles`/`Scales` stories for controlling
 * that ramp's domain and colors). Here it's each country's estimated
 * population.
 *
 * The automatic legend titles the ramp with the name of the `color` function,
 * so give it a name (`countryPopulation` here, shown as "Country population")
 * instead of an inline arrow function, which has none and leaves the legend
 * untitled.
 */
export const ContinuousColor: Story = {
	args: {
		data: WORLD_COUNTRIES,
		color: countryPopulation
	}
};

/**
 * TopoJSON input - `data` is a TopoJSON `Topology` plus the `object` key to
 * extract. Converted to GeoJSON at render time via `topojson-client`, an
 * *optional* peer dependency: install it yourself to use this form; GeoPlot
 * works perfectly with plain GeoJSON (see `FeatureArray`) if you never do.
 *
 * `WORLD_TOPOLOGY` is world-atlas's real `countries-110m.json` - the same
 * Natural Earth boundaries as the other stories on this page, but with
 * shared borders stored once as arcs instead of duplicated per polygon (the
 * whole reason TopoJSON exists). `object: 'countries'` is the key to
 * extract; each geometry's numeric ISO id becomes the converted feature's
 * `id`, which GeoPlot's default `featureId` accessor picks up automatically.
 */
export const TopoJsonInput: Story = {
	args: {
		data: WORLD_TOPOLOGY,
		object: 'countries'
	}
};
