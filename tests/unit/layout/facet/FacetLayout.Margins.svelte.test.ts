import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import FacetMarginsProbe from './FacetMarginsProbe.svelte';

function cells(container: Element): { facet: string; left: number; right: number }[] {
  return Array.from(container.querySelectorAll('[data-testid="cell"]')).map((el) => ({
    facet: el.getAttribute('data-facet') ?? '',
    left: Number(el.getAttribute('data-left')),
    right: Number(el.getAttribute('data-right')),
  }));
}

const SHORT_LABELS = [
  { group: 'a', label: 'A' },
  { group: 'b', label: 'B' },
  { group: 'c', label: 'C' },
];

const MIXED_LABELS = [
  { group: 'a', label: 'A' },
  { group: 'b', label: 'A very long label indeed' },
  { group: 'c', label: 'C' },
];

describe('FacetLayout – marginsForFacet (left)', () => {
  test('every cell gets the same left margin', async () => {
    const { container } = await render(FacetMarginsProbe, { rows: MIXED_LABELS });
    const lefts = cells(container).map((c) => c.left);
    expect(lefts).toHaveLength(3);
    expect(new Set(lefts).size).toBe(1);
  });

  test('the shared margin reflects the widest label across every facet', async () => {
    const short = await render(FacetMarginsProbe, { rows: SHORT_LABELS });
    const mixed = await render(FacetMarginsProbe, { rows: MIXED_LABELS });
    expect(cells(mixed.container)[0].left).toBeGreaterThan(cells(short.container)[0].left);
  });

  test('the margin is present on the very first render — no settling or remount needed', async () => {
    const { container } = await render(FacetMarginsProbe, { rows: MIXED_LABELS });
    const lefts = cells(container).map((c) => c.left);
    expect(lefts.every((l) => l > 0)).toBe(true);
  });
});

describe('FacetLayout – marginsForFacet (right, combined with left)', () => {
  test('every cell gets the same right margin', async () => {
    const { container } = await render(FacetMarginsProbe, {
      rows: MIXED_LABELS,
      bothSides: true,
    });
    const rights = cells(container).map((c) => c.right);
    expect(rights).toHaveLength(3);
    expect(new Set(rights).size).toBe(1);
  });

  test('the shared margin reflects the widest label across every facet', async () => {
    const short = await render(FacetMarginsProbe, { rows: SHORT_LABELS, bothSides: true });
    const mixed = await render(FacetMarginsProbe, { rows: MIXED_LABELS, bothSides: true });
    expect(cells(mixed.container)[0].right).toBeGreaterThan(cells(short.container)[0].right);
  });

  test('left and right margins are sized independently, without clobbering each other', async () => {
    const leftOnly = await render(FacetMarginsProbe, { rows: MIXED_LABELS });
    const both = await render(FacetMarginsProbe, { rows: MIXED_LABELS, bothSides: true });
    const leftOnlyCell = cells(leftOnly.container)[0];
    const bothCell = cells(both.container)[0];
    expect(bothCell.right).toBeGreaterThan(0);
    expect(bothCell.left).toBe(leftOnlyCell.left);
  });

  test('data-right is absent when marginsForFacet does not report a right side', async () => {
    const { container } = await render(FacetMarginsProbe, { rows: MIXED_LABELS });
    const cell = container.querySelector('[data-testid="cell"]');
    expect(cell?.hasAttribute('data-right')).toBe(false);
  });
});
