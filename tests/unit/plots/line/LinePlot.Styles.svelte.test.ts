import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { BasePlotStylesConfig } from '$lib/types/layout/styles';
import { FEMALE_LIFE_EXPECTANCY, MALE_LIFE_EXPECTANCY } from '../../../../stories/plots/line/data';
import { waitForSvg, countTextLabels } from '../_helpers/svg';

const FEMALE = { name: 'female', x: 'year' as const, y: 'value' as const, data: FEMALE_LIFE_EXPECTANCY };
const MALE = { name: 'male', x: 'year' as const, y: 'value' as const, data: MALE_LIFE_EXPECTANCY };

describe('LinePlot – styles.values', () => {
  test('no value label by default', async () => {
    const { container } = await render(LinePlot, { width: 400, height: 300, series: [FEMALE] });
    const svg = await waitForSvg(container);
    expect(countTextLabels(svg)).toBe(0);
  });

  test('values.show renders one label per series, at its last point', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      styles: { values: { show: true } } satisfies BasePlotStylesConfig,
      margins: { right: 80 },
    });
    const svg = await waitForSvg(container);
    expect(countTextLabels(svg)).toBe(1);
    const last = FEMALE_LIFE_EXPECTANCY[FEMALE_LIFE_EXPECTANCY.length - 1];
    expect(svg.querySelector('g.text text')?.textContent).toBe(`female - ${last.value}`);
  });

  test('a custom format callback overrides the default label text', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      styles: {
        values: { show: true, format: (v, name) => `${name} → ${v.toFixed(1)} yr` },
      } satisfies BasePlotStylesConfig,
      margins: { right: 120 },
    });
    const svg = await waitForSvg(container);
    const last = FEMALE_LIFE_EXPECTANCY[FEMALE_LIFE_EXPECTANCY.length - 1];
    expect(svg.querySelector('g.text text')?.textContent).toBe(`female → ${last.value.toFixed(1)} yr`);
  });

  test('two series get two independent end-point labels', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE, MALE],
      styles: {
        values: { show: true, format: (v, name) => `${name} (${v})` },
      } satisfies BasePlotStylesConfig,
      margins: { right: 80 },
    });
    const svg = await waitForSvg(container);
    const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
    const lastFemale = FEMALE_LIFE_EXPECTANCY[FEMALE_LIFE_EXPECTANCY.length - 1].value;
    const lastMale = MALE_LIFE_EXPECTANCY[MALE_LIFE_EXPECTANCY.length - 1].value;
    expect(labels).toEqual(expect.arrayContaining([`female (${lastFemale})`, `male (${lastMale})`]));
  });
});

describe('LinePlot – styles.frame', () => {
  test('no frame by default', async () => {
    const { container } = await render(LinePlot, { width: 400, height: 300, series: [FEMALE] });
    const svg = await waitForSvg(container);
    expect(svg.querySelector('.frame')).toBeNull();
  });

  test('frame: true renders a border with no explicit style', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      styles: { frame: true } satisfies BasePlotStylesConfig,
    });
    const svg = await waitForSvg(container);
    expect(svg.querySelector('rect.frame')).toBeTruthy();
  });

  test('a frame style object overrides stroke/fill/width', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      styles: {
        frame: { stroke: '#6366f1', strokeWidth: 3, fill: '#6366f1', fillOpacity: 0.05 },
      } satisfies BasePlotStylesConfig,
    });
    const svg = await waitForSvg(container);
    const frame = svg.querySelector('rect.frame') as HTMLElement;
    expect(frame).toBeTruthy();
    expect(frame.style.stroke).toBe('rgb(99, 102, 241)');
    expect(frame.style.strokeWidth).toBe('3px');
  });

  test('inset pulls the frame in from the content box edges', async () => {
    const { container: plainContainer } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      styles: { frame: true } satisfies BasePlotStylesConfig,
    });
    const plainSvg = await waitForSvg(plainContainer);
    const plainWidth = Number(plainSvg.querySelector('rect.frame')?.getAttribute('width'));

    const { container: insetContainer } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE],
      styles: { frame: { inset: 20 } } satisfies BasePlotStylesConfig,
    });
    const insetSvg = await waitForSvg(insetContainer);
    const insetWidth = Number(insetSvg.querySelector('rect.frame')?.getAttribute('width'));

    expect(insetWidth).toBeLessThan(plainWidth);
  });
});
