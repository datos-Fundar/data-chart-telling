import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import type { Segments, BarSegmentStyle, Area } from '$lib/types/plots/styles';
import { AGE_GROUPS, POPULATION_PYRAMID } from '../../../../stories/data/population-pyramid';
import { waitForSvg } from '../_helpers/svg';

const DATA_2022 = POPULATION_PYRAMID.filter((d) => d.year === 2022);
const DATA_PROPS = { data: DATA_2022, x: 'pct' as const, y: 'ageGroup' as const, z: 'sex' as const };

// Age group labels are 5-year bins whose bucket-start numbers don't sort
// correctly as plain strings (e.g. '5-9' > '20-24' lexicographically), so
// each matching bucket is addressed as its own single-point area.
function areasFor(ageGroups: string[]): Area[] {
  return ageGroups.map((ageGroup) => ({ x: { from: ageGroup, to: ageGroup } }));
}

function barStyles(svg: SVGElement): string[] {
  return Array.from(svg.querySelectorAll('g.bar-x rect')).map((r) => r.getAttribute('style') ?? '');
}

describe('PyramidPlot – segments ("default" key applies to every series)', () => {
  test('an area segment and the catch-all each apply their own fillOpacity', async () => {
    const highlighted = ['80-84', '85+'];
    const { container } = await render(PyramidPlot, {
      width: 560,
      height: 520,
      ...DATA_PROPS,
      scales: { y: { domain: AGE_GROUPS } },
      segments: {
        default: [
          { areas: areasFor(highlighted), style: { fillOpacity: 1 } },
          { style: { fillOpacity: 0.25 } },
        ],
      } satisfies Segments<BarSegmentStyle>,
    });
    const svg = await waitForSvg(container);
    const styles = barStyles(svg);
    const matchedCount = DATA_2022.filter((d) => highlighted.includes(d.ageGroup)).length;
    expect(styles.filter((s) => s.includes('fill-opacity: 1;')).length).toBe(matchedCount);
    expect(styles.filter((s) => s.includes('fill-opacity: 0.25')).length).toBe(
      DATA_2022.length - matchedCount,
    );
  });

  test('warns when the "default" key has more than one catch-all segment', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(PyramidPlot, {
      width: 560,
      height: 520,
      ...DATA_PROPS,
      segments: {
        default: [{ style: {} }, { style: {} }],
      } satisfies Segments<BarSegmentStyle>,
    });
    await vi.waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('no areas'));
    }, { timeout: 1000 });
    warn.mockRestore();
  });

  test('an area-specific segment inherits fill color from the catch-all', async () => {
    const { container } = await render(PyramidPlot, {
      width: 560,
      height: 520,
      ...DATA_PROPS,
      scales: { y: { domain: AGE_GROUPS } },
      segments: {
        default: [
          { style: { fill: '#e11d48' } },
          { areas: areasFor(['80-84', '85+']), style: { fillOpacity: 0.5 } },
        ],
      } satisfies Segments<BarSegmentStyle>,
    });
    const svg = await waitForSvg(container);
    const styles = barStyles(svg);
    expect(styles.length).toBe(DATA_2022.length);
    styles.forEach((s) => expect(s).toContain('fill: rgb(225, 29, 72)'));
  });
});

describe('PyramidPlot – segments keyed by series name', () => {
  test('a segment keyed by series name only affects that series', async () => {
    const { container } = await render(PyramidPlot, {
      width: 560,
      height: 520,
      ...DATA_PROPS,
      scales: { y: { domain: AGE_GROUPS } },
      segments: {
        Mujeres: [
          { areas: areasFor(['80-84', '85+']), style: { fillOpacity: 1 } },
          { style: { fillOpacity: 0.25 } },
        ],
      } satisfies Segments<BarSegmentStyle>,
    });
    const svg = await waitForSvg(container);
    const styles = barStyles(svg);
    const highlightedFemaleRows = DATA_2022.filter(
      (d) => d.sex === 'Mujeres' && ['80-84', '85+'].includes(d.ageGroup),
    ).length;
    const maleRows = DATA_2022.filter((d) => d.sex === 'Varones').length;
    // Varones bars are untouched by the Mujeres-only segments, so they fall
    // back to BarX's own default fillOpacity (1), same as the highlighted rows.
    expect(styles.filter((s) => s.includes('fill-opacity: 1;')).length).toBe(
      highlightedFemaleRows + maleRows,
    );
  });

  test('two series can each get independent, asymmetric highlight rules', async () => {
    const { container } = await render(PyramidPlot, {
      width: 560,
      height: 520,
      ...DATA_PROPS,
      scales: { y: { domain: AGE_GROUPS } },
      segments: {
        Mujeres: [
          { areas: areasFor(['80-84', '85+']), style: { fillOpacity: 1 } },
          { style: { fillOpacity: 0.25 } },
        ],
        Varones: [
          { areas: areasFor(AGE_GROUPS.filter((ag) => parseInt(ag) >= 25 && parseInt(ag) < 55)), style: { fillOpacity: 1 } },
          { style: { fillOpacity: 0.25 } },
        ],
      } satisfies Segments<BarSegmentStyle>,
    });
    const svg = await waitForSvg(container);
    const styles = barStyles(svg);
    expect(styles.length).toBe(DATA_2022.length);
    expect(styles.filter((s) => s.includes('fill-opacity: 1;')).length).toBeGreaterThan(0);
    expect(styles.filter((s) => s.includes('fill-opacity: 0.25')).length).toBeGreaterThan(0);
  });
});
