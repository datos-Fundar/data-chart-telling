import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import FacetSizeProbe from './FacetSizeProbe.svelte';

function cellSize(container: Element): { width: number; height: number } {
	const cell = container.querySelector('[data-testid="cell"]');
	if (!cell) throw new Error('no facet cell rendered');
	return {
		width: Number(cell.getAttribute('data-width')),
		height: Number(cell.getAttribute('data-height')),
	};
}

describe('FacetLayout - paginated mode sizes cells off the current page, not the total entry count', () => {
	test('pageSize: 1 out of 9 entries fills the chart area instead of being sized as 1 of 3 rows', async () => {
		const { container } = await render(FacetSizeProbe, {
			groupCount: 9,
			columns: 3,
			mode: 'paginated',
			pageSize: 1,
			width: 600,
			height: 400,
		});

		const { height } = cellSize(container);
		// A 3-column, 3-row grid (9 entries / 3 cols) would size a cell to
		// roughly a third of the chart height. A single-entry page must fill
		// nearly the whole height instead.
		expect(height).toBeGreaterThan(300);
	});

	test('pageSize: 4 out of 9 entries, 2 columns sizes a 2x2 page, not a 2x5 grid', async () => {
		const { container } = await render(FacetSizeProbe, {
			groupCount: 9,
			columns: 2,
			mode: 'paginated',
			pageSize: 4,
			width: 600,
			height: 400,
		});

		const { height } = cellSize(container);
		// 9 entries / 2 cols = 5 rows for the full grid, which would squeeze
		// each cell to ~1/5 of the height. The page only has 4 entries (2x2),
		// so cells should be sized off 2 rows instead.
		expect(height).toBeGreaterThan(150);
	});

	test('a full first page (pageSize defaults to columns x rows) is unaffected by the fix', async () => {
		const { container } = await render(FacetSizeProbe, {
			groupCount: 9,
			columns: 3,
			mode: 'paginated',
			width: 600,
			height: 400,
		});

		const { height } = cellSize(container);
		// Default pageSize = 3x3 = 9, i.e. one page holds every entry - same
		// geometry as plain 'grid' mode, so this must match its sizing exactly.
		const grid = await render(FacetSizeProbe, {
			groupCount: 9,
			columns: 3,
			mode: 'grid',
			width: 600,
			height: 400,
		});
		expect(height).toBe(cellSize(grid.container).height);
	});
});

describe('FacetLayout - navLayout', () => {
	test('default (overlay) renders nav buttons and indicator absolutely positioned over the grid', async () => {
		const { container } = await render(FacetSizeProbe, {
			groupCount: 4,
			columns: 2,
			mode: 'paginated',
			pageSize: 1,
			width: 600,
			height: 400,
		});

		expect(container.querySelector('.dct-facet-paginated__nav')).toBeTruthy();
		expect(container.querySelector('.dct-facet-paginated__nav-below')).toBeFalsy();
		expect(container.querySelector('.dct-facet-indicator-slot')).toBeTruthy();
	});

	test("'below' renders prev/indicator/next together in a row beneath the grid, and reserves height for it", async () => {
		const { container } = await render(FacetSizeProbe, {
			groupCount: 4,
			columns: 2,
			mode: 'paginated',
			pageSize: 1,
			navLayout: 'below',
			width: 600,
			height: 400,
		});

		const nav = container.querySelector('.dct-facet-paginated__nav-below');
		expect(nav).toBeTruthy();
		expect(container.querySelector('.dct-facet-paginated__nav')).toBeFalsy();

		const buttons = nav!.querySelectorAll('button');
		expect(buttons.length).toBe(2);
		expect(buttons[0].textContent).toContain('‹');
		expect(buttons[1].textContent).toContain('›');
		// The indicator sits between the two nav buttons, not absolutely
		// positioned off in a corner.
		expect(nav!.textContent).toMatch(/‹.*1 \/ 4.*›/s);

		const { height } = cellSize(container);
		// Reserving ~44px for the below-nav row must shrink the cell versus
		// the overlay layout, which uses the full chart height.
		const overlay = await render(FacetSizeProbe, {
			groupCount: 4,
			columns: 2,
			mode: 'paginated',
			pageSize: 1,
			width: 600,
			height: 400,
		});
		expect(height).toBeLessThan(cellSize(overlay.container).height);
	});

	test("no nav row is reserved or rendered when there's only a single page", async () => {
		const { container } = await render(FacetSizeProbe, {
			groupCount: 2,
			columns: 2,
			mode: 'paginated',
			navLayout: 'below',
			width: 600,
			height: 400,
		});

		expect(container.querySelector('.dct-facet-paginated__nav-below')).toBeFalsy();
	});
});
