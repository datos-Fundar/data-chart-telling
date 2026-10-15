import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoStylesConfig } from '$lib/types/layout/styles';
import type { CoordinatesConfig } from '$lib/types/layout/coordinates';
import { argentinaBicontinental } from '$lib/layout/coordinates/projections/argentina';
import { ARGENTINA_PROVINCES, type ArgentinaProvinceProps } from './data';
import { provincePopulation } from './channels';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Defaults to the `argentinaBicontinental` projection (see the `Scales`
// stories) so the mainland and Antarctic sector both show up. Tile-layer
// basemaps are the one exception - raster tiles only line up under a
// Mercator-family projection, so every tile story below overrides
// `coordinates.projection` back to `'mercator'`.

const meta = {
	title: 'Plots/GeoPlot/Styles',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: ARGENTINA_PROVINCES,
		featureId: (f) => (f.properties as ArgentinaProvinceProps).nombre,
		coordinates: { projection: { type: argentinaBicontinental } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		scales: { control: false },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'GeoPlot' } }
	}
} satisfies Meta<typeof GeoPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const POPULATION_DOMAIN: [number, number] = [190_000, 17_600_000];

// "Tierra del Fuego, Antártida e Islas del Atlántico Sur"'s `MultiPolygon`
// includes a pie-slice reaching the South Pole plus the far-flung South
// Georgia/South Sandwich Islands - Mercator can't represent latitudes near
// ±90° (it projects them to +/-Infinity), so feeding that wedge through a
// mercator projection degenerates into a giant filled rectangle covering the
// whole frame instead of clipping away cleanly. `excludeParts` drops those
// parts from what's *drawn* here (same predicate the `Markers/Inset`
// stories' `AntarcticSector`/`CombinedInsets` use to show that wedge
// separately, under a pole-safe azimuthal projection); Tierra del Fuego's
// mainland island is untouched. `domain: 'data'` then auto-fits the
// projection to whatever's left, without needing a hand-authored bbox.
const TIERRA_DEL_FUEGO = 'Tierra del Fuego, Antártida e Islas del Atlántico Sur';
const isAntarcticPart = (part: { centroid: [number, number] }, feature: { __id: string }) =>
	feature.__id === TIERRA_DEL_FUEGO && (part.centroid[1] < -60 || part.centroid[0] > -50);

// ── Stories ───────────────────────────────────────────────────────────────────

/** No style overrides - the base map uses the theme's default palette color and a plain outline. */
export const Default: Story = {
	args: {}
};

/** Custom fill/stroke - `styles.fill`/`styles.stroke`/`styles.strokeWidth` set the base map's default appearance for every feature not otherwise styled by `segments`. */
export const CustomFillStroke: Story = {
	args: {
		styles: {
			fill: '#cbd5e1',
			stroke: '#1e293b',
			strokeWidth: 1.5
		} satisfies GeoStylesConfig<ArgentinaProvinceProps>
	}
};

/**
 * Choropleth color ramp - with a continuous `color` accessor (see `Series`
 * stories), `scales.color.scheme` sets the ramp's colors. Each province's
 * approximate population is used as the value here - compare with
 * `us-choropleth`-style examples that color regions by a numeric metric
 * instead of by fixed per-feature `segments`.
 */
export const ChoroplethColorRamp: Story = {
	args: {
		color: provincePopulation,
		// `coordinates` is set here too, not just `scales.color` - Storybook merges
		// `args` shallowly, so a story-level `coordinates` object replaces the
		// meta's `coordinates: { projection: … }` entirely rather than merging
		// into it; omitting `projection` here would silently fall back to `equal-earth`.
		scales: { color: { domain: POPULATION_DOMAIN, scheme: ['#e0e7ff', '#4f46e5'] } },
		coordinates: { projection: { type: argentinaBicontinental } } satisfies CoordinatesConfig,
		styles: {
			stroke: '#ffffff',
			strokeWidth: 1
		} satisfies GeoStylesConfig<ArgentinaProvinceProps>
	}
};

/** Inverted color ramp - swaps the scheme's colors so higher-population provinces appear in the lighter tone instead of the darker one. */
export const InvertedColorRamp: Story = {
	args: {
		color: provincePopulation,
		// `coordinates` is set here too, not just `scales.color` - Storybook merges
		// `args` shallowly, so a story-level `coordinates` object replaces the
		// meta's `coordinates: { projection: … }` entirely rather than merging
		// into it; omitting `projection` here would silently fall back to `equal-earth`.
		scales: { color: { domain: POPULATION_DOMAIN, scheme: ['#4f46e5', '#e0e7ff'] } },
		coordinates: { projection: { type: argentinaBicontinental } } satisfies CoordinatesConfig
	}
};

/**
 * Raster tile basemap - `styles.tileLayer` draws OpenStreetMap tiles under
 * the vector geometry. Only correct for Mercator-family projections, so
 * `coordinates.projection` is set back to `'mercator'` here, overriding this
 * file's `argentinaBicontinental` default (`coordinates.projection` also
 * defaults to `'mercator'` automatically when a tile layer is set and no
 * projection is given at all - the explicit override here is only needed
 * because this file's meta sets one).
 */
