import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { CountryPoint } from '../../../../stories/plots/scatter/data';
import { AMERICAS, COUNTRIES } from '../../../../stories/plots/scatter/data';
import { waitForSvg } from '../_helpers/svg';

function noTooltipDom(container: Element) {
  return container.querySelector('.dct-tooltip, [class*="tooltip"]');
}

describe('ScatterPlot – tooltip', () => {
  test('no floating tooltip appears without a tooltip config', async () => {
    const { container } = await render(ScatterPlot, {
      width: 400,
      height: 300,
      data: AMERICAS,
      x: 'gdpPerCapita',
      y: 'lifeExpectancy',
    });
    await waitForSvg(container);
    expect(noTooltipDom(container)).toBeNull();
  });

  test('no floating tooltip appears before any hover, even with a tooltip config', async () => {
    const { container } = await render(ScatterPlot, {
      width: 400,
      height: 300,
      data: AMERICAS,
      x: 'gdpPerCapita',
      y: 'lifeExpectancy',
      tooltip: {
        facetId: '',
        sync: false,
        format: (row) => `${(row as CountryPoint).country}`,
      },
    });
    await waitForSvg(container);
    expect(noTooltipDom(container)).toBeNull();
  });

  test('renders with a grouped-data (data/x/y/z) tooltip config', async () => {
    const { container } = await render(ScatterPlot, {
      width: 400,
      height: 300,
      data: COUNTRIES,
      x: 'gdpPerCapita',
      y: 'lifeExpectancy',
      z: 'region',
      tooltip: {
        facetId: '',
        sync: false,
        format: (row) => `${(row as CountryPoint).country}: ${(row as CountryPoint).lifeExpectancy} yr`,
      },
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('renders with a series-filtered tooltip config', async () => {
    const { container } = await render(ScatterPlot, {
      width: 400,
      height: 300,
      data: COUNTRIES,
      x: 'gdpPerCapita',
      y: 'lifeExpectancy',
      z: 'region',
      tooltip: {
        facetId: '',
        sync: false,
        series: ['Americas'],
        format: (row) => `${(row as CountryPoint).country}`,
      },
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });
});
