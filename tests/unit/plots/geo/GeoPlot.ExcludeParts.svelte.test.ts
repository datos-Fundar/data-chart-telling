import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoFeature } from '$lib/types/plots/data/geo';
import type { GeoMarker } from '$lib/types/markers/geo';
import { ARGENTINA_PROVINCES } from '../../../../stories/plots/geo/data';
import { waitForSvg, countGeoPaths } from '../_helpers/svg';

const DATA_PROPS = {
  data: ARGENTINA_PROVINCES,
  featureId: (f: GeoFeature) => (f.properties as { nombre: string }).nombre,
};

const TIERRA_DEL_FUEGO = 'Tierra del Fuego, Antártida e Islas del Atlántico Sur';
const isAntarcticPart = (part: { centroid: [number, number] }, feature: { __id: string }) =>
  feature.__id === TIERRA_DEL_FUEGO && (part.centroid[1] < -60 || part.centroid[0] > -50);

describe('GeoPlot – excludeParts', () => {
  test('excluding every part of a feature drops it entirely', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      excludeParts: (_part, feature) => feature.__id === 'Córdoba',
    });
    const svg = await waitForSvg(container);
    expect(countGeoPaths(svg)).toBe(ARGENTINA_PROVINCES.length - 1);
  });

  test('a partial exclusion on a multi-part feature leaves the feature rendering', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      excludeParts: (part, feature) =>
        feature.__id === 'Tierra del Fuego, Antártida e Islas del Atlántico Sur' && part.centroid[1] < -60,
    });
    const svg = await waitForSvg(container);
    // Every feature still renders — Tierra del Fuego just has fewer parts.
    expect(countGeoPaths(svg)).toBe(ARGENTINA_PROVINCES.length);
  });

  test('no excludeParts given: every feature renders as before', async () => {
    const { container } = render(GeoPlot, { width: 400, height: 300, ...DATA_PROPS });
    const svg = await waitForSvg(container);
    expect(countGeoPaths(svg)).toBe(ARGENTINA_PROVINCES.length);
  });

  test('paired with an inset\'s featurePartsFilter, the same predicate splits one feature in two: mainland stays in the main map, the excluded parts render only in the inset', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      excludeParts: isAntarcticPart,
      markers: [
        {
          type: 'inset',
          location: 'bottom-right',
          features: [TIERRA_DEL_FUEGO],
          featurePartsFilter: isAntarcticPart,
        } satisfies GeoMarker,
      ],
    });
    const svg = await waitForSvg(container);
    // Every province still renders on the main map (Tierra del Fuego just
    // has fewer parts) — and the inset draws a path for the excluded parts.
    expect(countGeoPaths(svg)).toBe(ARGENTINA_PROVINCES.length);
    expect(svg.querySelectorAll('g.dct-geo-inset path').length).toBe(1);
  });
});
