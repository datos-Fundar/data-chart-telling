import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import PanelRunProbe from './PanelRunProbe.svelte';
import TimelineRunProbe from './TimelineRunProbe.svelte';
import { buildLineDefaults } from '$lib/plots/evolution/line/defaults';
import type { FacetConfig } from '$lib/types/layout/facet';
import {
	ALIGN_DELAY,
	BOX,
	CASES,
	FACETS,
	LineCore,
	SLOW_TEST,
	settled,
	type Row
} from './panelCases';

describe('Plot - one data run for every facet panel', () => {
	for (const c of CASES) {
		for (const [facetName, facet] of FACETS) {
			const panels = facet.by ? 3 : 9;
			test(
				`${c.name}, ${facetName}: draws what a run per facet draws`,
				async () => {
					let runs = 0;
					const once = await render(PanelRunProbe, {
						Core: c.Core,
						core: c.core,
						buildDefaults: c.buildDefaults,
						facet,
						once: true,
						onDataRun: () => runs++
					});
					const onceMarkup = await settled(once.container, panels);
					once.unmount();

					const perFacet = await render(PanelRunProbe, {
						Core: c.Core,
						core: c.core,
						buildDefaults: c.buildDefaults,
						facet,
						once: false
					});
					const perFacetMarkup = await settled(perFacet.container, panels);
					perFacet.unmount();

					expect(onceMarkup).toBe(perFacetMarkup);
					// Without a timeline, the run over every row is the only one.
					expect(runs).toBe(1);
				},
				SLOW_TEST
			);
		}
	}
});

describe('Plot - every facet panel is drawn once', () => {
	const [facetName, facet] = FACETS[0];
	for (const c of CASES) {
		test(
			`${c.name}, ${facetName}: no panel is redrawn from scratch`,
			async () => {
				const { container, unmount } = await render(PanelRunProbe, {
					Core: c.Core,
					core: c.core,
					buildDefaults: c.buildDefaults,
					facet,
					once: true
				});
				const drawn = new Set<Element>();
				const watch = () =>
					container.querySelectorAll('.dct-plot svg').forEach((svg) => drawn.add(svg));
				await vi.waitFor(watch);
				// Past the grid's alignment delay, when it pins the panels' margins.
				const until = performance.now() + ALIGN_DELAY + 600;
				while (performance.now() < until) {
					watch();
					await new Promise((r) => setTimeout(r, 20));
				}
				unmount();
				// A remount of a panel (its whole tree: svelteplot and every mark) would show a second svg.
				expect(drawn.size).toBe(3);
			},
			SLOW_TEST
		);
	}
});

describe('Plot - a series keeps its color in every facet panel', () => {
	/** Each line's stroke, per panel, in render order. */
	const strokes = (container: Element) =>
		[...container.querySelectorAll('.dct-plot svg')].map((svg) =>
			[...svg.querySelectorAll('g.lines path')].map((path) => (path as SVGElement).style.stroke)
		);

	test('a panel with only one series draws it in its own color, not the first one', async () => {
		const facet: FacetConfig<Row> = { rows: 'region', cols: 'sector' };
		const core = { ...BOX, x: 'year', y: 'value', color: 'sector' };
		const props = { Core: LineCore, core, buildDefaults: buildLineDefaults, facet };

		const once = await render(PanelRunProbe, { ...props, once: true });
		await settled(once.container, 6);
		const onceStrokes = strokes(once.container);
		once.unmount();
		const perFacet = await render(PanelRunProbe, { ...props, once: false });
		await settled(perFacet.container, 6);
		const perFacetStrokes = strokes(perFacet.container);
		perFacet.unmount();

		// Panels go row by row: North/Agriculture, North/Industry, South/Agriculture, ...
		const agro = onceStrokes[0][0];
		const industria = onceStrokes[1][0];
		expect(agro).not.toBe(industria);
		expect(onceStrokes.map((panel) => panel[0])).toEqual([
			agro,
			industria,
			agro,
			industria,
			agro,
			industria
		]);
		// A run per facet colors each panel's only series alike.
		expect(new Set(perFacetStrokes.map((panel) => panel[0])).size).toBe(1);
	});
});

describe('Plot - data runs with a timeline', () => {
	test('one run over every row for the frame, then one per step, not one per panel', async () => {
		let runs = 0;
		const onDataRun = () => runs++;
		const view = await render(TimelineRunProbe, { progress: 0, onDataRun });
		await settled(view.container, 3);
		expect(runs).toBe(2);
		await view.rerender({ progress: 1, onDataRun });
		await settled(view.container, 3);
		expect(runs).toBe(3);
		view.unmount();
	});
});

describe('Plot - data runs with a legend', () => {
	const legend = (mode: 'dim' | 'omit') => [
		{
			type: 'discrete',
			interactive: { enabled: true, disabled: { mode, style: { opacity: 0.1 } } },
			items: [
				{ name: 'Agriculture', symbol: 'line' },
				{ name: 'Industry', symbol: 'line' }
			]
		}
	];
	const linesPerPanel = (container: Element) =>
		[...container.querySelectorAll('.dct-plot svg')].map((svg) => [
			...svg.querySelectorAll<SVGPathElement>('g.lines path')
		]);
	const toggle = (container: Element, name: string) =>
		(
			[...container.querySelectorAll('[role="button"], button')].find((el) =>
				el.textContent?.includes(name)
			) as HTMLElement
		).click();

	async function renderWith(mode: 'dim' | 'omit', count: { runs: number }) {
		const view = await render(PanelRunProbe, {
			Core: LineCore,
			core: { ...BOX, x: 'year', y: 'value', color: 'sector' },
			buildDefaults: buildLineDefaults,
			facet: { by: 'region' },
			once: true,
			legend: legend(mode),
			onDataRun: () => count.runs++
		});
		await vi.waitFor(() => expect(linesPerPanel(view.container).flat().length).toBe(6));
		return view;
	}

	test('dimming a series runs no data phases again: every panel dims it', async () => {
		const count = { runs: 0 };
		const view = await renderWith('dim', count);
		expect(count.runs).toBe(1);
		toggle(view.container, 'Industry');
		await vi.waitFor(() => {
			for (const lines of linesPerPanel(view.container)) {
				expect(lines.map((p) => p.style.strokeOpacity)).toEqual(['1', '0.1']);
			}
		});
		expect(count.runs).toBe(1);
		view.unmount();
	});

	test('omitting a series runs the data phases once more, for every panel', async () => {
		const count = { runs: 0 };
		const view = await renderWith('omit', count);
		toggle(view.container, 'Industry');
		await vi.waitFor(() =>
			expect(linesPerPanel(view.container).map((l) => l.length)).toEqual([1, 1, 1])
		);
		expect(count.runs).toBe(2);
		view.unmount();
	});
});
