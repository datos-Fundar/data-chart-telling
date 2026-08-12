import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, POPULATION_SHIFT } from '../../../../../stories/plots/geo/data';
import { waitForSvg, countVectorMarks } from '../../_helpers/svg';

describe('GeoPlot – vector marker', () => {
  test('renders one arrow per row', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      data: WORLD_COUNTRIES,
      coordinates: { projection: 'mercator' },
      markers: [
        {
          type: 'vector',
          data: POPULATION_SHIFT,
          x: 'lon',
          y: 'lat',
          length: 'magnitude',
          rotate: 'direction',
        },
      ] satisfies GeoMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    expect(countVectorMarks(svg)).toBe(POPULATION_SHIFT.length);
  });

  test.each(['arrow', 'spike', 'arrow-filled'] as const)('shape "%s" renders without crashing', async (shape) => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      data: WORLD_COUNTRIES,
      coordinates: { projection: 'mercator' },
      markers: [
        {
          type: 'vector',
          data: POPULATION_SHIFT,
          x: 'lon',
          y: 'lat',
          length: 'magnitude',
          rotate: 'direction',
          shape,
        },
      ] satisfies GeoMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    expect(countVectorMarks(svg)).toBe(POPULATION_SHIFT.length);
  });
});
