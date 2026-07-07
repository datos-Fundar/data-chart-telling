import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import DotMarker from '$lib/plots/markers/DotMarker.svelte';
import TextMarker from '$lib/plots/markers/TextMarker.svelte';
import PeakMarker from '$lib/plots/markers/PeakMarker.svelte';
import type { Marker } from '$lib/types/plots/markers';
import type { Segments, LineSegmentStyle } from '$lib/types/plots/styles';
import type { YearPoint } from '../../../../../stories/plots/line/data';
import { FEMALE_LIFE_EXPECTANCY, MALE_LIFE_EXPECTANCY } from '../../../../../stories/plots/line/data';
import { waitForSvg, countDotMarks, countTextLabels } from '../../_helpers/svg';

const FEMALE = { name: 'female', x: 'year' as const, y: 'value' as const, data: FEMALE_LIFE_EXPECTANCY };
const MALE = { name: 'male', x: 'year' as const, y: 'value' as const, data: MALE_LIFE_EXPECTANCY };

describe('LinePlot – markers.custom (component)', () => {
  test('DotMarker places one dot per data point on the target series', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      markers: [
        {
          type: 'component',
          series: 'female',
          component: DotMarker,
          props: { x: (d: YearPoint) => d.year, y: (d: YearPoint) => d.value },
        } satisfies Marker,
      ],
    });
    const svg = await waitForSvg(container);
    expect(countDotMarks(svg)).toBe(FEMALE_LIFE_EXPECTANCY.length);
  });

  test('TextMarker renders one label per data point', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      markers: [
        {
          type: 'component',
          series: 'female',
          component: TextMarker,
          props: {
            x: (d: YearPoint) => d.year,
            y: (d: YearPoint) => d.value,
            text: (d: YearPoint) => String(d.value),
          },
        } satisfies Marker,
      ],
    });
    const svg = await waitForSvg(container);
    expect(countTextLabels(svg)).toBe(FEMALE_LIFE_EXPECTANCY.length);
  });

  test('a component marker scoped to one series does not affect the other', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE, MALE],
      markers: [
        {
          type: 'component',
          series: 'female',
          component: DotMarker,
          props: { x: (d: YearPoint) => d.year, y: (d: YearPoint) => d.value },
        } satisfies Marker,
      ],
    });
    const svg = await waitForSvg(container);
    // Only female's points get dots — male has none.
    expect(countDotMarks(svg)).toBe(FEMALE_LIFE_EXPECTANCY.length);
  });

  test('PeakMarker highlights the maximum value of the series', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      markers: [
        {
          type: 'component',
          series: 'female',
          component: PeakMarker,
          props: { xProp: 'year', yProp: 'value', mode: 'max', label: 'Max' },
        } satisfies Marker,
      ],
    });
    const svg = await waitForSvg(container);
    // One dot + one label for the single peak point.
    expect(countDotMarks(svg)).toBe(1);
    expect(countTextLabels(svg)).toBe(1);
  });

  test('PeakMarker with scope "segment" highlights once per segment', async () => {
    const segments: Segments<LineSegmentStyle> = {
      female: [
        { areas: [{ x: { to: 2014 } }], style: {} },
        { areas: [{ x: { from: 2014 } }], style: { stroke: { strokeDasharray: '6 4' } } },
      ],
    };
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      segments,
      markers: [
        {
          type: 'component',
          series: 'female',
          scope: 'segment',
          component: PeakMarker,
          props: { xProp: 'year', yProp: 'value', mode: 'max', label: 'Max' },
        } satisfies Marker,
      ],
    });
    const svg = await waitForSvg(container);
    // Two segments → two peaks highlighted.
    expect(countDotMarks(svg)).toBe(2);
    expect(countTextLabels(svg)).toBe(2);
  });
});
