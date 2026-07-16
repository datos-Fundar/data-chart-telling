import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoStyles } from '$lib/types/plots/geo/styles';
import { argentinaBicontinental } from '$lib/plots/geo/projections/argentina';
import { ARGENTINA_PROVINCES, type ArgentinaProvinceProps } from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Defaults to the `argentinaBicontinental` projection (see the `Scales`
// stories) so the mainland and Antarctic sector both show up. Tile-layer
// basemaps are the one exception — raster tiles only line up under a
// Mercator-family projection, so every tile story below overrides
// `scales.projection` back to `'mercator'`.

const meta = {
  title: 'Plots/GeoPlot/Styles',
  component: GeoPlot,
  tags: ['autodocs'],
  args: {
    width: 950,
    height: 500,
    data: ARGENTINA_PROVINCES,
    scales: { projection: { type: argentinaBicontinental } },
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 950, step: 20 } },
    height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
    data: { control: false },
    scales: { control: false },
    styles: { control: false },
  },
  parameters: {
    docs: { source: { name: 'GeoPlot' } },
  },
} satisfies Meta<typeof GeoPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const POPULATION_DOMAIN: [number, number] = [190_000, 17_600_000];

// Argentina's mainland alone (no Antarctic sector/islands) — used as the
// tile-layer stories' own `scales.projection.domain` instead of the full
// `ARGENTINA_PROVINCES` dataset's extent. Mercator can't sensibly represent
// latitudes anywhere near ±90°, and the "Tierra del Fuego, Antártida e Islas
// del Atlántico Sur" province's `MultiPolygon` reaches the South Pole — left
// in the fit, that single feature would dominate the bounding box and zoom
// the whole map out to near-nothing. The wedge itself is still *drawn* (it's
// still in `data`), just excluded from the fit and then trimmed back to the
// frame by `clip: 'frame'`.
const ARGENTINA_MAINLAND_DOMAIN: GeoJSON.Feature = {
  type: 'Feature',
  properties: null,
  geometry: {
    type: 'Polygon',
    // Clockwise winding (RFC 7946's right-hand rule for exterior rings) —
    // reversed, d3-geo reads this as covering the ring's *complement*
    // (nearly the whole sphere) instead of this small rectangle.
    coordinates: [
      [
        [-74, -56],
        [-74, -21],
        [-53, -21],
        [-53, -56],
        [-74, -56],
      ],
    ],
  },
};

// ── Stories ───────────────────────────────────────────────────────────────────

/** No style overrides — the base map uses the theme's default palette color and a plain outline. */
export const Default: Story = {
  args: {},
};

/** Custom fill/stroke — `styles.fill`/`styles.stroke`/`styles.strokeWidth` set the base map's default appearance for every feature not otherwise styled by `segments`. */
export const CustomFillStroke: Story = {
  args: {
    styles: {
      fill: '#cbd5e1',
      stroke: '#1e293b',
      strokeWidth: 1.5,
    } satisfies GeoStyles<ArgentinaProvinceProps>,
  },
};

/**
 * Choropleth color ramp — with a continuous `value` accessor (see `Series`
 * stories), `styles.colors.min`/`max` set the ramp endpoints, mirroring
 * HeatmapPlot's `styles.colors`. Each province's approximate population is
 * used as the value here — compare with `us-choropleth`-style examples that
 * color regions by a numeric metric instead of by fixed per-feature `segments`.
 */
export const ChoroplethColorRamp: Story = {
  args: {
    value: (f) => (f.properties as ArgentinaProvinceProps).population,
    scales: { color: { domain: POPULATION_DOMAIN } },
    styles: {
      colors: { min: '#e0e7ff', max: '#4f46e5' },
      stroke: '#ffffff',
      strokeWidth: 1,
    } satisfies GeoStyles<ArgentinaProvinceProps>,
  },
};

/** Inverted color ramp — swaps min/max colors so higher-population provinces appear in the lighter tone instead of the darker one. */
export const InvertedColorRamp: Story = {
  args: {
    value: (f) => (f.properties as ArgentinaProvinceProps).population,
    scales: { color: { domain: POPULATION_DOMAIN } },
    styles: {
      colors: { min: '#4f46e5', max: '#e0e7ff' },
    } satisfies GeoStyles<ArgentinaProvinceProps>,
  },
};

/**
 * Pan + zoom enabled — `styles.zoom: true` turns on drag-to-pan and
 * scroll-to-zoom. Try it directly in the canvas below.
 */
export const ZoomEnabled: Story = {
  args: {
    styles: {
      zoom: true,
    } satisfies GeoStyles<ArgentinaProvinceProps>,
  },
};

/** Zoom with limits — `styles.zoom.min`/`max` clamp how far in/out the scroll wheel can go. */
export const ZoomWithLimits: Story = {
  args: {
    styles: {
      zoom: { min: 1, max: 4 },
    } satisfies GeoStyles<ArgentinaProvinceProps>,
  },
};

/**
 * Raster tile basemap — `styles.tileLayer` draws OpenStreetMap tiles under
 * the vector geometry. Only correct for Mercator-family projections, so
 * `scales.projection` is set back to `'mercator'` here, overriding this
 * file's `argentinaBicontinental` default (`scales.projection` also
 * defaults to `'mercator'` automatically when a tile layer is set and no
 * projection is given at all — the explicit override here is only needed
 * because this file's meta sets one).
 */
