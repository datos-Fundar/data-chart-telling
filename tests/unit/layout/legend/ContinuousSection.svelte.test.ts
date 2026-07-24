import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import ContinuousSection from '$lib/layout/legend/ContinuousSection.svelte';
import type { ContinuousLegendSection } from '$lib/types/charts/legend';

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
		const el = container.querySelector(`circle[aria-label="${label}"]`);
		const raw = el?.getAttribute('aria-valuenow');
		if (raw == null) throw new Error(`${label} handle not yet rendered`);
		return Number(raw);
	});
}

describe('ContinuousSection – tracking the domain until the user actually drags', () => {
	test('with no interaction yet, lo/hi fully track a changing domain in both directions', async () => {
		const section: ContinuousLegendSection = {
			type: 'continuous',
			min: 10,
			max: 90,
			width: 200,
			interactive: true
		};
		const { container, rerender } = await render(ContinuousSection, { section });

		expect(await valueOf(container, 'Margen inferior')).toBe(10);
		expect(await valueOf(container, 'Margen superior')).toBe(90);

		// Domain narrows — untouched lo/hi must follow it inward, not stay put.
		await rerender({ section: { ...section, min: 30, max: 70 } });
		expect(await valueOf(container, 'Margen inferior')).toBe(30);
		expect(await valueOf(container, 'Margen superior')).toBe(70);

		// Domain then widens back out past the *original* bounds — untouched
		// lo/hi must follow it back out too, not stay clamped at 30/70. This is
		// the actual reported bug: a legend whose numbers no longer matched any
		// value in the data at all after the underlying domain changed once,
		// because a plain narrowing-only clamp never re-expands.
		await rerender({ section: { ...section, min: 1, max: 150 } });
		expect(await valueOf(container, 'Margen inferior')).toBe(1);
		expect(await valueOf(container, 'Margen superior')).toBe(150);
	});

	test('once the user drags, further domain changes clamp the selection instead of overriding it', async () => {
		const section: ContinuousLegendSection = {
			type: 'continuous',
			min: 0,
			max: 100,
			width: 200,
			interactive: true
		};
		const { container, rerender } = await render(ContinuousSection, { section });

		const lo = container.querySelector('circle[aria-label="Margen inferior"]')!;
		await dragBy(lo, 60); // lo ~30, an active selection now exists
		const loBefore = await valueOf(container, 'Margen inferior');
		expect(loBefore).toBeGreaterThan(0);

		// A domain change that easily fits the active selection must leave it
		// alone (not reset it back out to the new full range).
		await rerender({ section: { ...section, min: 0, max: 200 } });
		expect(await valueOf(container, 'Margen inferior')).toBe(loBefore);
		expect(await valueOf(container, 'Margen superior')).toBe(200);
	});
});

describe('ContinuousSection – re-clamping an active range when the domain shifts', () => {
	test('a dragged lo/hi that falls outside a later min/max is pulled back in, not reset', async () => {
		const section: ContinuousLegendSection = {
			type: 'continuous',
			min: 0,
			max: 100,
			width: 200,
			interactive: true
		};
		const { container, rerender } = await render(ContinuousSection, { section });

		const lo = await vi.waitFor(() => {
			const el = container.querySelector('circle[aria-label="Margen inferior"]');
			if (!el) throw new Error('lo handle not yet rendered');
			return el;
		});
		const hi = container.querySelector('circle[aria-label="Margen superior"]')!;

		await dragBy(lo, 80);
		await dragBy(hi, -80);

		const loBefore = await valueOf(container, 'Margen inferior');
		const hiBefore = await valueOf(container, 'Margen superior');
		expect(loBefore).toBeGreaterThan(0);
		expect(hiBefore).toBeLessThan(100);

		// Domain's min rises above the dragged lo, its max is untouched (still
		// above the dragged hi): lo should clamp up to meet the new min, hi
		// should be left exactly where the user put it.
		const risenMin = loBefore + 10;
		await rerender({ section: { ...section, min: risenMin } });
		expect(await valueOf(container, 'Margen inferior')).toBe(risenMin);
		expect(await valueOf(container, 'Margen superior')).toBe(hiBefore);

		// Domain's max now falls below the (still untouched) dragged hi: hi
		// should clamp down to meet it, lo (already inside the new bounds)
		// should be left alone.
		const fallenMax = hiBefore - 10;
		await rerender({ section: { ...section, min: risenMin, max: fallenMax } });
		expect(await valueOf(container, 'Margen superior')).toBe(fallenMax);
		expect(await valueOf(container, 'Margen inferior')).toBe(risenMin);
	});

	test('a domain that shifts entirely past the dragged range collapses to a valid (non-inverted) point instead of breaking', async () => {
		const section: ContinuousLegendSection = {
			type: 'continuous',
			min: 0,
			max: 100,
			width: 200,
			interactive: true
		};
		const { container, rerender } = await render(ContinuousSection, { section });

		const lo = container.querySelector('circle[aria-label="Margen inferior"]')!;
		const hi = container.querySelector('circle[aria-label="Margen superior"]')!;
		await dragBy(lo, 60); // lo ~30
		await dragBy(hi, -70); // hi ~65 (both now well inside [0, 100])

		const loBefore = await valueOf(container, 'Margen inferior');
		const hiBefore = await valueOf(container, 'Margen superior');
		expect(loBefore).toBeLessThan(hiBefore);

		// New domain sits entirely above both dragged values.
		await rerender({ section: { ...section, min: hiBefore + 20, max: hiBefore + 40 } });
		const loAfter = await valueOf(container, 'Margen inferior');
		const hiAfter = await valueOf(container, 'Margen superior');
		expect(loAfter).toBeLessThanOrEqual(hiAfter);
		expect(loAfter).toBeGreaterThanOrEqual(hiBefore + 20);
		expect(hiAfter).toBeLessThanOrEqual(hiBefore + 40);
	});
});
