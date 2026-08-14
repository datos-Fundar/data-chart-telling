import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
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
      markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[],
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
      markers: [{ type: 'hover', series: 'female' }] satisfies AxisBasedMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('does not crash with scope "segment" over a segmented series', async () => {
    const segments: SegmentsConfig<BarSegmentStyle> = {
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
      markers: [{ type: 'hover', series: 'female', scope: 'segment' }] satisfies AxisBasedMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('does not crash with ruleX/ruleY explicitly disabled', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      markers: [{ type: 'hover', ruleX: false, ruleY: false }] satisfies AxisBasedMarkersConfig[],
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
        },
      ] satisfies AxisBasedMarkersConfig[],
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
        },
      ] satisfies AxisBasedMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  // Regression: two categories tied on the same value, matched with
  // `strategy: 'x'` on a horizontal (ungrouped, single-series) bar chart —
  // both rows fall back to the same default series name, so `matched` ends
  // up with two same-series points. HoverMarker's `{#each}` used to key
  // purely by `point.series ?? \`${x}_${y}\``, which only fell back to x/y
  // when series was nullish; here series is the truthy default 'series' for
  // both points, so the key collided and Svelte threw a duplicate-key error.
  test('does not crash when two categories tie under strategy: "x" (hover.activePoint tie-break)', async () => {
    const data = [
      { province: 'Buenos Aires', value: 1.38 },
      { province: 'Mendoza', value: 1.38 },
      { province: 'CABA', value: 2.1 },
    ];
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      data,
      x: 'province',
      y: 'value',
      scales: { y: { type: 'categorical' } },
      tooltip: {
        facetId: '',
        sync: false,
        strategy: 'x',
        format: (row) => `${(row as { province: string }).province}`,
      },
      markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    // Per-category hit areas — distinct from the plot's own full-box
    // pointer-catcher rect, which also renders `fill="transparent"` but
    // carries `pointer-events="all"`.
    const hitAreas = svg.querySelectorAll('rect[fill="transparent"]:not([pointer-events])');
    expect(hitAreas.length).toBe(3);
    const target = hitAreas[0] as SVGRectElement;
    const rect = target.getBoundingClientRect();
    target.dispatchEvent(
      new PointerEvent('pointerenter', {
        bubbles: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
      }),
    );
    // Both tied rows (Buenos Aires and Mendoza) should highlight — proving
    // the render survived without crashing on the duplicate key.
    await vi.waitFor(() => {
      expect(countDotMarks(svg)).toBe(2);
    });
  });
});
