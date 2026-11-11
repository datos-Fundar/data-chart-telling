import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import GeoTimelineDemo from './GeoTimelineDemo.svelte';
import GeoTimelineDemoSource from './GeoTimelineDemo.svelte?raw';
import { demoSource } from '../../../../common/docsSource';
import { WORLD_COUNTRIES } from '$datasets/world-countries';
import type { GeoFeature, GeoSliceContext } from '$lib/types/plots/data/geo';
import { countryPopulation, gdpPerPerson } from '../channels';

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

/**
 * One layer of features for every panel: the countries carry no field to split by, `facet.values` names the
 * panels, and `color` reads each country in the panel it is drawn in - here a different scenario per panel.
 * The ramp spans every panel, so colors compare across them.
 */
export const FacetValuesOneLayer: Story = {
	args: {
		data: WORLD_COUNTRIES.filter((f) => f.properties!.continent !== 'Antarctica') as GeoFeature[],
		title: 'GDP per person, two scenarios',
		color: (f: GeoFeature, { facet }: GeoSliceContext) =>
			(gdpPerPerson(f) ?? 0) * (facet?.value === 'Optimistic' ? 1.5 : 1),
		scales: { color: { scheme: 'blues' } },
		coordinates: { projection: { type: 'equal-earth' } },
		facet: { by: 'scenario', values: ['Baseline', 'Optimistic'], columns: 2 },
		tooltip: {
			sync: true,
			format: (f: GeoFeature, _number: unknown, { facet }: GeoSliceContext) =>
				`${(f.properties as { name: string }).name} · ${facet?.value}`
		}
	}
};

/**
 * Two variables on the same countries, each with its own ramp. The countries carry no field to split by: the
 * panels are named by `facet.values`, and `color` reads a different variable in each. `scales: 'free'` fits
 * each panel's own domain, and a `grouping` by panel with a `segments` entry per panel gives each its own
 * scheme - one ramp shared by two units would mean nothing.
 */
export const FacetValuesOwnRamps: Story = {
	args: {
		data: WORLD_COUNTRIES.filter((f) => f.properties!.continent !== 'Antarctica') as GeoFeature[],
		title: 'GDP per person and population',
		color: (f: GeoFeature, { facet }: GeoSliceContext) =>
			facet?.value === 'Population' ? countryPopulation(f) : gdpPerPerson(f),
		grouping: (_f: GeoFeature, { facet }: GeoSliceContext) => facet?.value,
		segments: {
			'GDP per person': [{ scales: { color: { scheme: 'blues' } } }],
			Population: [{ scales: { color: { scheme: 'oranges' } } }]
		},
		coordinates: { projection: { type: 'equal-earth' } },
		facet: {
			by: 'variable',
			values: ['GDP per person', 'Population'],
			columns: 2,
			scales: 'free'
		},
		tooltip: {
			sync: true,
			format: (f: GeoFeature, _number: unknown, { facet }: GeoSliceContext) =>
				`${(f.properties as { name: string }).name} · ${facet?.value}`
		}
	}
};

/** The provinces (long format, one geometry per year) and a dot marker's yearly readings, both scrubbed by one `timeline`. */
export const Timeline: StoryObj = {
	render: () => ({ Component: GeoTimelineDemo }),
	parameters: demoSource(GeoTimelineDemoSource)
};
