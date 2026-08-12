<script lang="ts">
  import FacetLayout from '$lib/layout/facet/FacetLayout.svelte';
  import GeoPlot from '$lib/plots/geo/Plot.svelte';
  import { ARGENTINA_PROVINCES, type ArgentinaProvinceProps } from '../data';
  import type { FacetColumns } from '$lib/types/charts/common';

  /**
   * Exercises `FacetLayout` + `GeoPlot`'s tile-layer basemap together across
   * every row/column combination — the exact interaction that broke
   * repeatedly (see `clampBoundsToWorld` in `$lib/plots/utils/tiles`): a
   * facet cell's *aspect ratio*, not just its raw size, determines how far
   * the letterboxed margin around a tall/narrow country like Argentina
   * reaches once inverted back to lon/lat. Every cell renders the *same*
   * province choropleth + IGN grayscale basemap the real consuming app
   * (`interno-cfi`'s `GeoPlot.svelte`) uses — matches `GeoPlot.Styles`
   * stories' `TileLayerIgnArgenmapGris` exactly; only the grid shape
   * (`groupCount` + `columns`) varies per story.
   */
  let {
    groupCount,
    columns,
    width = 900,
    height = 600,
  }: {
    groupCount: number;
    columns: FacetColumns;
    width?: number;
    height?: number;
  } = $props();

  type Row = { group: string };

  const GROUP_NAMES = [
    'Inicial',
    'Primaria',
    'Secundaria',
    'Superior no universitario',
    'Posgrado',
    'Terciario',
    'Técnico',
    'Formación docente',
    'Educación especial',
  ];

  const data = $derived.by((): Row[] => GROUP_NAMES.slice(0, groupCount).map((group) => ({ group })));

  // Same predicate `GeoPlot.Styles.stories.ts`'s tile-layer stories use —
  // Mercator can't represent the Antarctic sector / South Atlantic islands
  // wedge of "Tierra del Fuego, Antártida e Islas del Atlántico Sur", so it's
  // dropped from what's drawn (and, in turn, from `domain: 'data'`'s fit).
  const TIERRA_DEL_FUEGO = 'Tierra del Fuego, Antártida e Islas del Atlántico Sur';
  function isAntarcticPart(part: { centroid: [number, number] }, feature: { __id: string }): boolean {
    return feature.__id === TIERRA_DEL_FUEGO && (part.centroid[1] < -60 || part.centroid[0] > -50);
  }
</script>

<FacetLayout {data} by="group" {columns} {width} {height}>
  {#snippet cell({ width: w, height: h })}
    <GeoPlot
      width={w}
      height={h}
      data={ARGENTINA_PROVINCES}
      featureId={(f) => (f.properties as ArgentinaProvinceProps).nombre}
      excludeParts={isAntarcticPart}
      coordinates={{ projection: { type: 'mercator', domain: 'data' } }}
      styles={{
        fillOpacity: 0.35,
        stroke: '#4f46e5',
        strokeWidth: 1.5,
        tileLayer: {
          url: 'https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/mapabase_gris@EPSG%3A3857@png/{z}/{x}/{-y}.png',
          attribution: '© Instituto Geográfico Nacional (IGN)',
          opacity: 0.8,
        },
      }}
    />
  {/snippet}
</FacetLayout>
