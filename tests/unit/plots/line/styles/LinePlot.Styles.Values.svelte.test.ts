import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { FEMALE_LIFE_EXPECTANCY, MALE_LIFE_EXPECTANCY } from '../../../../../stories/plots/line/data';
import { waitForSvg, countTextLabels } from '../../_helpers/svg';

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
      styles: { values: { show: true } } satisfies AxisBasedStylesConfig,
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
      } satisfies AxisBasedStylesConfig,
      margins: { right: 120 },
    });
    const svg = await waitForSvg(container);
    const last = FEMALE_LIFE_EXPECTANCY[FEMALE_LIFE_EXPECTANCY.length - 1];
    expect(svg.querySelector('g.text text')?.textContent).toBe(`female → ${last.value.toFixed(1)} yr`);
  });

  test('measuring label overflow into the margin never triggers a runaway effect loop', async () => {
    // Regression test: end-point labels overflowing the plot's top margin
    // (the default `anchor: 'start'` overlaps content above the last data
    // point) used to grow that margin via `createLabelMarginTracker`, which
    // fed straight back into svelteplot's `<Plot margin>` as a live
    // post-mount prop change — sending its own auto-margin sizing into a
    // permanent one-pixel oscillation that kept re-triggering the overflow
    // watcher forever, tripping Svelte's `effect_update_depth_exceeded`
    // guard (see `BasePlotLayout`'s `marginRemountKey` doc comment for the
    // actual fix). Only reproduced with an *explicit* margin already set on
    // another side (here `right`) alongside the auto-grown one; a bare
    // `values.show` alone didn't trigger it.
    const errors: unknown[][] = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((...args) => {
      errors.push(args);
    });
    try {
      await render(LinePlot, {
        width: 400,
        height: 300,
        series: [FEMALE],
        styles: { values: { show: true } } satisfies AxisBasedStylesConfig,
        margins: { right: 80 },
      });
      // The loop (when present) fires across several animation frames, not
      // within the same microtask — give it room to show up.
      await new Promise((r) => setTimeout(r, 500));
    } finally {
      spy.mockRestore();
    }
    const messages = errors.map((args) => args.map(String).join(' ')).join('\n');
    expect(messages).not.toMatch(/effect_update_depth_exceeded/);
  });

  test('two series get two independent end-point labels', async () => {
    const { container } = await render(LinePlot, {
      width: 400,
      height: 300,
      series: [FEMALE, MALE],
      styles: {
        values: { show: true, format: (v, name) => `${name} (${v})` },
      } satisfies AxisBasedStylesConfig,
      margins: { right: 80 },
    });
    const svg = await waitForSvg(container);
    const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
    const lastFemale = FEMALE_LIFE_EXPECTANCY[FEMALE_LIFE_EXPECTANCY.length - 1].value;
    const lastMale = MALE_LIFE_EXPECTANCY[MALE_LIFE_EXPECTANCY.length - 1].value;
    expect(labels).toEqual(expect.arrayContaining([`female (${lastFemale})`, `male (${lastMale})`]));
  });
});
