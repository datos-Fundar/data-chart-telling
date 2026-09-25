import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { LineMarkersConfig } from '$lib/types/markers/line';
import { FEMALE_LIFE_EXPECTANCY } from '../../../../../stories/plots/line/data';
import { waitForSvg } from '../../_helpers/svg';

const FEMALE = { name: 'female', x: 'year' as const, y: 'value' as const, data: FEMALE_LIFE_EXPECTANCY };

describe('LinePlot – markers.rules', () => {
  test('ruleX renders a vertical rule line', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      markers: [{ type: 'rule', axis: 'x', value: 2016 }] satisfies LineMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    expect(svg.querySelectorAll('g.rule-x line').length).toBe(1);
  });

  test('ruleY renders a horizontal rule line', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      markers: [{ type: 'rule', axis: 'y', value: 80 }] satisfies LineMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    expect(svg.querySelectorAll('g.rule-y line').length).toBe(1);
  });

  test('multiple ruleX markers each render their own line', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      markers: [
        { type: 'rule', axis: 'x', value: 2010 },
        { type: 'rule', axis: 'x', value: 2018 },
      ] satisfies LineMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    expect(svg.querySelectorAll('g.rule-x line').length).toBe(2);
  });

  test('mixed ruleX and ruleY markers both render', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      markers: [
        { type: 'rule', axis: 'x', value: 2016 },
        { type: 'rule', axis: 'y', value: 80 },
      ] satisfies LineMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    expect(svg.querySelectorAll('g.rule-x line').length).toBe(1);
    expect(svg.querySelectorAll('g.rule-y line').length).toBe(1);
  });

  test('a ruleX style override changes the rendered stroke color', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      markers: [{ type: 'rule', axis: 'x', value: 2016, styles: { stroke: '#e11d48' } }] satisfies LineMarkersConfig[],
    });
    const svg = await waitForSvg(container);
    const line = svg.querySelector('g.rule-x line');
    expect(line?.getAttribute('style')).toContain('stroke: rgb(225, 29, 72)');
  });

  test('does not crash with an empty markers array', async () => {
    const { container } = await render(LinePlot, { width: 400, height: 300, series: [FEMALE], markers: [] });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });
});
