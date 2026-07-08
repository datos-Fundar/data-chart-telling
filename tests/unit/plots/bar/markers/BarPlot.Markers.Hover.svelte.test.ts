import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import type { Marker } from '$lib/types/plots/markers';
import type { Segments, BarSegmentStyle } from '$lib/types/plots/styles';
import { FEMALE_LIFE_EXPECTANCY_BY_PROVINCE, LIFE_EXPECTANCY_BY_PROVINCE } from '../../../../../stories/plots/bar/data';
import { waitForSvg, countDotMarks, countTextLabels } from '../../_helpers/svg';

const FEMALE = { name: 'female', x: 'province' as const, y: 'value' as const, data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE };

// The hover marker's dot/label/rules only appear once svelteplot's <Pointer>
// reports a match, which requires a real cursor position over the rendered
// marks. These tests exercise the marker's static (no-hover) baseline and
// its configuration surface — not the interactive matching itself.
describe('BarPlot – markers.hover', () => {
  test('renders with a basic hover marker and shows nothing before any hover', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      markers: [{ type: 'hover' } satisfies Marker],
    });
    const svg = await waitForSvg(container);
    expect(countDotMarks(svg)).toBe(0);
    expect(countTextLabels(svg)).toBe(0);
  });

  test('does not crash when scoped to a single series', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      data: LIFE_EXPECTANCY_BY_PROVINCE,
      x: 'province',
      y: 'value',
      z: 'sex',
      markers: [{ type: 'hover', series: 'female' } satisfies Marker],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('does not crash with scope "segment" over a segmented series', async () => {
    const segments: Segments<BarSegmentStyle> = {
      female: [
        { areas: [{ x: { from: 'Buenos Aires', to: 'Córdoba' } }], style: {} },
        { style: { fillOpacity: 0.4 } },
      ],
    };
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      segments,
      markers: [{ type: 'hover', series: 'female', scope: 'segment' } satisfies Marker],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('does not crash with ruleX/ruleY explicitly disabled', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      markers: [{ type: 'hover', ruleX: false, ruleY: false } satisfies Marker],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('does not crash with custom dot/font/rule style overrides', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      markers: [
        {
          type: 'hover',
          dotStyle: { dotRadius: 6, dotFill: '#e11d48' },
          fontStyle: { fontSize: 14 },
          ruleStyle: { strokeDasharray: '2 2' },
        } satisfies Marker,
      ],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('does not crash with a custom label format', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      markers: [
        {
          type: 'hover',
          format: (point) => `${point.x}: ${point.y}`,
        } satisfies Marker,
      ],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });
});
