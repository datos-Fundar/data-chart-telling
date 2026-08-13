import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoFeature } from '$lib/types/plots/data/geo';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { ARGENTINA_PROVINCES } from '../../../../stories/plots/geo/data';
import { waitForSvg } from '../_helpers/svg';

const DATA_PROPS = { data: ARGENTINA_PROVINCES, featureId: (f: GeoFeature) => (f.properties as { nombre: string }).nombre };

function noTooltipDom(container: Element) {
  return container.querySelector('.dct-tooltip, [class*="tooltip"]');
}

/** Hovers the inset's first rendered feature and returns the cursor's local x/y (within the inset's own box) plus the tooltip's resolved `left`/`top`, once visible. */
async function hoverInsetAndReadTooltip(container: Element): Promise<{ cursorX: number; cursorY: number; left: number; top: number }> {
  await waitForSvg(container);
  const insetPath = container.querySelector('g.dct-geo-inset path') as SVGPathElement;
  const insetRect = container.querySelector('g.dct-geo-inset rect') as SVGRectElement;
  const box = insetRect.getBoundingClientRect();
  const pathBox = insetPath.getBoundingClientRect();
  const clientX = pathBox.left + pathBox.width / 2;
  const clientY = pathBox.top + pathBox.height / 2;
  insetPath.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true, clientX, clientY }));
  await vi.waitFor(() => {
    expect(container.querySelector('.dct-tooltip')).toBeTruthy();
  });
  const tooltip = container.querySelector('.dct-tooltip') as HTMLElement;
  return {
    cursorX: clientX - box.left,
    cursorY: clientY - box.top,
    left: parseFloat(tooltip.style.left),
    top: parseFloat(tooltip.style.top),
  };
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

describe('GeoPlot – inset tooltip anchor inheritance', () => {
  test('an inset tooltip with no anchor of its own inherits the top-level tooltip.anchorX/anchorY', async () => {
    const { container } = render(GeoPlot, {
      width: 800,
      height: 700,
      ...DATA_PROPS,
      tooltip: {
        facetId: '',
        sync: false,
        anchorX: 'left',
        anchorY: 'top',
        format: (f) => (f.properties as { nombre: string }).nombre,
      },
      markers: [
        {
          type: 'inset',
          location: 'right-middle',
          features: ['Córdoba'],
          width: 0.6,
          height: 0.6,
          tooltip: {
            // No anchorX/anchorY here — should inherit the top-level's 'left'/'top'.
            format: (f) => (f.properties as { nombre: string }).nombre,
          },
        },
      ] satisfies GeoMarkersConfig[],
    });
    const { cursorX, cursorY, left, top } = await hoverInsetAndReadTooltip(container);
    expect(left).toBeLessThan(cursorX);
    expect(top).toBeLessThan(cursorY);
  });

  test("an inset's own explicit anchor wins over the inherited top-level one", async () => {
    const { container } = render(GeoPlot, {
      width: 800,
      height: 700,
      ...DATA_PROPS,
      tooltip: {
        facetId: '',
        sync: false,
        anchorX: 'left',
        anchorY: 'top',
        format: (f) => (f.properties as { nombre: string }).nombre,
      },
      markers: [
        {
          type: 'inset',
          location: 'right-middle',
          features: ['Córdoba'],
          width: 0.6,
          height: 0.6,
          tooltip: {
            anchorX: 'right',
            anchorY: 'bottom',
            format: (f) => (f.properties as { nombre: string }).nombre,
          },
        },
      ] satisfies GeoMarkersConfig[],
    });
    const { cursorX, cursorY, left, top } = await hoverInsetAndReadTooltip(container);
    expect(left).toBeGreaterThan(cursorX);
    expect(top).toBeGreaterThan(cursorY);
  });

  test('with neither the inset nor the top-level tooltip setting an anchor, the system default (right/bottom) applies', async () => {
    const { container } = render(GeoPlot, {
      width: 800,
      height: 700,
      ...DATA_PROPS,
      tooltip: {
        facetId: '',
        sync: false,
        format: (f) => (f.properties as { nombre: string }).nombre,
      },
      markers: [
        {
          type: 'inset',
          location: 'right-middle',
          features: ['Córdoba'],
          width: 0.6,
          height: 0.6,
          tooltip: {
            format: (f) => (f.properties as { nombre: string }).nombre,
          },
        },
      ] satisfies GeoMarkersConfig[],
    });
    const { cursorX, cursorY, left, top } = await hoverInsetAndReadTooltip(container);
    expect(left).toBeGreaterThan(cursorX);
    expect(top).toBeGreaterThan(cursorY);
  });
});
