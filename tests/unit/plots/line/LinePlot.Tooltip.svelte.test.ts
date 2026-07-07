import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { YearPoint } from '../../../../stories/plots/line/data';
import { FEMALE_LIFE_EXPECTANCY, MALE_LIFE_EXPECTANCY, LIFE_EXPECTANCY } from '../../../../stories/plots/line/data';
import { waitForSvg } from '../_helpers/svg';

const FEMALE = { name: 'female', x: 'year' as const, y: 'value' as const, data: FEMALE_LIFE_EXPECTANCY };
const MALE = { name: 'male', x: 'year' as const, y: 'value' as const, data: MALE_LIFE_EXPECTANCY };

function noTooltipDom(container: Element) {
  return container.querySelector('.dct-tooltip, [class*="tooltip"]');
}

describe('LinePlot – tooltip', () => {
  test('no floating tooltip appears without a tooltip config', async () => {
    const { container } = await render(LinePlot, { width: 400, height: 300, series: [FEMALE] });
    await waitForSvg(container);
    expect(noTooltipDom(container)).toBeNull();
  });

  test('no floating tooltip appears before any hover, even with a tooltip config', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      tooltip: {
        facetId: '',
        sync: false,
        format: (row) => `${(row as YearPoint).year}: ${(row as YearPoint).value} yr`,
      },
    });
    await waitForSvg(container);
    expect(noTooltipDom(container)).toBeNull();
  });

  test('renders with a two-series tooltip config', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE, MALE],
      tooltip: {
        facetId: '',
        sync: false,
        format: (row) => `${(row as YearPoint).year}: ${(row as YearPoint).value.toFixed(1)} yr`,
      },
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('renders with a series-filtered tooltip config', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE, MALE],
      tooltip: {
        facetId: '',
        sync: false,
        series: ['female'],
        format: (row) => `Female: ${(row as YearPoint).value.toFixed(1)} yr`,
      },
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('renders with a grouped-data (data/x/y/z) tooltip config', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      data: LIFE_EXPECTANCY,
      x: 'year',
      y: 'value',
      z: 'sex',
      tooltip: {
        facetId: '',
        sync: false,
        format: (row) => `${row.sex} (${row.year}): ${row.value} yr`,
      },
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });
});
