import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { FEMALE_LIFE_EXPECTANCY, MALE_LIFE_EXPECTANCY } from '../../../../../stories/plots/line/data';
import { waitForSvg, countLinePaths, countDotMarks, countTextLabels } from '../../_helpers/svg';

const FEMALE = { name: 'female', x: 'year' as const, y: 'value' as const, data: FEMALE_LIFE_EXPECTANCY };
const MALE = { name: 'male', x: 'year' as const, y: 'value' as const, data: MALE_LIFE_EXPECTANCY };

describe('LinePlot - markers.deltas', () => {
  test('a delta between two series renders a connector line, two dots and a label', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE, MALE],
      markers: [
        {
          type: 'delta',
          axis: 'x',
          at: 2020,
          from: { type: 'series', series: 'female' },
          to: { type: 'series', series: 'male' },
        },
      ] satisfies AxisBasedMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    // 2 line paths (female + male) + 1 delta connector.
    expect(countLinePaths(svg)).toBe(3);
    expect(countDotMarks(svg)).toBe(2);
    expect(countTextLabels(svg)).toBe(1);
  });

  test('the label text uses the default one-decimal diff format', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE, MALE],
      markers: [
        {
          type: 'delta',
          axis: 'x',
          at: 2020,
          from: { type: 'series', series: 'female' },
          to: { type: 'series', series: 'male' },
        },
      ] satisfies AxisBasedMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    const female2020 = FEMALE_LIFE_EXPECTANCY.find((d) => d.year === 2020)!.value;
    const male2020 = MALE_LIFE_EXPECTANCY.find((d) => d.year === 2020)!.value;
    const expectedDiff = Math.abs(male2020 - female2020).toFixed(1);
    expect(svg.querySelector('g.text text')?.textContent).toBe(expectedDiff);
  });

  test('a custom formatDiff overrides the label text', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE, MALE],
      markers: [
        {
          type: 'delta',
          axis: 'x',
          at: 2020,
          from: { type: 'series', series: 'female' },
          to: { type: 'series', series: 'male' },
          formatDiff: (diff: number) => `${Math.abs(diff).toFixed(0)} yr`,
        },
      ] satisfies AxisBasedMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    const female2020 = FEMALE_LIFE_EXPECTANCY.find((d) => d.year === 2020)!.value;
    const male2020 = MALE_LIFE_EXPECTANCY.find((d) => d.year === 2020)!.value;
    const expected = `${Math.abs(male2020 - female2020).toFixed(0)} yr`;
    expect(svg.querySelector('g.text text')?.textContent).toBe(expected);
  });

  test('without a `to` target, the delta compares against the Y=0 baseline', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      markers: [
        {
          type: 'delta',
          axis: 'x',
          at: 2020,
          from: { type: 'series', series: 'female' },
        },
      ] satisfies AxisBasedMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    const female2020 = FEMALE_LIFE_EXPECTANCY.find((d) => d.year === 2020)!.value;
    expect(svg.querySelector('g.text text')?.textContent).toBe(female2020.toFixed(1));
  });
});
