import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import PlotFacetProbe from './PlotFacetProbe.svelte';

type Row = { group: string };

const DATA: Row[] = [{ group: 'A' }, { group: 'B' }, { group: 'C' }, { group: 'D' }];

describe('Plot - forwards every FacetConfig field through to FacetLayout', () => {
	test("facet.navLayout: 'below' reaches the rendered nav row", async () => {
		// Each `facet.*` field is forwarded individually, so `navLayout` must reach FacetLayout.
		const { container } = await render(PlotFacetProbe, {
			data: DATA,
			facet: { by: 'group', columns: 2, mode: 'paginated', pageSize: 1, navLayout: 'below' }
		});

		expect(container.querySelector('.dct-facet-paginated__nav-below')).toBeTruthy();
		expect(container.querySelector('.dct-facet-paginated__nav')).toBeFalsy();
	});

	test('facet.pageSize reaches FacetLayout (one cell per page, not the full grid)', async () => {
		const { container } = await render(PlotFacetProbe, {
			data: DATA,
			facet: { by: 'group', columns: 2, mode: 'paginated', pageSize: 1 }
		});

		expect(container.querySelectorAll('[data-testid="cell"]').length).toBe(1);
	});

	test('without chrome, the facet nav still reads the theme vars', async () => {
		const { container } = await render(PlotFacetProbe, {
			data: DATA,
			facet: { by: 'group', columns: 2, mode: 'paginated', pageSize: 1 }
		});
		const indicator = container.querySelector<HTMLElement>('.dct-facet-indicator')!;
		expect(getComputedStyle(indicator).getPropertyValue('--dct-facet-indicator-bg')).not.toBe('');
	});
});
