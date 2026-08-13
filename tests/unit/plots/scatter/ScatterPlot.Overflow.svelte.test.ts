import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { BasePlotStylesConfig } from '$lib/types/layout/styles';
import { AMERICAS } from '../../../../stories/plots/scatter/data';
import { waitForSvg } from '../_helpers/svg';

// Regression coverage for two related plot-frame overflow bugs: a
// large-radius dot at the domain edge (fixed via resolveRadiusPaddedDomain)
// and a value label offset past the frame (fixed via the edge-aware anchor
// flip in resolveEdgeAwareAnchor) — both computed up front rather than
// registered into svelteplot's own shared margin-auto-sizing context, which
// can spike CPU/memory into unresponsiveness when many `<Plot>` instances
// mount/unmount together (e.g. a multi-story docs page → single story).

describe('ScatterPlot – frame overflow', () => {
  test('a large bubble radius at the domain edge stays within the plot box', async () => {
    const { container } = await render(ScatterPlot, {
      width: 400,
      height: 300,
      data: AMERICAS,
      x: 'gdpPerCapita',
      y: 'lifeExpectancy',
      r: 30,
    });
    const svg = await waitForSvg(container);
    const svgBox = svg.getBoundingClientRect();
    const dots = svg.querySelectorAll('g.dot path');
    expect(dots.length).toBe(AMERICAS.length);
    for (const dot of dots) {
      const box = (dot as SVGGraphicsElement).getBoundingClientRect();
      expect(box.left).toBeGreaterThanOrEqual(svgBox.left - 1);
      expect(box.right).toBeLessThanOrEqual(svgBox.right + 1);
      expect(box.top).toBeGreaterThanOrEqual(svgBox.top - 1);
      expect(box.bottom).toBeLessThanOrEqual(svgBox.bottom + 1);
    }
  });

  test('value labels at the domain edge stay within the plot box', async () => {
    const { container } = await render(ScatterPlot, {
      width: 400,
      height: 300,
      data: AMERICAS,
      x: 'gdpPerCapita',
      y: 'lifeExpectancy',
      styles: { values: { show: true } } satisfies BasePlotStylesConfig,
    });
    const svg = await waitForSvg(container);
    const svgBox = svg.getBoundingClientRect();
    const labels = svg.querySelectorAll('g.text text');
    expect(labels.length).toBe(AMERICAS.length);
    for (const label of labels) {
      const box = (label as SVGGraphicsElement).getBoundingClientRect();
      expect(box.left).toBeGreaterThanOrEqual(svgBox.left - 1);
      expect(box.right).toBeLessThanOrEqual(svgBox.right + 1);
    }
  });
});
