import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { POPULATION_PYRAMID } from '../../../../../stories/data/population-pyramid';
import { waitForSvg } from '../../_helpers/svg';

const DATA_2022 = POPULATION_PYRAMID.filter((d) => d.year === 2022);
const DATA_PROPS = { data: DATA_2022, x: 'pct' as const, y: 'ageGroup' as const, z: 'sex' as const };

function barFills(svg: SVGElement): string[] {
  return Array.from(svg.querySelectorAll('g.bar-x rect')).map((r) => getComputedStyle(r).fill);
}

describe('PyramidPlot – styles.colors', () => {
  test('left and right series get different colors by default', async () => {
    const { container } = await render(PyramidPlot, { width: 560, height: 520, ...DATA_PROPS });
    const svg = await waitForSvg(container);
    expect(new Set(barFills(svg)).size).toBe(2);
  });

  test('a custom left/right color pair overrides the default palette', async () => {
    const { container } = await render(PyramidPlot, {
      width: 560,
      height: 520,
      ...DATA_PROPS,
      styles: { colors: { left: '#ff0000', right: '#0000ff' } } satisfies AxisBasedStylesConfig,
    });
    const svg = await waitForSvg(container);
    const fills = new Set(barFills(svg));
    expect(fills).toContain('rgb(255, 0, 0)');
    expect(fills).toContain('rgb(0, 0, 255)');
  });
});
