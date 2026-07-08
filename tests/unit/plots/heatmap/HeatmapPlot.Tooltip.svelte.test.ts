import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { Series } from '$lib/types/plots/common';
import { EMPLOYMENT_BY_AGE_PROVINCE, type AgeProvinceCell } from '../../../../stories/plots/heatmap/data';
import { waitForSvg } from '../_helpers/svg';

const DATA_PROPS = { data: EMPLOYMENT_BY_AGE_PROVINCE, x: 'ageGroup' as const, y: 'province' as const, z: 'pct' as const };

function noTooltipDom(container: Element) {
  return container.querySelector('.dct-tooltip, [class*="tooltip"]');
}

describe('HeatmapPlot – tooltip', () => {
  test('no floating tooltip appears without a tooltip config', async () => {
    const { container } = await render(HeatmapPlot, { width: 400, height: 300, ...DATA_PROPS });
    await waitForSvg(container);
    expect(noTooltipDom(container)).toBeNull();
  });

  test('no floating tooltip appears before any hover, even with a tooltip config', async () => {
    const { container } = await render(HeatmapPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      tooltip: {
        facetId: '',
        sync: false,
        format: (row) => {
          const { ageGroup, province, pct } = row as AgeProvinceCell;
          return `${ageGroup} - ${province}: ${(pct * 100).toFixed(1)}%`;
        },
      },
    });
    await waitForSvg(container);
    expect(noTooltipDom(container)).toBeNull();
  });

  test('renders with a data/x/y/z tooltip config', async () => {
    const { container } = await render(HeatmapPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      tooltip: {
        facetId: '',
        sync: false,
        format: (row) => {
          const { ageGroup, province, pct } = row as AgeProvinceCell;
          return `${ageGroup} - ${province}: ${(pct * 100).toFixed(1)}%`;
        },
      },
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('renders with an explicit series-form tooltip config', async () => {
    const { container } = await render(HeatmapPlot, {
      width: 400,
      height: 300,
      series: [
        { name: 'employment_rate', x: 'ageGroup', y: 'province', z: 'pct', data: EMPLOYMENT_BY_AGE_PROVINCE } satisfies Series<AgeProvinceCell>,
      ],
      tooltip: {
        facetId: '',
        sync: false,
        format: (row) => {
          const { ageGroup, pct } = row as AgeProvinceCell;
          return `${ageGroup}: ${Math.round(pct * 100)}%`;
        },
      },
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });
});
