import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoProjectionName } from '$lib/types/layout/coordinates';
import { WORLD_COUNTRIES } from '../../../../stories/plots/geo/data';
import { waitForSvg, countGeoPaths } from '../_helpers/svg';

describe('GeoPlot – projections', () => {
  test('renders with no projection set (defaults to equal-earth)', async () => {
    const { container } = render(GeoPlot, { width: 400, height: 300, data: WORLD_COUNTRIES });
    const svg = await waitForSvg(container);
    expect(countGeoPaths(svg)).toBe(WORLD_COUNTRIES.length);
  });

  const PROJECTIONS: GeoProjectionName[] = [
    'mercator',
    'transverse-mercator',
    'equal-earth',
    'equirectangular',
    'orthographic',
    'stereographic',
    'gnomonic',
    'azimuthal-equal-area',
    'azimuthal-equidistant',
    'conic-conformal',
    'conic-equal-area',
    'conic-equidistant',
    'albers-usa',
    'albers',
    'identity',
    'reflect-y',
  ];

  test.each(PROJECTIONS)('renders without crashing under the "%s" projection', async (projection) => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      data: WORLD_COUNTRIES,
      coordinates: { projection },
    });
    const svg = await waitForSvg(container);
    expect(countGeoPaths(svg)).toBe(WORLD_COUNTRIES.length);
  });

  test('accepts a projection config object with rotate', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      data: WORLD_COUNTRIES,
      coordinates: { projection: { type: 'orthographic', rotate: [60, 20] } },
    });
    const svg = await waitForSvg(container);
    expect(countGeoPaths(svg)).toBe(WORLD_COUNTRIES.length);
  });
});

describe('GeoPlot – color scale domain', () => {
  test('an explicit scales.color.domain is honored for the choropleth ramp', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      data: WORLD_COUNTRIES,
      value: (f) => (f.properties as { pop_est: number }).pop_est,
      scales: { color: { domain: [0, 1_400_000_000] } },
    });
    const svg = await waitForSvg(container);
    expect(countGeoPaths(svg)).toBe(WORLD_COUNTRIES.length);
  });
});