export const TileLayerBasemap: Story = {
	args: {
		coordinates: { projection: { type: 'mercator', domain: 'data' } },
		excludeParts: isAntarcticPart,
		styles: {
			fillOpacity: 0.35,
			stroke: '#4f46e5',
			strokeWidth: 1.5,
			tileLayer: {
				url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
				attribution: '© OpenStreetMap contributors',
				opacity: 0.8
			}
		} satisfies GeoStylesConfig<ArgentinaProvinceProps>
	}
};

// IGN (Instituto Geográfico Nacional) basemaps - Argentina's national
// mapping agency's own tile services:
// https://www.ign.gob.ar/NuestrasActividades/InformacionGeoespacial/ServiciosOGC
// These use the TMS tile scheme (`{-y}`, row 0 at the south) rather than the
// XYZ scheme OSM uses above (`{y}`, row 0 at the north) - see `tileUrl` in
// `$lib/plots/utils/tiles`.

const IGN_ATTRIBUTION = '© Instituto Geográfico Nacional (IGN)';

/** IGN's default "Argenmap" basemap - the standard full-color street map. */
export const TileLayerIgnArgenmap: Story = {
	args: {
		coordinates: { projection: { type: 'mercator', domain: 'data' } },
		excludeParts: isAntarcticPart,
		styles: {
			fillOpacity: 0.35,
			stroke: '#4f46e5',
			strokeWidth: 1.5,
			tileLayer: {
				url: 'https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png',
				attribution: IGN_ATTRIBUTION,
				opacity: 0.8
			}
		} satisfies GeoStylesConfig<ArgentinaProvinceProps>
	}
};

/** IGN's "Argenmap gris" basemap - a muted grayscale variant, useful under a strong choropleth. */
export const TileLayerIgnArgenmapGris: Story = {
	args: {
		coordinates: { projection: { type: 'mercator', domain: 'data' } },
		excludeParts: isAntarcticPart,
		styles: {
			fillOpacity: 0.35,
			stroke: '#4f46e5',
			strokeWidth: 1.5,
			tileLayer: {
				url: 'https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_gris@EPSG%3A3857@png/{z}/{x}/{-y}.png',
				attribution: IGN_ATTRIBUTION,
				opacity: 0.8
			}
		} satisfies GeoStylesConfig<ArgentinaProvinceProps>
	}
};

/** IGN's "Argenmap topográfico" basemap - shows terrain/elevation shading and contour detail. */
export const TileLayerIgnArgenmapTopografico: Story = {
	args: {
		coordinates: { projection: { type: 'mercator', domain: 'data' } },
		excludeParts: isAntarcticPart,
		styles: {
			fillOpacity: 0.35,
			stroke: '#4f46e5',
			strokeWidth: 1.5,
			tileLayer: {
				url: 'https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_topo@EPSG%3A3857@png/{z}/{x}/{-y}.png',
				attribution: IGN_ATTRIBUTION,
				opacity: 0.8
			}
		} satisfies GeoStylesConfig<ArgentinaProvinceProps>
	}
};

/** IGN's "Argenmap oscuro" basemap - a dark-themed variant, pairs well with a light-colored choropleth ramp. */
export const TileLayerIgnArgenmapOscuro: Story = {
	args: {
		coordinates: { projection: { type: 'mercator', domain: 'data' } },
		excludeParts: isAntarcticPart,
		styles: {
			fillOpacity: 0.35,
			stroke: '#a5b4fc',
			strokeWidth: 1.5,
			tileLayer: {
				url: 'https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/argenmap_oscuro@EPSG%3A3857@png/{z}/{x}/{-y}.png',
				attribution: IGN_ATTRIBUTION,
				opacity: 0.8
			}
		} satisfies GeoStylesConfig<ArgentinaProvinceProps>
	}
};

/** IGN's "Argenmap híbrido" basemap - satellite imagery with street/label overlays. */
export const TileLayerIgnArgenmapHibrido: Story = {
	args: {
		coordinates: { projection: { type: 'mercator', domain: 'data' } },
		excludeParts: isAntarcticPart,
		styles: {
			fillOpacity: 0.25,
			stroke: '#ffffff',
			strokeWidth: 1.5,
			tileLayer: {
				url: 'https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_hibrido@EPSG%3A3857@png/{z}/{x}/{-y}.png',
				attribution: IGN_ATTRIBUTION,
				opacity: 0.8
			}
		} satisfies GeoStylesConfig<ArgentinaProvinceProps>
	}
};

/**
 * Click handling - `styles.onFeatureClick` fires with the clicked feature
 * and the DOM event. Click a province to see it.
 */
export const OnFeatureClick: Story = {
	args: {
		featureId: (f) => (f.properties as ArgentinaProvinceProps).nombre,
		styles: {
			onFeatureClick: (feature) => {
				alert(`GeoPlot: clicked ${(feature.properties as ArgentinaProvinceProps).nombre}`);
			}
		} satisfies GeoStylesConfig
	}
};

/**
 * `styles.frame` - same purely decorative border as every other plot kind
 * (see `Plots/LinePlot/Styles`'s `FrameDefault`/`FrameCustomStyle`), just as
 * available here since it's rendered by the shared `StylesLayout`, not
 * anything geo-specific.
 */
export const Frame: Story = {
	args: {
		styles: {
			fill: '#f8fafc',
			stroke: '#94a3b8',
			strokeWidth: 0.5,
			frame: { stroke: '#0f172a', strokeWidth: 2 }
		} satisfies GeoStylesConfig<ArgentinaProvinceProps>
	}
};
