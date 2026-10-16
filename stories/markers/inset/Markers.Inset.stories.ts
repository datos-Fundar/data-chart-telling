import type { Meta, StoryObj } from '@storybook/svelte-vite';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import {
	WORLD_COUNTRIES,
	type WorldCountryProps,
	ARGENTINA_PROVINCES,
	CABA_COMUNAS,
	AMBA_PARTIDOS,
	type ArgentinaProvinceProps
} from '../../plots/geo/data';
import { argentinaBicontinental } from '$lib/layout/coordinates/projections/argentina';
import GeoPlot from '$lib/plots/geo/Plot.svelte';

// ── Meta ──────────────────────────────────────────────────────────────────────
// An `inset` marker - a small, independently-projected map panel anchored
// to a corner/edge of the plot, showing a filtered subset of the plot's own
// `data` at a different scale. Geo-only, so `GeoPlot` stands in for the
// empty canvas the rest of `Markers/*` uses - see the other stories in this file
// for an explicit separate `data` dataset and split-geometry examples.

const meta = {
	title: 'Markers/Inset',
	component: GeoPlot,
	tags: ['autodocs'],
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	}
} satisfies Meta<typeof GeoPlot>;

export default meta;

// Each story renders its own plot (the same marker works on any plot kind), so the
// host, its base args and its story type are declared per host below.
type GeoPlotStory = StoryObj<typeof GeoPlot>;
const renderGeoPlot: GeoPlotStory['render'] = (args) => ({ Component: GeoPlot, props: args });

const GEO_PLOT_ARGS = {
	width: 940,
	height: 500,
	data: WORLD_COUNTRIES,
	featureId: (f) => (f.properties as WorldCountryProps).name
} satisfies GeoPlotStory['args'];
const GEO_PLOT_ARGS_2 = {
	width: 940,
	height: 500,
	data: ARGENTINA_PROVINCES,
	featureId: (f) => (f.properties as ArgentinaProvinceProps).nombre,
	coordinates: { projection: { type: argentinaBicontinental } }
} satisfies GeoPlotStory['args'];

/** `location` anchors the inset to a corner/edge; `features` filters the plot's own `data` down to just the named feature, matched by `featureId`. */
export const Basic: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		markers: [
			{
				type: 'inset',
				location: 'bottom-left',
				features: ['Argentina'],
				styles: { fill: '#7c3aed' }
			}
		] satisfies GeoMarkersConfig[]
	}
};

// ── Stories ───────────────────────────────────────────────────────────────────

const TIERRA_DEL_FUEGO = 'Tierra del Fuego, Antártida e Islas del Atlántico Sur';

/**
 * `excludeParts` (on `GeoPlot` itself) and `featurePartsFilter` (on the
 * `inset` marker) share the same `(part, feature)` signature, so one
 * predicate can be passed to both - here, "the Antarctic-sector part of the
 * Tierra del Fuego province" - to split that single feature's geometry
 * between the main map (mainland only) and this inset (Antarctic sector
 * only), without preprocessing the source GeoJSON into two features.
 *
 * Latitude alone (`< -60`) catches the Antarctic continent/peninsula, but
 * misses South Georgia and the South Sandwich Islands - real sub-parts of
 * this same province, sitting further north (down to about -53.5°) but far
 * east (longitude -49 to -26, vs. the mainland/Malvinas cluster's -68 to
 * -58) - hence the longitude half of this predicate, found by inspecting
 * `ARGENTINA_PROVINCES`' actual part centroids rather than guessed.
 */
const isAntarcticPart = (part: { centroid: [number, number] }, feature: { __id: string }) =>
	feature.__id === TIERRA_DEL_FUEGO && (part.centroid[1] < -60 || part.centroid[0] > -50);

/**
 * `location` anchors the inset to a `side-anchor` pair - `'right-middle'`
 * here centers it vertically along the plot's right edge. `features`
 * filters the plot's own `data` down to just the named feature(s), the same
 * ids `segments` keys by.
 */