export const TileLayerBasemap: Story = {
  args: {
    scales: { projection: { type: 'mercator', clip: 'frame', domain: ARGENTINA_MAINLAND_DOMAIN } },
    styles: {
      fillOpacity: 0.35,
      stroke: '#4f46e5',
      strokeWidth: 1.5,
      tileLayer: {
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
        opacity: 0.8,
      },
    } satisfies GeoStyles<ArgentinaProvinceProps>,
  },
};

// IGN (Instituto Geográfico Nacional) basemaps — Argentina's national
// mapping agency's own tile services:
// https://www.ign.gob.ar/NuestrasActividades/InformacionGeoespacial/ServiciosOGC
// These use the TMS tile scheme (`{-y}`, row 0 at the south) rather than the
// XYZ scheme OSM uses above (`{y}`, row 0 at the north) — see `tileUrl` in
// `$lib/plots/utils/tiles`.

const IGN_ATTRIBUTION = '© Instituto Geográfico Nacional (IGN)';

/** IGN's default "Argenmap" basemap — the standard full-color street map. */
export const TileLayerIgnArgenmap: Story = {
  args: {
    scales: { projection: { type: 'mercator', clip: 'frame', domain: ARGENTINA_MAINLAND_DOMAIN } },
    styles: {
      fillOpacity: 0.35,
      stroke: '#4f46e5',
      strokeWidth: 1.5,
      tileLayer: {
        url: 'https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/capabaseargenmap@EPSG%3A3857@png/{z}/{x}/{-y}.png',
        attribution: IGN_ATTRIBUTION,
        opacity: 0.8,
      },
    } satisfies GeoStyles<ArgentinaProvinceProps>,
  },
};

/** IGN's "Argenmap gris" basemap — a muted grayscale variant, useful under a strong choropleth. */
export const TileLayerIgnArgenmapGris: Story = {
  args: {
    scales: { projection: { type: 'mercator', clip: 'frame', domain: ARGENTINA_MAINLAND_DOMAIN } },
    styles: {
      fillOpacity: 0.35,
      stroke: '#4f46e5',
      strokeWidth: 1.5,
      tileLayer: {
        url: 'https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_gris@EPSG%3A3857@png/{z}/{x}/{-y}.png',
        attribution: IGN_ATTRIBUTION,
        opacity: 0.8,
      },
    } satisfies GeoStyles<ArgentinaProvinceProps>,
  },
};

/** IGN's "Argenmap topográfico" basemap — shows terrain/elevation shading and contour detail. */
export const TileLayerIgnArgenmapTopografico: Story = {
  args: {
    scales: { projection: { type: 'mercator', clip: 'frame', domain: ARGENTINA_MAINLAND_DOMAIN } },
    styles: {
      fillOpacity: 0.35,
      stroke: '#4f46e5',
      strokeWidth: 1.5,
      tileLayer: {
        url: 'https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_topo@EPSG%3A3857@png/{z}/{x}/{-y}.png',
        attribution: IGN_ATTRIBUTION,
        opacity: 0.8,
      },
    } satisfies GeoStyles<ArgentinaProvinceProps>,
  },
};

/** IGN's "Argenmap oscuro" basemap — a dark-themed variant, pairs well with a light-colored choropleth ramp. */
export const TileLayerIgnArgenmapOscuro: Story = {
  args: {
    scales: { projection: { type: 'mercator', clip: 'frame', domain: ARGENTINA_MAINLAND_DOMAIN } },
    styles: {
      fillOpacity: 0.35,
      stroke: '#a5b4fc',
      strokeWidth: 1.5,
      tileLayer: {
        url: 'https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/argenmap_oscuro@EPSG%3A3857@png/{z}/{x}/{-y}.png',
        attribution: IGN_ATTRIBUTION,
        opacity: 0.8,
      },
    } satisfies GeoStyles<ArgentinaProvinceProps>,
  },
};

/** IGN's "Argenmap híbrido" basemap — satellite imagery with street/label overlays. */
export const TileLayerIgnArgenmapHibrido: Story = {
  args: {
    scales: { projection: { type: 'mercator', clip: 'frame', domain: ARGENTINA_MAINLAND_DOMAIN } },
    styles: {
      fillOpacity: 0.25,
      stroke: '#ffffff',
      strokeWidth: 1.5,
      tileLayer: {
        url: 'https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_hibrido@EPSG%3A3857@png/{z}/{x}/{-y}.png',
        attribution: IGN_ATTRIBUTION,
        opacity: 0.8,
      },
    } satisfies GeoStyles<ArgentinaProvinceProps>,
  },
};

/**
 * Click handling — `styles.onFeatureClick` fires with the clicked feature
 * and the DOM event. Click a province to see it.
 */
export const OnFeatureClick: Story = {
  args: {
    featureId: (f) => (f.properties as ArgentinaProvinceProps).nombre,
    styles: {
      onFeatureClick: (feature) => {
        alert(`GeoPlot: clicked ${(feature.properties as ArgentinaProvinceProps).nombre}`);
      },
    } satisfies GeoStyles,
  },
};
