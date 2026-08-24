import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import {
	FEMALE_LIFE_EXPECTANCY,
	MALE_LIFE_EXPECTANCY
} from '../../../../../stories/plots/line/data';
import { waitForSvg, countTextLabels } from '../../_helpers/svg';

const FEMALE = {
	name: 'female',
	x: 'year' as const,
	y: 'value' as const,
	data: FEMALE_LIFE_EXPECTANCY
};
const MALE = { name: 'male', x: 'year' as const, y: 'value' as const, data: MALE_LIFE_EXPECTANCY };

describe('LinePlot – styles.values', () => {
	test('no value label by default', async () => {
		const { container } = await render(LinePlot, { width: 400, height: 300, series: [FEMALE] });
		const svg = await waitForSvg(container);
		expect(countTextLabels(svg)).toBe(0);
	});

	test('values.show renders one label per series, at its last point', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			styles: { values: { show: true } } satisfies AxisBasedStylesConfig,
			margins: { right: 80 }
		});
		const svg = await waitForSvg(container);
		expect(countTextLabels(svg)).toBe(1);
		const last = FEMALE_LIFE_EXPECTANCY[FEMALE_LIFE_EXPECTANCY.length - 1];
		expect(svg.querySelector('g.text text')?.textContent).toBe(`female - ${last.value}`);
	});

	test('a custom format callback overrides the default label text', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			styles: {
				values: { show: true, format: (v, name) => `${name} → ${v.toFixed(1)} yr` }
			} satisfies AxisBasedStylesConfig,
			margins: { right: 120 }
		});
		const svg = await waitForSvg(container);
		const last = FEMALE_LIFE_EXPECTANCY[FEMALE_LIFE_EXPECTANCY.length - 1];
		expect(svg.querySelector('g.text text')?.textContent).toBe(
			`female → ${last.value.toFixed(1)} yr`
		);
	});

	test('measuring label overflow into the margin never triggers a runaway effect loop', async () => {
		// Regression test: end-point labels overflowing the plot's top margin
		// (the default `anchor: 'start'` overlaps content above the last data
		// point) used to grow that margin via `createLabelMarginTracker`, which
		// fed straight back into svelteplot's `<Plot margin>` as a live
		// post-mount prop change — sending its own auto-margin sizing into a
		// permanent one-pixel oscillation that kept re-triggering the overflow
		// watcher forever, tripping Svelte's `effect_update_depth_exceeded`
		// guard (see `BasePlotLayout`'s `marginRemountKey` doc comment for the
		// actual fix). Only reproduced with an *explicit* margin already set on
		// another side (here `right`) alongside the auto-grown one; a bare
		// `values.show` alone didn't trigger it.
		const errors: unknown[][] = [];
		const spy = vi.spyOn(console, 'error').mockImplementation((...args) => {
			errors.push(args);
		});
		try {
			await render(LinePlot, {
				width: 400,
				height: 300,
				series: [FEMALE],
				styles: { values: { show: true } } satisfies AxisBasedStylesConfig,
				margins: { right: 80 }
			});
			// The loop (when present) fires across several animation frames, not
			// within the same microtask — give it room to show up.
			await new Promise((r) => setTimeout(r, 500));
		} finally {
			spy.mockRestore();
		}
		const messages = errors.map((args) => args.map(String).join(' ')).join('\n');
		expect(messages).not.toMatch(/effect_update_depth_exceeded/);
	});

	test('no series with any data point never triggers a runaway margin-growth loop', async () => {
		// Regression test: when every series is currently empty (e.g. a
		// timeline scrubbed before any series' earliest data point), `lastPoints`
		// is `[]` and the value-labels `<g>` renders with nothing in it.
		// `getBBox()` on that empty group reports `(0,0,0,0)` — the SVG origin,
		// not "no content" — which `watchLabelOverflow` used to read as the
		// group overflowing the plot's top/left margins by exactly those
		// margins' own current size. Growing the margin to "fix" that only
		// shifted the content box outward, so the next, still-empty measurement
		// reported the same shape of overflow again — an unbounded loop, never
		// an `effect_update_depth_exceeded` throw (each growth is a fresh
		// `marginRemountKey` render, not a same-tick effect cycle) but visible as
		// the plot's scales never settling.
		const errors: unknown[][] = [];
		const spy = vi.spyOn(console, 'error').mockImplementation((...args) => {
			errors.push(args);
		});
		let container!: Element;
		try {
			({ container } = await render(LinePlot, {
				width: 400,
				height: 300,
				series: [{ name: 'female', x: 'year', y: 'value', data: [] }],
				// `frame: true` gives a `rect.frame` drawn exactly at the resolved
				// content box, the same way `LinePlot.Styles.Frame` tests read
				// resolved margins elsewhere — a runaway loop keeps shrinking that
				// rect (margins growing) on every remount instead of settling.
				styles: { frame: true, values: { show: true } } satisfies AxisBasedStylesConfig
			}));
		} finally {
			spy.mockRestore();
		}
		const messages = errors.map((args) => args.map(String).join(' ')).join('\n');
		expect(messages).not.toMatch(/effect_update_depth_exceeded/);
		const svg = await waitForSvg(container);
		expect(countTextLabels(svg)).toBe(0);

		// Re-queries `container` (not a cached `svg`/`rect` reference) on every
		// call: a margin-growth loop remounts the whole `<svg>` via
		// `BasePlotLayout`'s `{#key marginRemountKey}`, so a reference captured
		// once would go stale and silently stop reflecting later remounts.
		const frameWidth = () => Number(container.querySelector('rect.frame')?.getAttribute('width'));
		const readings: number[] = [];
		for (let i = 0; i < 5; i++) {
			await new Promise((r) => setTimeout(r, 150));
			readings.push(frameWidth());
		}
		// A stable render settles quickly and stays put; a runaway loop keeps
		// shrinking the content box (growing margins) reading after reading.
		expect(readings[readings.length - 1]).toBe(readings[readings.length - 2]);
		expect(new Set(readings).size).toBeLessThanOrEqual(2);
	});

	test('two series get two independent end-point labels', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE, MALE],
			styles: {
				values: { show: true, format: (v, name) => `${name} (${v})` }
			} satisfies AxisBasedStylesConfig,
			margins: { right: 80 }
		});
		const svg = await waitForSvg(container);
		const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
		const lastFemale = FEMALE_LIFE_EXPECTANCY[FEMALE_LIFE_EXPECTANCY.length - 1].value;
		const lastMale = MALE_LIFE_EXPECTANCY[MALE_LIFE_EXPECTANCY.length - 1].value;
		expect(labels).toEqual(
			expect.arrayContaining([`female (${lastFemale})`, `male (${lastMale})`])
		);
	});
});
