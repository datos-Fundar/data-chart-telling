import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarker } from '$lib/types/plots/geo/markers';
import { WORLD_COUNTRIES, WEATHER_STATIONS, type WeatherStation } from '../../../../../stories/plots/geo/data';
import { waitForSvg, countDotMarks } from '../../_helpers/svg';

describe('GeoPlot – dot marker', () => {
  test('renders one dot per row', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      data: WORLD_COUNTRIES,
      scales: { projection: 'mercator' },
      markers: [{ type: 'dot', data: WEATHER_STATIONS, x: 'lon', y: 'lat' } satisfies GeoMarker],
    });
    const svg = await waitForSvg(container);
    expect(countDotMarks(svg)).toBe(WEATHER_STATIONS.length);
  });

  test('r accessor sizes dots without crashing', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      data: WORLD_COUNTRIES,
      scales: { projection: 'mercator' },
      markers: [
        {
          type: 'dot',
          data: WEATHER_STATIONS,
          x: 'lon',
          y: 'lat',
          r: (d) => (d as WeatherStation).tempC / 2,
        } satisfies GeoMarker,
      ],
    });
    const svg = await waitForSvg(container);
    expect(countDotMarks(svg)).toBe(WEATHER_STATIONS.length);
  });

  test('a continuous value + style.colors resolves to varying fills', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      data: WORLD_COUNTRIES,
      scales: { projection: 'mercator' },
      markers: [
        {
          type: 'dot',
          data: WEATHER_STATIONS,
          x: 'lon',
          y: 'lat',
          value: 'tempC',
          style: { colors: { min: '#3b82f6', max: '#dc2626' } },
        } satisfies GeoMarker,
      ],
    });
    const svg = await waitForSvg(container);
    const fills = [...svg.querySelectorAll('g.dot path')].map(
      (p) => p.getAttribute('fill') ?? p.getAttribute('style') ?? '',
    );
    expect(new Set(fills).size).toBeGreaterThan(1);
  });

  test('an empty dot data array renders no dots without crashing', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      data: WORLD_COUNTRIES,
      markers: [{ type: 'dot', data: [], x: 'lon', y: 'lat' } satisfies GeoMarker],
    });
    const svg = await waitForSvg(container);
    expect(countDotMarks(svg)).toBe(0);
  });
});
