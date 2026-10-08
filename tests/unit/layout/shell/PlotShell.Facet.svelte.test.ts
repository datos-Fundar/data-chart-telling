import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import PlotShellFacetProbe from './PlotShellFacetProbe.svelte';

type Row = { group: string };

const DATA: Row[] = [{ group: 'A' }, { group: 'B' }, { group: 'C' }, { group: 'D' }];

describe('PlotShell - forwards every FacetConfig field through to FacetLayout', () => {
  test("facet.navLayout: 'below' reaches the rendered nav row", async () => {
    // Each `facet.*` field is forwarded individually, so `navLayout` must reach FacetLayout.
    const { container } = await render(PlotShellFacetProbe, {
      data: DATA,
      facet: { by: 'group', columns: 2, mode: 'paginated', pageSize: 1, navLayout: 'below' },
    });

    expect(container.querySelector('.dct-facet-paginated__nav-below')).toBeTruthy();
    expect(container.querySelector('.dct-facet-paginated__nav')).toBeFalsy();
  });

  test('facet.pageSize reaches FacetLayout (one cell per page, not the full grid)', async () => {
    const { container } = await render(PlotShellFacetProbe, {
      data: DATA,
      facet: { by: 'group', columns: 2, mode: 'paginated', pageSize: 1 },
    });

    expect(container.querySelectorAll('[data-testid="cell"]').length).toBe(1);
  });
});
