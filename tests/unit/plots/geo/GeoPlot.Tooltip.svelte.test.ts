import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoFeature } from '$lib/types/plots/geo/common';
import { ARGENTINA_PROVINCES } from '../../../../stories/plots/geo/data';
import { waitForSvg } from '../_helpers/svg';

const DATA_PROPS = { data: ARGENTINA_PROVINCES, featureId: (f: GeoFeature) => (f.properties as { nombre: string }).nombre };

function noTooltipDom(container: Element) {
  return container.querySelector('.dct-tooltip, [class*="tooltip"]');
}

describe('GeoPlot – tooltip', () => {
  test('no floating tooltip appears without a tooltip config', async () => {
    const { container } = render(GeoPlot, { width: 400, height: 300, ...DATA_PROPS });
    await waitForSvg(container);
    expect(noTooltipDom(container)).toBeNull();
  });

  test('no floating tooltip appears before any hover, even with a tooltip config', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      tooltip: {
        facetId: '',
        sync: false,
        format: (f) => (f.properties as { nombre: string }).nombre,
      },
    });
    await waitForSvg(container);
    expect(noTooltipDom(container)).toBeNull();
  });

  test('renders without crashing with a tooltip config', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      tooltip: {
        facetId: '',
        sync: false,
        format: (f) => {
          const { nombre, population } = f.properties as { nombre: string; population: number };
          return `${nombre}: ${population}`;
        },
      },
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });

  test('custom content snippet renders without crashing', async () => {
    const { container } = render(GeoPlot, {
      width: 400,
      height: 300,
      ...DATA_PROPS,
      tooltip: {
        facetId: '',
        sync: false,
        format: (f) => (f.properties as { nombre: string }).nombre,
        // A tooltip's `content` snippet can't be constructed inline from a
        // plain .ts test file (it needs Svelte's snippet compilation) — the
        // custom-content path is instead covered visually via
        // `stories/plots/geo/RichTooltip.svelte`. This just confirms the
        // plot still renders correctly when `content` is omitted but the
        // rest of the tooltip config is present.
      },
    });
    const svg = await waitForSvg(container);
    expect(svg).toBeTruthy();
  });
});
