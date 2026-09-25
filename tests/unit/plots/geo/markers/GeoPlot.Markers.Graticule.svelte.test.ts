import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES } from '../../../../../stories/plots/geo/data';
import { waitForSvg, countGeoPaths } from '../../_helpers/svg';

describe('GeoPlot – graticule marker', () => {
  test('adds a path over the base map', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      data: WORLD_COUNTRIES,
      markers: [{ type: 'graticule' }] satisfies GeoMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    // Base map paths + at least one graticule path.
    expect(countGeoPaths(svg)).toBeGreaterThan(WORLD_COUNTRIES.length);
  });

  test('custom step and stroke style do not crash', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      data: WORLD_COUNTRIES,
      markers: [
        { type: 'graticule', step: 20, styles: { stroke: '#94a3b8', strokeDasharray: '2 2' } },
      ] satisfies GeoMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });
});

describe('GeoPlot – sphere marker', () => {
  test('adds a path for the outer globe outline', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      data: WORLD_COUNTRIES,
      coordinates: { projection: 'orthographic' },
      markers: [{ type: 'sphere' }] satisfies GeoMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    expect(countGeoPaths(svg)).toBeGreaterThan(WORLD_COUNTRIES.length);
  });

  test('custom fill/stroke does not crash', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      data: WORLD_COUNTRIES,
      coordinates: { projection: 'orthographic' },
      markers: [{ type: 'sphere', styles: { fill: '#eff6ff', stroke: 'currentColor' } }] satisfies GeoMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });
});

describe('GeoPlot – markers empty array', () => {
  test('does not crash with an empty markers array', async () => {
    const { container } = render(GeoPlot, { width: 400, height: 300, data: WORLD_COUNTRIES, markers: [] });
    const svg = await waitForSvg(container);
    expect(countGeoPaths(svg)).toBe(WORLD_COUNTRIES.length);
  });
});