export const FilterByFeatureName: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS_2,
		markers: [
			{
				type: 'inset',
				location: 'right-middle',
				features: ['Ciudad Autónoma de Buenos Aires'],
				styles: { fill: '#dc2626' }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/** `features` accepts a list - several provinces shown together in one inset. */
export const MultipleFeatures: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS_2,
		markers: [
			{
				type: 'inset',
				location: 'right-middle',
				features: ['Ciudad Autónoma de Buenos Aires', 'Buenos Aires']
			}
		] satisfies GeoMarkersConfig[]
	}
};

/**
 * `data` renders a wholly separate dataset inside the inset instead of
 * filtering the plot's own - here the real AMBA partidos (municipalities),
 * which aren't part of `ARGENTINA_PROVINCES` at all.
 */
export const ExplicitDataset: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS_2,
		markers: [
			{
				type: 'inset',
				location: 'right-middle',
				data: AMBA_PARTIDOS,
				styles: { stroke: '#dc2626', strokeWidth: 1 }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/**
 * The Antarctic/South Atlantic sector, filtered from the plot's own data -
 * "Tierra del Fuego, Antártida e Islas del Atlántico Sur" is a single
 * province whose `MultiPolygon` includes the mainland island *and* the
 * Antarctic wedge plus South Atlantic islands, so filtering by its name
 * pulls in all of it. `featurePartsFilter` narrows that further to just the
 * Antarctic-sector parts; `excludeParts` (see `isAntarcticPart` above) hides
 * those same parts from the main map, so this inset doesn't draw them
 * twice - Tierra del Fuego's mainland part is untouched, still visible on
 * the main map.
 *
 * `coordinates.projection` is overridden here to a plain, auto-fitting
 * `'mercator'` (`domain: 'data'` fits it to whatever the map is *actually*
 * showing at render time), replacing this file's `argentinaBicontinental`
 * default - that custom projection's own scale/translate are fixed at
 * calibration time, permanently reserving screen space for the Antarctic
 * panel it was built to show, so it can't shrink back down just because
 * `excludeParts` removed that content from `data`.
 *
 * The inset's own `projection` centers an azimuthal-equidistant view on the
 * South Pole - mercator (the inset's default) can't represent latitudes
 * near ±90°.
 */
export const AntarcticSector: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS_2,
		coordinates: { projection: { type: 'mercator', domain: 'data' } },
		excludeParts: isAntarcticPart,
		markers: [
			{
				type: 'inset',
				location: 'bottom-right',
				features: [TIERRA_DEL_FUEGO],
				featurePartsFilter: isAntarcticPart,
				projection: { type: 'azimuthal-equidistant', rotate: [49.5, 90] }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/**
 * Two insets at once - CABA's own comunas (`CABA_COMUNAS`, a separate,
 * finer-grained dataset than the single CABA feature in `ARGENTINA_PROVINCES`)
 * and the Antarctic sector (see `AntarcticSector` above for why
 * `excludeParts`/`featurePartsFilter`/`coordinates.projection` are needed there)
 * - mirroring the layout Argentina's IGN uses on official maps.
 */
export const CombinedInsets: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS_2,
		coordinates: { projection: { type: 'mercator', domain: 'data' } },
		excludeParts: isAntarcticPart,
		markers: [
			{
				type: 'inset',
				location: 'right-middle',
				data: CABA_COMUNAS,
				styles: { stroke: '#dc2626', strokeWidth: 1 }
			},
			{
				type: 'inset',
				location: 'bottom-right',
				features: [TIERRA_DEL_FUEGO],
				featurePartsFilter: isAntarcticPart,
				projection: { type: 'azimuthal-equidistant', rotate: [49.5, 90] }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/** `width`/`height` (as a fraction of the plot's own size) and `margin` (pixels from the edge) control the inset box's size/position. */
export const CustomSize: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS_2,
		markers: [
			{
				type: 'inset',
				location: 'top-left',
				features: ['Ciudad Autónoma de Buenos Aires'],
				width: 0.4,
				height: 0.3,
				margin: 20
			}
		] satisfies GeoMarkersConfig[]
	}
};
