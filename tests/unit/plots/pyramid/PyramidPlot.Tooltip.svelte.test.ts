import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import type { Series } from '$lib/types/plots/common';
import { AGE_GROUPS, POPULATION_PYRAMID, type PopulationRow } from '../../../../stories/data/population-pyramid';
import { waitForSvg } from '../_helpers/svg';

const DATA_2022 = POPULATION_PYRAMID.filter((d) => d.year === 2022);
const DATA_PROPS = { data: DATA_2022, x: 'pct' as const, y: 'ageGroup' as const, z: 'sex' as const };

function noTooltipDom(container: Element) {
  return container.querySelector('.dct-tooltip, [class*="tooltip"]');
}

describe('PyramidPlot – tooltip', () => {
  test('no floating tooltip appears without a tooltip config', async () => {
    const { container } = await render(PyramidPlot, { width: 560, height: 520, ...DATA_PROPS });
    await waitForSvg(container);
    expect(noTooltipDom(container)).toBeNull();
  });

  test('no floating tooltip appears before any hover, even with a tooltip config', async () => {
    const { container } = await render(PyramidPlot, {
      width: 560,
      height: 520,
      ...DATA_PROPS,
      tooltip: {
        facetId: '',
        sync: false,
        format: (row) => {
          const { ageGroup, sex, pct } = row as PopulationRow;
          return `${sex} - ${ageGroup}: ${pct}%`;
        },
      },
    });
    await waitForSvg(container);
    expect(noTooltipDom(container)).toBeNull();
  });

  test('renders with a two-series (data/x/y/z) tooltip config', async () => {
    const { container } = await render(PyramidPlot, {
      width: 560,
      height: 520,
      ...DATA_PROPS,
      scales: { y: { domain: AGE_GROUPS } },
      tooltip: {
        facetId: '',
        sync: false,
        format: (row) => {
          const { ageGroup, sex, pct } = row as PopulationRow;
          return `${sex} - ${ageGroup}: ${pct.toFixed(1)}%`;
        },
      },
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('renders with a series-filtered tooltip config', async () => {
    const { container } = await render(PyramidPlot, {
      width: 560,
      height: 520,
      ...DATA_PROPS,
      scales: { y: { domain: AGE_GROUPS } },
      tooltip: {
        facetId: '',
        sync: false,
        series: ['Mujeres'],
        format: (row) => `Female: ${(row as PopulationRow).pct.toFixed(1)}%`,
      },
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('renders with an explicit-series tooltip config', async () => {
    const { container } = await render(PyramidPlot, {
      width: 560,
      height: 520,
      series: [
        {
          name: 'Mujeres',
          x: 'ageGroup',
          y: 'pct',
          data: DATA_2022.filter((d) => d.sex === 'Mujeres'),
        } satisfies Series<PopulationRow>,
        {
          name: 'Varones',
          x: 'ageGroup',
          y: 'pct',
          data: DATA_2022.filter((d) => d.sex === 'Varones'),
        } satisfies Series<PopulationRow>,
      ],
      scales: { y: { domain: AGE_GROUPS } },
      tooltip: {
        facetId: '',
        sync: false,
        format: (row) => `${(row as PopulationRow).ageGroup}: ${(row as PopulationRow).pct}%`,
      },
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });
});
