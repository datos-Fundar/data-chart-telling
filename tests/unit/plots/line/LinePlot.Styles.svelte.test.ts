import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { BasePlotStyles } from '$lib/types/plots/styles/common';
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
      styles: { values: { show: true } } satisfies BasePlotStyles,
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
      } satisfies BasePlotStyles,
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
      } satisfies BasePlotStyles,
      margins: { right: 80 },
    });
    const svg = await waitForSvg(container);
    const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
    const lastFemale = FEMALE_LIFE_EXPECTANCY[FEMALE_LIFE_EXPECTANCY.length - 1].value;
    const lastMale = MALE_LIFE_EXPECTANCY[MALE_LIFE_EXPECTANCY.length - 1].value;
    expect(labels).toEqual(expect.arrayContaining([`female (${lastFemale})`, `male (${lastMale})`]));
  });
});
