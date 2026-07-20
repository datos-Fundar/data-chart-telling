import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { Topology } from '$lib/types/plots/data/geo';
import { ARGENTINA_PROVINCES } from '../../../../stories/plots/geo/data';
import { waitForSvg, countGeoPaths } from '../_helpers/svg';

describe('GeoPlot – data formats', () => {
  test('renders from a plain feature array', async () => {
    const { container } = render(GeoPlot, { width: 400, height: 300, data: ARGENTINA_PROVINCES });
    const svg = await waitForSvg(container);
    expect(countGeoPaths(svg)).toBe(ARGENTINA_PROVINCES.length);
  });

  test('renders from a GeoJSON FeatureCollection', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      data: { type: 'FeatureCollection', features: ARGENTINA_PROVINCES },
    });
    const svg = await waitForSvg(container);
    expect(countGeoPaths(svg)).toBe(ARGENTINA_PROVINCES.length);
  });

  test('does not crash with an empty feature array', async () => {
    const { container } = render(GeoPlot, { width: 400, height: 300, data: [] });
    const svg = await waitForSvg(container);
    expect(countGeoPaths(svg)).toBe(0);
  });
});

describe('GeoPlot – featureId', () => {
  test('default featureId resolves from properties.id (used by segments)', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      data: ARGENTINA_PROVINCES,
      // '06' is Buenos Aires' own `properties.id` — the default featureId
      // chain (`feature.id ?? properties.id ?? properties.name`) picks this
      // up before falling through to any name field.
      segments: { '06': [{ style: { fill: 'tomato' } }] },
    });
    const svg = await waitForSvg(container);
    const fills = [...svg.querySelectorAll('g.geo path, path.geo')].map(
      (p) => p.getAttribute('fill') ?? p.getAttribute('style') ?? '',
    );
    expect(fills.some((s) => s.includes('tomato'))).toBe(true);
  });

  test('explicit featureId accessor is used for segment matching instead of the default', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      data: ARGENTINA_PROVINCES,
      featureId: (f) => `province:${(f.properties as { nombre: string }).nombre}`,
      segments: { 'province:Buenos Aires': [{ style: { fill: 'tomato' } }] },
    });
    const svg = await waitForSvg(container);
    const fills = [...svg.querySelectorAll('g.geo path, path.geo')].map(
      (p) => p.getAttribute('fill') ?? p.getAttribute('style') ?? '',
    );
    expect(fills.some((s) => s.includes('tomato'))).toBe(true);
  });
});

describe('GeoPlot – TopoJSON input', () => {
  const TOPOLOGY: Topology = {
    type: 'Topology',
    objects: {
      squares: {
        type: 'GeometryCollection',
        geometries: [
          { type: 'Polygon', properties: { name: 'west' }, arcs: [[0, 1]] },
          { type: 'Polygon', properties: { name: 'east' }, arcs: [[2, -1]] },
        ],
      },
    },
    arcs: [
      [
        [-65, -40],
        [-65, -30],
      ],
      [
        [-65, -30],
        [-70, -30],
        [-70, -40],
        [-65, -40],
      ],
      [
        [-65, -40],
        [-60, -40],
        [-60, -30],
        [-65, -30],
      ],
    ],
  };

  test('converts a Topology via topojson-client and renders its features', async () => {
    const { container } = render(GeoPlot, { width: 400, height: 300, data: TOPOLOGY, object: 'squares' });
    const svg = await waitForSvg(container);
    await vi.waitFor(() => expect(countGeoPaths(svg)).toBe(2), { timeout: 3000 });
  });

  test('warns and renders nothing when `object` is omitted for a Topology', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(GeoPlot, { width: 400, height: 300, data: TOPOLOGY });
    const svg = await waitForSvg(container);
    expect(countGeoPaths(svg)).toBe(0);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no `object` key'));
    warn.mockRestore();
  });
});
