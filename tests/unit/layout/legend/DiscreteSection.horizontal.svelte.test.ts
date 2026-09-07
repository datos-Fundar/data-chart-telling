import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import DiscreteSectionWidthProbe from './DiscreteSectionWidthProbe.svelte';
import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
import type { DiscreteLegendSection, LegendItem } from '$lib/types/layout/legend';

// Labels are deliberately much wider than any of the test container widths
// below (combined with `flex-shrink: 0` on `.dct-discrete__item`), so exactly
// one item lands per row regardless of font metrics — making the row count
// (and therefore the page chunking) deterministic across environments.
function longItems(count: number): LegendItem[] {
	return Array.from({ length: count }, (_, i) => ({
		name: `series-${i}`,
		label: `Jurisdicción de prueba número ${i}`
	}));
}

// Short, roughly equal-width labels — the opposite of `longItems` above.
// Deliberately much narrower than the container widths this is used with, so
// a single visible item is nowhere near what the container has available —
// exactly the gap needed to catch the container silently shrinking down to
// hug whatever page happens to be showing.
function shortItems(count: number): LegendItem[] {
	return Array.from({ length: count }, (_, i) => ({ name: `s${i}`, label: `Ítem ${i}` }));
}

function visibleContainer(container: Element): Element {
	const el = container.querySelector('.dct-discrete--horizontal:not(.dct-discrete--measure)');
	if (!el) throw new Error('no visible horizontal legend container rendered');
	return el;
}

function visibleLabels(container: Element): string[] {
	return Array.from(visibleContainer(container).querySelectorAll('.dct-discrete__label')).map(
		(el) => el.textContent ?? ''
	);
}

async function waitForRows(container: Element): Promise<void> {
	await vi.waitFor(() => {
		if (visibleLabels(container).length === 0) {
			throw new Error('legend not yet measured/rendered');
		}
	});
}

describe('DiscreteSection – layout: { type: "vertical" } (explicit)', () => {
	test('an explicit vertical layout keeps the grid, with no pagination chrome at all', async () => {
		const section: DiscreteLegendSection = {
			type: 'discrete',
			items: longItems(6),
			layout: { type: 'vertical' }
		};
		const { container } = await render(DiscreteSectionWidthProbe, { section, width: 150 });

		expect(container.querySelector('.dct-discrete--horizontal')).toBeFalsy();
		expect(container.querySelector('.dct-discrete-paginated__btn')).toBeFalsy();
		expect(container.querySelectorAll('.dct-discrete__label').length).toBe(6);
	});
});

describe('DiscreteSection – a lone section defaults to horizontal layout', () => {
	test('omitting layout renders horizontally when the legend has only this one section', async () => {
		const section: DiscreteLegendSection = { type: 'discrete', items: longItems(3) };
		const { container } = await render(DiscreteSectionWidthProbe, { section, width: 2000 });

		await waitForRows(container);
		expect(visibleLabels(container).length).toBe(3);
		expect(container.querySelector('.dct-discrete-paginated__btn')).toBeFalsy();
	});

	test('a second section (of either type) reverts the discrete section to vertical', async () => {
		const sections: DiscreteLegendSection[] = [
			{ type: 'discrete', items: longItems(3) },
			{ type: 'discrete', items: longItems(2) }
		];
		const { container } = await render(LegendLayout, { sections });

		expect(container.querySelectorAll('.dct-discrete--horizontal').length).toBe(0);
		expect(container.querySelectorAll('.dct-discrete__label').length).toBe(5);
	});
});

describe('DiscreteSection – layout: { type: "horizontal" } without overflow', () => {
	test('a single row of items renders no nav arrows', async () => {
		const section: DiscreteLegendSection = {
			type: 'discrete',
			items: longItems(2),
			layout: { type: 'horizontal' }
		};
		const { container } = await render(DiscreteSectionWidthProbe, { section, width: 2000 });

		await waitForRows(container);
		expect(visibleLabels(container).length).toBe(2);
		expect(container.querySelector('.dct-discrete-paginated__btn')).toBeFalsy();
	});
});

