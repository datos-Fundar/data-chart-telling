import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { waitForSvg } from '../../_helpers/svg';

function seriesWithMax(max: number) {
  return [{ name: 'a', x: 'category' as const, y: 'value' as const, data: [{ category: 'A', value: max }] }];
}

function frameY(container: Element): number {
  return Number(container.querySelector('rect.frame')?.getAttribute('transform')?.match(/,([\d.]+)\)/)?.[1]);
}

describe('BarPlot - outside-anchored value labels reserve room up front', () => {
  test('the top margin already fits the tallest label on the very first render', async () => {
    const withLabels = await render(BarPlot, {
      width: 400,
      height: 300,
      series: seriesWithMax(87),
      styles: { values: { show: true }, frame: true } satisfies AxisBasedStylesConfig,
    });
    const withoutLabels = await render(BarPlot, {
      width: 400,
      height: 300,
      series: seriesWithMax(87),
      styles: { frame: true } satisfies AxisBasedStylesConfig,
    });
    await waitForSvg(withLabels.container);
    await waitForSvg(withoutLabels.container);
    expect(frameY(withLabels.container)).toBeGreaterThan(frameY(withoutLabels.container));
  });

  test('does not remount the plot when the data changes to a smaller value', async () => {
    const { container, rerender } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: seriesWithMax(87),
      styles: { values: { show: true }, frame: true } satisfies AxisBasedStylesConfig,
    });
    const svg = await waitForSvg(container);
    await new Promise((r) => setTimeout(r, 300));

    await rerender({ series: seriesWithMax(12) });
    await new Promise((r) => setTimeout(r, 300));

    expect(svg.isConnected).toBe(true);
    expect(container.querySelector('.dct-plot svg')).toBe(svg);
  });
});
