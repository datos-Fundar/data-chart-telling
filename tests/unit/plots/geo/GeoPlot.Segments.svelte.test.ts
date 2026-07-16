import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { Segments } from '$lib/types/plots/styles';
import type { GeoSegmentStyle } from '$lib/types/plots/geo/styles';
import type { GeoFeature } from '$lib/types/plots/geo/common';
import { ARGENTINA_PROVINCES } from '../../../../stories/plots/geo/data';
import { waitForSvg, countGeoPaths } from '../_helpers/svg';

const DATA_PROPS = {
  data: ARGENTINA_PROVINCES,
  featureId: (f: GeoFeature) => (f.properties as { nombre: string }).nombre,
};

function styleAttrs(svg: SVGElement): string[] {
  return Array.from(svg.querySelectorAll('g.geo path, path.geo')).map((p) => p.getAttribute('style') ?? '');
}

describe('GeoPlot – segments (keyed by feature id)', () => {
  test('one feature is styled by its id; the rest fall back to default', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      segments: {
        'Buenos Aires': [{ style: { fill: '#e11d48' } }],
        default: [{ style: { fill: '#94a3b8' } }],
      } satisfies Segments<GeoSegmentStyle>,
    });
    const svg = await waitForSvg(container);
    expect(countGeoPaths(svg)).toBe(ARGENTINA_PROVINCES.length);
    const styles = styleAttrs(svg);
    expect(styles.filter((s) => s.includes('rgb(225, 29, 72)')).length).toBe(1);
    expect(styles.filter((s) => s.includes('rgb(148, 163, 184)')).length).toBe(ARGENTINA_PROVINCES.length - 1);
  });

  test('several features can each carry their own style', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      segments: {
        'Buenos Aires': [{ style: { fill: '#1d4ed8' } }],
        Córdoba: [{ style: { fill: '#f59e0b' } }],
        default: [{ style: { fill: '#e2e8f0' } }],
      } satisfies Segments<GeoSegmentStyle>,
    });
    const svg = await waitForSvg(container);
    const styles = styleAttrs(svg);
    expect(styles.filter((s) => s.includes('rgb(29, 78, 216)')).length).toBe(1);
    expect(styles.filter((s) => s.includes('rgb(245, 158, 11)')).length).toBe(1);
    expect(styles.filter((s) => s.includes('rgb(226, 232, 240)')).length).toBe(ARGENTINA_PROVINCES.length - 2);
  });

  test('a feature-specific entry merges over the default, keeping unset fields', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      segments: {
        default: [{ style: { fill: '#94a3b8', strokeWidth: 2 } }],
        Mendoza: [{ style: { fillOpacity: 0.4 } }],
      } satisfies Segments<GeoSegmentStyle>,
    });
    const svg = await waitForSvg(container);
    const styles = styleAttrs(svg);
    // Every feature keeps stroke-width: 2 from the default...
    expect(styles.every((s) => s.includes('stroke-width: 2'))).toBe(true);
    // ...but only Mendoza carries the feature-specific fill-opacity override.
    expect(styles.filter((s) => s.includes('fill-opacity: 0.4')).length).toBe(1);
  });

  test('no segments configured: every feature uses the base style', async () => {
    const { container } = render(GeoPlot, { width: 400, height: 300, ...DATA_PROPS });
    const svg = await waitForSvg(container);
    expect(countGeoPaths(svg)).toBe(ARGENTINA_PROVINCES.length);
    expect(styleAttrs(svg).every((s) => s.length > 0)).toBe(true);
  });
});
