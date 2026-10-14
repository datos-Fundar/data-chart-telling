import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import DisabledItemHarness from './_DisabledItemHarness.svelte';
import type { DiscreteLegendSection } from '$lib/types/layout/legend';

const section: DiscreteLegendSection = {
	type: 'discrete',
	items: [
		{ name: 'a', label: 'A', color: '#111827' },
		{ name: 'b', label: 'B', color: '#4f46e5' }
	]
};

const opacities = (container: Element) =>
	[...container.querySelectorAll<HTMLElement>('.dct-discrete__item')].map((el) => el.style.opacity);

describe('DiscreteSection - a series turned off from outside the legend', () => {
	test("stays listed, faint, when the plot omits it - whatever the section's own action", async () => {
		const { container } = await render(DisabledItemHarness, { section, action: { mode: 'omit' } });
		const [off, on] = opacities(container);
		expect(Number(off)).toBeGreaterThan(0);
		expect(Number(off)).toBeLessThan(1);
		expect(on).toBe('1');
	});

	test('a hidden series is only transparent in the plot - the legend dims it like a dim', async () => {
		const { container } = await render(DisabledItemHarness, { section, action: { mode: 'hide' } });
		const [off] = opacities(container);
		expect(Number(off)).toBeGreaterThan(0);
		expect(Number(off)).toBeLessThan(1);
	});

	test('dims in place when the action is a dim', async () => {
		const { container } = await render(DisabledItemHarness, { section, action: { mode: 'dim' } });
		const [off] = opacities(container);
		expect(Number(off)).toBeGreaterThan(0);
		expect(Number(off)).toBeLessThan(1);
	});
});
