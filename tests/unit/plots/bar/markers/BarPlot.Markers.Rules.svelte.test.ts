import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import type { Marker } from '$lib/types/markers/common';
import { FEMALE_LIFE_EXPECTANCY_BY_PROVINCE } from '../../../../../stories/plots/bar/data';
import { waitForSvg } from '../../_helpers/svg';

const FEMALE = { name: 'female', x: 'province' as const, y: 'value' as const, data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE };

describe('BarPlot – markers.rules', () => {
  test('ruleX renders a vertical rule line at a named category', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      markers: [{ type: 'rule', axis: 'x', value: 'Córdoba' } satisfies Marker],
    });
    const svg = await waitForSvg(container);
    expect(svg.querySelectorAll('g.rule-x line').length).toBe(1);
  });

  test('ruleY renders a horizontal rule line at a threshold value', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      markers: [{ type: 'rule', axis: 'y', value: 82 } satisfies Marker],
    });
    const svg = await waitForSvg(container);
    expect(svg.querySelectorAll('g.rule-y line').length).toBe(1);
  });

  test('multiple ruleX markers each render their own line', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      markers: [
        { type: 'rule', axis: 'x', value: 'Córdoba' } satisfies Marker,
        { type: 'rule', axis: 'x', value: 'Tucumán' } satisfies Marker,
      ],
    });
    const svg = await waitForSvg(container);
    expect(svg.querySelectorAll('g.rule-x line').length).toBe(2);
  });

  test('mixed ruleX and ruleY markers both render', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      markers: [
        { type: 'rule', axis: 'x', value: 'Córdoba' } satisfies Marker,
        { type: 'rule', axis: 'y', value: 82 } satisfies Marker,
      ],
    });
    const svg = await waitForSvg(container);
    expect(svg.querySelectorAll('g.rule-x line').length).toBe(1);
    expect(svg.querySelectorAll('g.rule-y line').length).toBe(1);
  });

  test('a ruleX style override changes the rendered stroke color', async () => {
    const { container } = await render(BarPlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      markers: [{ type: 'rule', axis: 'x', value: 'Córdoba', style: { stroke: '#e11d48' } } satisfies Marker],
    });
    const svg = await waitForSvg(container);
    const line = svg.querySelector('g.rule-x line');
    expect(line?.getAttribute('style')).toContain('stroke: rgb(225, 29, 72)');
  });

  test('does not crash with an empty markers array', async () => {
    const { container } = await render(BarPlot, { width: 400, height: 300, series: [FEMALE], markers: [] });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });
});
