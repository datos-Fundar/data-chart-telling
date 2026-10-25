import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import GeoTimelineDemo from './GeoTimelineDemo.svelte';
import GeoTimelineDemoSource from './GeoTimelineDemo.svelte?raw';
import { demoSource } from '../../../../common/docsSource';
import { WORLD_COUNTRIES } from '$datasets/world-countries';
import type { GeoFeature } from '$lib/types/plots/data/geo';
import { gdpPerPerson } from '../channels';

const NORTH = new Set(['Europe', 'North America', 'Asia']);

/** Every country tagged with the half of the world it belongs to - the field the facet splits by. */
const COUNTRIES_BY_HEMISPHERE = WORLD_COUNTRIES.filter(
	(f) => f.properties!.continent !== 'Antarctica'
).map((f) => ({
	...f,
	properties: {
		...f.properties!,
		hemisphere: NORTH.has(f.properties!.continent) ? 'Global North' : 'Global South'
	}
})) as GeoFeature<Record<string, unknown>>[];

/**
 * A GeoPlot's `timeline` and `facet` slice its map by a field each feature
 * carries in its `properties` - and every marker's own rows by the same
 * field. A feature or row without the field draws in every slice. The color
 * ramp spans every slice, so colors compare across them.
 */
const meta = {
	title: 'Plots/Map/GeoPlot/Slicing',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 900,
		height: 460,
		data: COUNTRIES_BY_HEMISPHERE
	},
	argTypes: { data: { control: false }, facet: { control: false } },
	parameters: {
		docs: { source: { name: 'GeoPlot' } }
	}
} satisfies Meta<typeof GeoPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `facet.by` on a feature field: one map per half of the world. With
 * `coordinates.projection.domain: 'data'`, each facet fits its projection
 * to its own countries, so every map zooms to its half.
 */
export const FacetByHemisphere: Story = {
	args: {
		title: 'GDP per person, Global North and South',
		color: gdpPerPerson,
		scales: { color: { scheme: 'blues' } },
		coordinates: { projection: { type: 'equal-earth', domain: 'data' } },
		facet: { by: 'hemisphere', columns: 2 }
	}
};

/** The provinces (long format, one geometry per year) and a dot marker's yearly readings, both scrubbed by one `timeline`. */
export const Timeline: StoryObj = {
	render: () => ({ Component: GeoTimelineDemo }),
	parameters: demoSource(GeoTimelineDemoSource)
};
