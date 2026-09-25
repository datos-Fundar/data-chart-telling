import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, FLIGHT_ROUTES } from '../../../../../stories/plots/geo/data';
import { waitForSvg, countLinkPaths } from '../../_helpers/svg';

describe('GeoPlot – link marker', () => {
  test('renders one path per route', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      data: WORLD_COUNTRIES,
      coordinates: { projection: 'equal-earth' },
      markers: [
        {
          type: 'link',
          data: FLIGHT_ROUTES,
          x1: 'fromLon',
          y1: 'fromLat',
          x2: 'toLon',
          y2: 'toLat',
        },
      ] satisfies GeoMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    expect(countLinkPaths(svg)).toBe(FLIGHT_ROUTES.length);
  });

  test.each(['auto', 'linear'] as const)('curve "%s" renders without crashing', async (curve) => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      data: WORLD_COUNTRIES,
      coordinates: { projection: 'equal-earth' },
      markers: [
        {
          type: 'link',
          data: FLIGHT_ROUTES,
          x1: 'fromLon',
          y1: 'fromLat',
          x2: 'toLon',
          y2: 'toLat',
          curve,
        },
      ] satisfies GeoMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    expect(countLinkPaths(svg)).toBe(FLIGHT_ROUTES.length);
  });

  test('custom stroke style resolves correctly', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      data: WORLD_COUNTRIES,
      coordinates: { projection: 'equal-earth' },
      markers: [
        {
          type: 'link',
          data: FLIGHT_ROUTES,
          x1: 'fromLon',
          y1: 'fromLat',
          x2: 'toLon',
          y2: 'toLat',
          styles: { stroke: '#e11d48', strokeWidth: 2 },
        },
      ] satisfies GeoMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    const paths = svg.querySelectorAll('g.link path, path.link');
    expect(paths.length).toBe(FLIGHT_ROUTES.length);
    [...paths].forEach((p) => {
      const style = p.getAttribute('style') ?? '';
      expect(style.includes('rgb(225, 29, 72)') || style.includes('#e11d48')).toBe(true);
    });
  });
});
