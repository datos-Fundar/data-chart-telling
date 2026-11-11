import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import ContinuousSection from '$lib/layout/legend/ContinuousSection.svelte';
import ExternalSyncHarness from './_ExternalSyncHarness.svelte';
import type { ContinuousLegendSection } from '$lib/types/layout/legend';
import type { LegendState } from '$lib/layout/legend/LegendState.svelte';

async function dragBy(el: Element, dx: number): Promise<void> {
	const rect = el.getBoundingClientRect();
	const startX = rect.x + rect.width / 2;
	const startY = rect.y + rect.height / 2;
	const init = { bubbles: true, cancelable: true, pointerId: 1, clientY: startY };
	const sleep = () => new Promise((r) => setTimeout(r, 10));
	el.dispatchEvent(new PointerEvent('pointerdown', { ...init, clientX: startX }));
	await sleep();
	const steps = 5;
	for (let i = 1; i <= steps; i++) {
		el.dispatchEvent(
			new PointerEvent('pointermove', { ...init, clientX: startX + (dx * i) / steps })
		);
		await sleep();
	}
	el.dispatchEvent(new PointerEvent('pointerup', { ...init, clientX: startX + dx }));
	await sleep();
}

function valueOf(container: Element, label: string): Promise<number> {
	return vi.waitFor(() => {
		const el = container.querySelector(`rect[aria-label="${label}"]`);
		const raw = el?.getAttribute('aria-valuenow');
		if (raw == null) throw new Error(`${label} handle not yet rendered`);
		return Number(raw);
	});
}

describe('ContinuousSection - tracking the domain until the user actually drags', () => {
	test('with no interaction yet, lo/hi fully track a changing domain in both directions', async () => {
		const section: ContinuousLegendSection = {
			type: 'continuous',
			min: 10,
			max: 90,
			width: 200,
			interactive: { enabled: true }
		};
		const { container, rerender } = await render(ContinuousSection, { section });

		expect(await valueOf(container, 'Lower bound')).toBe(10);
		expect(await valueOf(container, 'Upper bound')).toBe(90);

		// Domain narrows - untouched lo/hi must follow it inward, not stay put.
		await rerender({ section: { ...section, min: 30, max: 70 } });
		expect(await valueOf(container, 'Lower bound')).toBe(30);
		expect(await valueOf(container, 'Upper bound')).toBe(70);

		// Domain then widens back out past the *original* bounds - untouched
		// lo/hi must follow it back out too, not stay clamped at 30/70. This is
		// the actual reported bug: a legend whose numbers no longer matched any
		// value in the data at all after the underlying domain changed once,
		// because a plain narrowing-only clamp never re-expands.
		await rerender({ section: { ...section, min: 1, max: 150 } });
		expect(await valueOf(container, 'Lower bound')).toBe(1);
		expect(await valueOf(container, 'Upper bound')).toBe(150);
	});

	test('once the user drags, further domain changes clamp the selection instead of overriding it', async () => {
		const section: ContinuousLegendSection = {
			type: 'continuous',
			min: 0,
			max: 100,
			width: 200,
			interactive: { enabled: true }
		};
		const { container, rerender } = await render(ContinuousSection, { section });

		const lo = container.querySelector('rect[aria-label="Lower bound"]')!;
		await dragBy(lo, 60); // lo ~30, an active selection now exists
		const loBefore = await valueOf(container, 'Lower bound');
		expect(loBefore).toBeGreaterThan(0);

		// A domain change that easily fits the active selection must leave it
		// alone (not reset it back out to the new full range).
		await rerender({ section: { ...section, min: 0, max: 200 } });
		expect(await valueOf(container, 'Lower bound')).toBe(loBefore);
		expect(await valueOf(container, 'Upper bound')).toBe(200);
	});
});

