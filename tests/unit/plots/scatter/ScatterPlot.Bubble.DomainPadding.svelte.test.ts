import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import { AMERICAS } from '../../../../stories/plots/scatter/data';
import { waitForSvg } from '../_helpers/svg';

// Regression coverage: `r` as a channel (field key/accessor) is bound to
// svelteplot's own auto sqrt scale - its raw values (e.g. a population in
// the hundreds) are data, not pixels. The domain-padding fix must not treat
// those raw values as literal pixel radii, or it over-pads the scale domain
// into a near-empty-looking chart (all points collapse toward the center).

describe('ScatterPlot - bubble domain padding', () => {
  test('a large-magnitude channel r does not collapse the rendered spread', async () => {
    const { container } = await render(ScatterPlot, {
      width: 400,
      height: 300,
      data: AMERICAS,
      x: 'gdpPerCapita',
      y: 'lifeExpectancy',
      r: 'population', // population ranges 19-333 - raw values far larger than any sane pixel radius
    });
    const svg = await waitForSvg(container);
    const dots = [...svg.querySelectorAll('g.dot path')];
    const centersX = dots.map((d) => (d as SVGGraphicsElement).getBoundingClientRect().x);
    const spread = Math.max(...centersX) - Math.min(...centersX);
    // With sane (not raw-population-sized) padding, six spread-out GDP values
    // should still span a clear majority of a 400px-wide plot.
    expect(spread).toBeGreaterThan(150);
  });
});
