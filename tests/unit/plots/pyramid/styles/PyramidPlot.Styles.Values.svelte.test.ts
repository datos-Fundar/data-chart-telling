import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import type { ValueAnchor } from '$lib/types/plots/constants';
import { AGE_GROUPS, POPULATION_PYRAMID } from '../../../../../stories/data/population-pyramid';
import { waitForSvg, countTextLabels } from '../../_helpers/svg';

const DATA_2022 = POPULATION_PYRAMID.filter((d) => d.year === 2022);
const DATA_PROPS = { data: DATA_2022, x: 'pct' as const, y: 'ageGroup' as const, z: 'sex' as const };

describe('PyramidPlot – styles.values', () => {
  test('no value labels by default', async () => {
    const { container } = await render(PyramidPlot, { width: 560, height: 520, ...DATA_PROPS });
    const svg = await waitForSvg(container);
    expect(countTextLabels(svg)).toBe(0);
  });

  test('values.show renders one label per bar, formatted as the plain value by default', async () => {
    const { container } = await render(PyramidPlot, {
      width: 560,
      height: 520,
      ...DATA_PROPS,
      styles: { values: { show: true } } satisfies AxisBasedStylesConfig,
    });
    const svg = await waitForSvg(container);
    expect(countTextLabels(svg)).toBe(DATA_2022.length);
  });

  test('a custom format callback overrides the default label text', async () => {
    const { container } = await render(PyramidPlot, {
      width: 560,
      height: 520,
      ...DATA_PROPS,
      styles: {
        values: { show: true, format: (v: number) => `${v.toFixed(1)}%` },
      } satisfies AxisBasedStylesConfig,
    });
    const svg = await waitForSvg(container);
    const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
    expect(labels).toEqual(expect.arrayContaining(DATA_2022.map((d) => `${d.pct.toFixed(1)}%`)));
  });

  test('anchor changes the label\'s horizontal position relative to the bar', async () => {
    async function firstLabelTransform(anchor: ValueAnchor) {
      const { container } = await render(PyramidPlot, {
        width: 560,
        height: 520,
        ...DATA_PROPS,
        scales: { y: { domain: AGE_GROUPS } },
        styles: { values: { show: true, anchor } } satisfies AxisBasedStylesConfig,
      });
      const svg = await waitForSvg(container);
      return svg.querySelector('g.text text')?.getAttribute('transform');
    }
    const outside = await firstLabelTransform('outside');
    const middle = await firstLabelTransform('middle');
    const end = await firstLabelTransform('end');
    expect(outside).toBeTruthy();
    expect(middle).toBeTruthy();
    expect(end).toBeTruthy();
    expect(new Set([outside, middle, end]).size).toBe(3);
  });
});