describe('ContinuousSection - re-clamping an active range when the domain shifts', () => {
	test('a dragged lo/hi that falls outside a later min/max is pulled back in, not reset', async () => {
		const section: ContinuousLegendSection = {
			type: 'continuous',
			min: 0,
			max: 100,
			width: 200,
			interactive: { enabled: true }
		};
		const { container, rerender } = await render(ContinuousSection, { section });

		const lo = await vi.waitFor(() => {
			const el = container.querySelector('rect[aria-label="Lower bound"]');
			if (!el) throw new Error('lo handle not yet rendered');
			return el;
		});
		const hi = container.querySelector('rect[aria-label="Upper bound"]')!;

		await dragBy(lo, 80);
		await dragBy(hi, -80);

		const loBefore = await valueOf(container, 'Lower bound');
		const hiBefore = await valueOf(container, 'Upper bound');
		expect(loBefore).toBeGreaterThan(0);
		expect(hiBefore).toBeLessThan(100);

		// Domain's min rises above the dragged lo, its max is untouched (still
		// above the dragged hi): lo should clamp up to meet the new min, hi
		// should be left exactly where the user put it.
		const risenMin = loBefore + 10;
		await rerender({ section: { ...section, min: risenMin } });
		expect(await valueOf(container, 'Lower bound')).toBe(risenMin);
		expect(await valueOf(container, 'Upper bound')).toBe(hiBefore);

		// Domain's max now falls below the (still untouched) dragged hi: hi
		// should clamp down to meet it, lo (already inside the new bounds)
		// should be left alone.
		const fallenMax = hiBefore - 10;
		await rerender({ section: { ...section, min: risenMin, max: fallenMax } });
		expect(await valueOf(container, 'Upper bound')).toBe(fallenMax);
		expect(await valueOf(container, 'Lower bound')).toBe(risenMin);
	});

	test('a domain that shifts entirely past the dragged range collapses to a valid (non-inverted) point instead of breaking', async () => {
		const section: ContinuousLegendSection = {
			type: 'continuous',
			min: 0,
			max: 100,
			width: 200,
			interactive: { enabled: true }
		};
		const { container, rerender } = await render(ContinuousSection, { section });

		const lo = container.querySelector('rect[aria-label="Lower bound"]')!;
		const hi = container.querySelector('rect[aria-label="Upper bound"]')!;
		await dragBy(lo, 60); // lo ~30
		await dragBy(hi, -70); // hi ~65 (both now well inside [0, 100])

		const loBefore = await valueOf(container, 'Lower bound');
		const hiBefore = await valueOf(container, 'Upper bound');
		expect(loBefore).toBeLessThan(hiBefore);

		// New domain sits entirely above both dragged values.
		await rerender({ section: { ...section, min: hiBefore + 20, max: hiBefore + 40 } });
		const loAfter = await valueOf(container, 'Lower bound');
		const hiAfter = await valueOf(container, 'Upper bound');
		expect(loAfter).toBeLessThanOrEqual(hiAfter);
		expect(loAfter).toBeGreaterThanOrEqual(hiBefore + 20);
		expect(hiAfter).toBeLessThanOrEqual(hiBefore + 40);
	});
});

describe('ContinuousSection - syncing with an externally-set range', () => {
	test('setting interaction.range from outside moves the handles to match, and clearing it resets them', async () => {
		const section: ContinuousLegendSection = {
			type: 'continuous',
			min: 0,
			max: 100,
			width: 200,
			interactive: { enabled: true, mode: 'rescale' }
		};
		let interaction: LegendState | undefined;
		const { container } = await render(ExternalSyncHarness, {
			section,
			onReady: (store) => {
				interaction = store;
			}
		});
		if (!interaction) throw new Error('interaction store not provided');

		expect(await valueOf(container, 'Lower bound')).toBe(0);
		expect(await valueOf(container, 'Upper bound')).toBe(100);

		// A click on some *other* legend (e.g. a facet-level mini legend)
		// narrows the shared range directly, without ever touching this
		// section's own drag handles. The sync effect only flushes on a later
		// tick, so poll (like `valueOf` already does for "not yet rendered")
		// instead of asserting immediately.
		interaction.range = { min: 20, max: 60, mode: 'rescale', disabledStyle: {} };
		await vi.waitFor(async () => {
			expect(await valueOf(container, 'Lower bound')).toBe(20);
			expect(await valueOf(container, 'Upper bound')).toBe(60);
		});

		// Clearing it externally (full range again) resets the handles back
		// out to the section's own min/max, exactly like a manual reset would.
		interaction.range = null;
		await vi.waitFor(async () => {
			expect(await valueOf(container, 'Lower bound')).toBe(0);
			expect(await valueOf(container, 'Upper bound')).toBe(100);
		});
	});
});