describe('DiscreteSection – layout: { type: "horizontal", maxRows: 1 } (default maxRows)', () => {
	test('paginates one item (one row) per page, in order, with no item lost or duplicated', async () => {
		const items = longItems(4);
		const section: DiscreteLegendSection = {
			type: 'discrete',
			items,
			layout: { type: 'horizontal', maxRows: 1 }
		};
		const { container } = await render(DiscreteSectionWidthProbe, { section, width: 150 });

		await waitForRows(container);
		expect(visibleLabels(container)).toEqual([items[0].label]);

		const nextBtn = container.querySelector(
			'button[aria-label="Página siguiente de referencias"]'
		) as HTMLButtonElement;
		const prevBtn = container.querySelector(
			'button[aria-label="Página anterior de referencias"]'
		) as HTMLButtonElement;
		expect(nextBtn).toBeTruthy();
		expect(prevBtn.disabled).toBe(true);

		// No page indicator ("1 / 4") — only the prev button, the rows, and
		// the next button, flanking the rows rather than sitting below them.
		const paginated = container.querySelector('.dct-discrete-paginated') as HTMLElement;
		expect(paginated.children.length).toBe(3);
		expect(paginated.children[0]).toBe(prevBtn);
		expect(paginated.children[1].className).toContain('dct-discrete-horizontal');
		expect(paginated.children[2]).toBe(nextBtn);

		const seen: string[] = [];
		for (let i = 0; i < items.length; i++) {
			seen.push(...visibleLabels(container));
			if (i < items.length - 1) {
				expect(nextBtn.disabled).toBe(false);
				nextBtn.click();
				await new Promise((r) => setTimeout(r, 50));
			}
		}
		expect(nextBtn.disabled).toBe(true);
		expect(seen).toEqual(items.map((it) => it.label));

		// Step back through and confirm it retraces the exact same pages.
		for (let i = items.length - 2; i >= 0; i--) {
			prevBtn.click();
			await new Promise((r) => setTimeout(r, 50));
			expect(visibleLabels(container)).toEqual([items[i].label]);
		}
		expect(prevBtn.disabled).toBe(true);
	});
});

describe('DiscreteSection – layout: { type: "horizontal", maxRows: 2 }', () => {
	test('5 single-item rows chunk into pages of 2, 2, then 1 — the exact scenario reported', async () => {
		const items = longItems(5);
		const section: DiscreteLegendSection = {
			type: 'discrete',
			items,
			layout: { type: 'horizontal', maxRows: 2 }
		};
		const { container } = await render(DiscreteSectionWidthProbe, { section, width: 150 });

		await waitForRows(container);
		expect(visibleLabels(container)).toEqual([items[0].label, items[1].label]);

		const nextBtn = container.querySelector(
			'button[aria-label="Página siguiente de referencias"]'
		) as HTMLButtonElement;

		nextBtn.click();
		await new Promise((r) => setTimeout(r, 50));
		expect(visibleLabels(container)).toEqual([items[2].label, items[3].label]);

		nextBtn.click();
		await new Promise((r) => setTimeout(r, 50));
		expect(visibleLabels(container)).toEqual([items[4].label]);
		expect(nextBtn.disabled).toBe(true);
	});
});

describe('DiscreteSection – regression: the paginated container must not shrink across pages', () => {
	test('container width stays constant, and every item appears exactly once, across every page', async () => {
		// Short items on purpose: a single visible item is nowhere near the
		// 300px available, so if the container quietly shrinks down to fit
		// whatever's currently showing (rather than staying pinned at the full
		// available width), it's obvious here — with `longItems` a lone item
		// is already close to the container width, masking exactly this bug.
		const items = shortItems(24);
		const section: DiscreteLegendSection = {
			type: 'discrete',
			items,
			layout: { type: 'horizontal', maxRows: 1 }
		};
		const { container } = await render(DiscreteSectionWidthProbe, { section, width: 300 });

		await waitForRows(container);
		const paginated = container.querySelector('.dct-discrete-paginated') as HTMLElement;
		const widthAtPage1 = paginated.getBoundingClientRect().width;
		// Comfortably wider than any single short item, so a collapse to
		// content-size would read as a clear drop, not sub-pixel noise.
		expect(widthAtPage1).toBeGreaterThan(200);

		const nextBtn = container.querySelector(
			'button[aria-label="Página siguiente de referencias"]'
		) as HTMLButtonElement;

		const seen: string[] = [...visibleLabels(container)];
		let guard = 0;
		while (!nextBtn.disabled && guard < 30) {
			nextBtn.click();

			await new Promise((r) => setTimeout(r, 50));
			expect(paginated.getBoundingClientRect().width).toBeCloseTo(widthAtPage1, 0);
			seen.push(...visibleLabels(container));
			guard++;
		}

		// The exact symptom reported: a shrinking container re-measures at an
		// ever-narrower width on every page, which desyncs `rows` from what's
		// actually rendered and shows up as items skipped or repeated across
		// the page sequence instead of each appearing exactly once.
		expect(new Set(seen).size).toBe(seen.length);
		expect(new Set(seen)).toEqual(new Set(items.map((it) => it.label)));
	});
});

describe('DiscreteSection – custom navButton snippet', () => {
	test('falls back to the default arrow button when none is supplied', async () => {
		const section: DiscreteLegendSection = {
			type: 'discrete',
			items: longItems(3),
			layout: { type: 'horizontal', maxRows: 1 }
		};
		const { container } = await render(DiscreteSectionWidthProbe, { section, width: 150 });

		await waitForRows(container);
		const nextBtn = container.querySelector('button[aria-label="Página siguiente de referencias"]');
		expect(nextBtn).toBeTruthy();
		expect(nextBtn?.textContent?.trim()).toBe('›');
	});
});
