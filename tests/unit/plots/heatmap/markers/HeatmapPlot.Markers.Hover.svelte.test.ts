import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { LIFE_EXPECTANCY_BY_PROVINCE_SEX } from '../../../../../stories/plots/heatmap/data';
import { waitForSvg, countHoverAreas } from '../../_helpers/svg';

const DATA_PROPS = { data: LIFE_EXPECTANCY_BY_PROVINCE_SEX, x: 'province' as const, y: 'sex' as const, z: 'value' as const };

// Both of a heatmap's axes are band scales, so `areaX`/`areaY` (unlike on a
// bar/pyramid chart, which only ever has one) can render together as a
// crosshair-shaped pair of highlight areas around the hovered cell.
// svelteplot's <Pointer> matches heatmap cells by nearest-point distance
// rather than a dedicated per-category hit area (see BarPlot's own hover
// test for why that makes simulating a real hover here impractical) — these
// tests exercise the marker's static (no-hover) baseline and its
// configuration surface only.
describe('HeatmapPlot – markers.hover areaX/areaY', () => {
  test('renders with areaX/areaY configured and shows no highlight before any hover', async () => {
    const { container } = await render(HeatmapPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      markers: [{ type: 'hover', areaX: true, areaY: true }] satisfies AxisBasedMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    expect(countHoverAreas(svg)).toBe(0);
  });

  test('does not crash with an explicit areaStyle', async () => {
    const { container } = await render(HeatmapPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      markers: [
        { type: 'hover', areaX: true, areaY: true, areaStyle: { width: 20, fill: '#e11d48' } },
      ] satisfies AxisBasedMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });
});
