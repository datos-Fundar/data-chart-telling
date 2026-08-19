import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
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
      styles: { values: { show: true } } satisfies AxisBasedStylesConfig,
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

  test('growing the margin to fit an overflowing label never triggers a runaway effect loop', async () => {
    // Regression test: `onOverflow` grows the plot's margin *after* mount,
    // once a label is measured to overflow the frame — that live post-mount
    // margin change has to reach svelteplot's own `<Plot>` through a forced
    // remount (`labelMargin.plotProps`'s `marginRemountKey`, via
    // `BasePlotLayout`'s `{#key}`), not as a reactive prop update on an
    // already-mounted instance (see `BasePlotLayout`'s own doc comment for
    // why). `Plot.svelte` here previously spread only
    // `margins={labelMargin.resolvedMargins}`, silently dropping that key —
    // which fed the grown margin straight into svelteplot's live `<Plot>`,
    // shrinking `plot.plotWidth`/`plotHeight` in place. That fed back into
    // `resolveEdgeAwareAnchor`'s flip decision (computed from those same
    // live values), which could reposition a label enough to change its own
    // measured overflow, growing the margin again — an effect that reads
    // and writes the same state every cycle, tripping Svelte's
    // `effect_update_depth_exceeded` guard. `AMERICAS`' edge points are
    // exactly what exercises this: without `marginRemountKey`, the loop (when
    // present) fires within the first render, well inside the polling window
    // below.
    const errors: unknown[][] = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((...args) => {
      errors.push(args);
    });
    try {
      await render(ScatterPlot, {
        width: 400,
        height: 300,
        data: AMERICAS,
        x: 'gdpPerCapita',
        y: 'lifeExpectancy',
        styles: { values: { show: true } } satisfies AxisBasedStylesConfig,
      });
      await new Promise((r) => setTimeout(r, 800));
    } finally {
      spy.mockRestore();
    }
    const messages = errors.map((args) => args.map(String).join(' ')).join('\n');
    expect(messages).not.toMatch(/effect_update_depth_exceeded/);
  });
});
