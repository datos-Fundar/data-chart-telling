import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import type { Marker } from '$lib/types/markers/common';
import { AGE_GROUPS, POPULATION_PYRAMID } from '../../../../../stories/data/population-pyramid';
import { waitForSvg } from '../../_helpers/svg';

const DATA_PROPS = {
  data: POPULATION_PYRAMID.filter((d) => d.year === 2022),
  x: 'pct' as const,
  y: 'ageGroup' as const,
  z: 'sex' as const,
  scales: { y: { domain: AGE_GROUPS } },
};

describe('PyramidPlot – markers.rules', () => {
  test('ruleX renders a vertical rule line at a magnitude threshold', async () => {
    const { container } = await render(PyramidPlot, {
      width: 560,
      height: 520,
      ...DATA_PROPS,
      markers: [{ type: 'ruleX', x: 3 } satisfies Marker],
    });
    const svg = await waitForSvg(container);
    expect(svg.querySelectorAll('g.rule-x line').length).toBe(1);
  });

  test('multiple ruleX markers each render their own line', async () => {
    const { container } = await render(PyramidPlot, {
      width: 560,
      height: 520,
      ...DATA_PROPS,
      markers: [
        { type: 'ruleX', x: 2.5 } satisfies Marker,
        { type: 'ruleX', x: 3.5 } satisfies Marker,
      ],
    });
    const svg = await waitForSvg(container);
    expect(svg.querySelectorAll('g.rule-x line').length).toBe(2);
  });

  test('symmetric ruleX markers render on both sides of the diverging axis', async () => {
    const { container } = await render(PyramidPlot, {
      width: 560,
      height: 520,
      ...DATA_PROPS,
      markers: [
        { type: 'ruleX', x: -2 } satisfies Marker,
        { type: 'ruleX', x: 2 } satisfies Marker,
      ],
    });
    const svg = await waitForSvg(container);
    expect(svg.querySelectorAll('g.rule-x line').length).toBe(2);
  });

  test('a ruleX style override changes the rendered stroke color', async () => {
    const { container } = await render(PyramidPlot, {
      width: 560,
      height: 520,
      ...DATA_PROPS,
      markers: [{ type: 'ruleX', x: 3, style: { stroke: '#e11d48' } } satisfies Marker],
    });
    const svg = await waitForSvg(container);
    const line = svg.querySelector('g.rule-x line');
    expect(line?.getAttribute('style')).toContain('stroke: rgb(225, 29, 72)');
  });

  test('does not crash with an empty markers array', async () => {
    const { container } = await render(PyramidPlot, { width: 560, height: 520, ...DATA_PROPS, markers: [] });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });
});
