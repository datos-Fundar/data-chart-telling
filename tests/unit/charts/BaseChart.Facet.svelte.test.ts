import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BaseChartFacetProbe from './BaseChartFacetProbe.svelte';

type Row = { group: string };

const DATA: Row[] = [{ group: 'A' }, { group: 'B' }, { group: 'C' }, { group: 'D' }];

describe('BaseChart – forwards every FacetConfig field through to FacetLayout', () => {
  test("facet.navLayout: 'below' reaches the rendered nav row", async () => {
    // Regression test: BaseChart forwards each `facet.*` field to
    // `FacetLayout` individually (not a spread), and `navLayout` was added
    // to `FacetConfig`/`FacetLayout` without also adding it here — so it
    // silently never reached FacetLayout and every chart stayed on the
    // default 'overlay' nav layout no matter what a caller set.
    const { container } = await render(BaseChartFacetProbe, {
      data: DATA,
      facet: { by: 'group', columns: 2, mode: 'paginated', pageSize: 1, navLayout: 'below' },
    });

    expect(container.querySelector('.dct-facet-paginated__nav-below')).toBeTruthy();
    expect(container.querySelector('.dct-facet-paginated__nav')).toBeFalsy();
  });

  test('facet.pageSize reaches FacetLayout (one cell per page, not the full grid)', async () => {
    const { container } = await render(BaseChartFacetProbe, {
      data: DATA,
      facet: { by: 'group', columns: 2, mode: 'paginated', pageSize: 1 },
    });

    expect(container.querySelectorAll('[data-testid="cell"]').length).toBe(1);
  });
});
