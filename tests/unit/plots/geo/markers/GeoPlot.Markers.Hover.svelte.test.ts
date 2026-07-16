import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarker } from '$lib/types/plots/geo/markers';
import type { GeoFeature } from '$lib/types/plots/geo/common';
import { ARGENTINA_PROVINCES } from '../../../../../stories/plots/geo/data';
import { waitForSvg, countDotMarks, countTextLabels } from '../../_helpers/svg';

const DATA_PROPS = {
  data: ARGENTINA_PROVINCES,
  featureId: (f: GeoFeature) => (f.properties as { nombre: string }).nombre,
};

// The hover marker's dot/label only render on an actual cursor match via
// svelteplot's <Pointer>, which needs real pointer events — these tests only
// assert the static/no-hover baseline (no dot/label yet) and that varied
// configs don't crash, mirroring the same boundary BarPlot's/HeatmapPlot's
// hover marker tests already draw.

describe('GeoPlot – hover marker (static baseline)', () => {
  test('no dot/label before any hover', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      markers: [{ type: 'hover' } satisfies GeoMarker],
    });
    const svg = await waitForSvg(container);
    expect(countDotMarks(svg)).toBe(0);
    expect(countTextLabels(svg)).toBe(0);
  });

  test('showLabels: false does not crash', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      markers: [{ type: 'hover', showLabels: false } satisfies GeoMarker],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('custom format/dotStyle/fontStyle do not crash', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      markers: [
        {
          type: 'hover',
          format: (p) => `📍 ${p.label}`,
          dotStyle: { dotFill: '#dc2626', dotRadius: 8 },
          fontStyle: { fill: '#7f1d1d', fontWeight: 'bold' },
        } satisfies GeoMarker,
      ],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('strategy "nearest-point" warns and falls back without crashing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      markers: [{ type: 'hover', strategy: 'nearest-point' } satisfies GeoMarker],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
    await vi.waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("'nearest-point'"));
    });
    warn.mockRestore();
  });

  test('does not crash with an empty markers array', async () => {
    const { container } = render(GeoPlot, { width: 400, height: 300, ...DATA_PROPS, markers: [] });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });
});