describe('ContinuousSection - the numbers at its edges', () => {
	const section: ContinuousLegendSection = { type: 'continuous', min: 140, max: 1_397_715_000 };

	test('read by the configured locale and compact display, like the axes', async () => {
		const { setConfiguration, resetConfiguration } =
			await import('$lib/configuration/config.svelte');
		try {
			setConfiguration({ axis: { locale: 'en-US', compactDisplay: 'short' } });
			const en = render(ContinuousSection, { section });
			await expect.element(en.getByText('1.4B')).toBeInTheDocument();
			en.unmount();
			setConfiguration({ axis: { locale: 'es-AR', compactDisplay: 'long' } });
			const es = render(ContinuousSection, { section });
			await expect.element(es.getByText(/mil millones/)).toBeInTheDocument();
		} finally {
			resetConfiguration();
		}
	});
});

describe('ContinuousSection - labels that would touch', () => {
	const labels = (container: Element, selector: string) =>
		[...container.querySelectorAll(selector)].map((el) => ({
			text: el.textContent?.trim(),
			visible: getComputedStyle(el).visibility !== 'hidden'
		}));

	test('a tick label too close to an edge label gives way to it, and the ticks that clear them stay', async () => {
		const section: ContinuousLegendSection = {
			type: 'continuous',
			min: 25,
			max: 73,
			width: 170,
			ticks: [30, 40, 50, 60, 70]
		};
		const { container } = await render(ContinuousSection, { section });

		await vi.waitFor(() => {
			const ticks = labels(container, '.dct-continuous__tick');
			expect(ticks.find((t) => t.text === '30')?.visible).toBe(false);
			expect(ticks.find((t) => t.text === '70')?.visible).toBe(false);
			expect(ticks.find((t) => t.text === '50')?.visible).toBe(true);
		});
		// The edges are always written, and a hidden tick leaves no mark below the bar.
		expect(labels(container, '.dct-continuous__edge').every((e) => e.visible)).toBe(true);
		expect(container.querySelectorAll('.dct-continuous__tick-mark').length).toBeLessThan(5);
	});

	test('ticks that touch each other keep the lower one; a wide enough bar keeps them all', async () => {
		const crowded: ContinuousLegendSection = {
			type: 'continuous',
			min: 0,
			max: 100,
			width: 120,
			ticks: [40, 45, 50, 55, 60]
		};
		const { container, rerender } = await render(ContinuousSection, { section: crowded });
		await vi.waitFor(() => {
			const ticks = labels(container, '.dct-continuous__tick');
			expect(ticks.find((t) => t.text === '40')?.visible).toBe(true);
			expect(ticks.find((t) => t.text === '45')?.visible).toBe(false);
		});

		await rerender({ section: { ...crowded, width: 600 } });
		await vi.waitFor(() => {
			expect(labels(container, '.dct-continuous__tick').every((t) => t.visible)).toBe(true);
		});
	});

	test('ticks that are far enough apart are all written', async () => {
		const section: ContinuousLegendSection = {
			type: 'continuous',
			min: 0,
			max: 100,
			width: 200,
			ticks: [25, 50, 75]
		};
		const { container } = await render(ContinuousSection, { section });
		await vi.waitFor(() => {
			expect(labels(container, '.dct-continuous__tick').every((t) => t.visible)).toBe(true);
		});
	});

	test('when the handle labels meet, the one on the domain end hides and the moving one stays horizontal until they part', async () => {
		const section: ContinuousLegendSection = {
			type: 'continuous',
			min: 0,
			max: 100,
			width: 200,
			interactive: { enabled: true }
		};
		const { container } = await render(ContinuousSection, { section });
		const handles = () => ({
			lo: container.querySelector('.dct-continuous__tick--handle-lo')!,
			hi: container.querySelector('.dct-continuous__tick--handle-hi')!
		});
		const visible = (el: Element) => getComputedStyle(el).visibility !== 'hidden';

		const lo = await vi.waitFor(() => {
			const el = container.querySelector('rect[aria-label="Lower bound"]');
			if (!el) throw new Error('lo handle not yet rendered');
			return el;
		});

		// Drag the lower handle almost onto the upper one, which rests on the domain's end.
		await dragBy(lo, 190);
		await vi.waitFor(() => {
			expect(visible(handles().hi)).toBe(false);
			expect(visible(handles().lo)).toBe(true);
			expect(getComputedStyle(handles().lo).transform).not.toContain('matrix(0');
		});
		// The label that stays writes both values, and stays inside the legend's width.
		expect(handles().lo.textContent).toMatch(/^\s*\d+ – 100\s*$/);
		const legend = container.querySelector('.dct-continuous__labels')!.getBoundingClientRect();
		const label = handles().lo.getBoundingClientRect();
		expect(label.left).toBeGreaterThanOrEqual(legend.left - 0.5);
		expect(label.right).toBeLessThanOrEqual(legend.right + 0.5);

		// Pull it back: the upper label comes back.
		await dragBy(container.querySelector('rect[aria-label="Lower bound"]')!, -150);
		await vi.waitFor(() => {
			expect(visible(handles().hi)).toBe(true);
			expect(visible(handles().lo)).toBe(true);
		});
		expect(handles().lo.textContent).not.toContain('–');
	});

	test('the merged label of a moving upper handle grows inward and stays inside the legend', async () => {
		const section: ContinuousLegendSection = {
			type: 'continuous',
			min: 0,
			max: 100,
			width: 200,
			interactive: { enabled: true }
		};
		const { container } = await render(ContinuousSection, { section });
		const hi = await vi.waitFor(() => {
			const el = container.querySelector('rect[aria-label="Upper bound"]');
			if (!el) throw new Error('hi handle not yet rendered');
			return el;
		});
		await dragBy(hi, -195);
		const label = await vi.waitFor(() => {
			const el = container.querySelector('.dct-continuous__tick--handle-hi')!;
			if (!el.textContent?.includes('–')) throw new Error('labels not merged yet');
			return el;
		});
		const legend = container.querySelector('.dct-continuous__labels')!.getBoundingClientRect();
		expect(label.getBoundingClientRect().left).toBeGreaterThanOrEqual(legend.left - 0.5);
		expect(label.getBoundingClientRect().right).toBeLessThanOrEqual(legend.right + 0.5);
	});
});

describe('ContinuousSection - a range set through setRange', () => {
	test('moves the handles like a drag, with the mode of the section, and null resets them', async () => {
		const section: ContinuousLegendSection = {
			type: 'continuous',
			min: 0,
			max: 100,
			width: 200,
			interactive: { enabled: true, mode: 'rescale' }
		};
		let interaction: LegendState | undefined;
		const { container } = await render(ExternalSyncHarness, {
			section,
			onReady: (store) => {
				interaction = store;
			}
		});
		if (!interaction) throw new Error('interaction store not provided');
		await valueOf(container, 'Lower bound');

		interaction.setRange([20, 60]);
		await vi.waitFor(async () => {
			expect(await valueOf(container, 'Lower bound')).toBe(20);
			expect(await valueOf(container, 'Upper bound')).toBe(60);
		});
		// The section's own mode, learnt from it, not the default `filter`.
		expect(interaction.range?.mode).toBe('rescale');

		interaction.setRange(null);
		await vi.waitFor(async () => {
			expect(await valueOf(container, 'Lower bound')).toBe(0);
			expect(await valueOf(container, 'Upper bound')).toBe(100);
		});
	});
});
