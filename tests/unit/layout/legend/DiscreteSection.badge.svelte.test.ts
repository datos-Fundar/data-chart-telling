import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import DiscreteSectionWidthProbe from './DiscreteSectionWidthProbe.svelte';
import type { DiscreteLegendSection } from '$lib/types/layout/legend';

describe('DiscreteSection – interactive badge style', () => {
	test('is the default once interactive.enabled: true, filling the badge with the series color', async () => {
		const section: DiscreteLegendSection = {
			type: 'discrete',
			interactive: { enabled: true },
			items: [{ name: 'a', label: 'Serie A', color: '#111827' }]
		};
		const { container } = await render(DiscreteSectionWidthProbe, { section });

		const badge = container.querySelector('.dct-discrete__badge') as HTMLElement;
		expect(badge).toBeTruthy();
		expect(badge.style.background).toBe('rgb(17, 24, 39)');
		// Dark background → white auto-contrasted label/icon/eye color.
		expect(badge.style.color).toBe('rgb(255, 255, 255)');
		expect(container.querySelector('.dct-discrete__eye')).toBeTruthy();
		// The symbol icon is also shown inside the badge, colored like the
		// label rather than the series color — its shape fill is set directly
		// (not via the badge's `color` style), so it's asserted separately.
		const swatchShape = container.querySelector('.dct-discrete__swatch rect');
		expect(swatchShape).toBeTruthy();
		expect(swatchShape?.getAttribute('fill')).toBe('#ffffff');

		// Icon sits to the left of the label, eye to the right of it.
		const children = Array.from(badge.children);
		const indexOfClass = (cls: string): number =>
			children.findIndex((el) => el.classList.contains(cls));
		expect(indexOfClass('dct-discrete__swatch')).toBeLessThan(indexOfClass('dct-discrete__label'));
		expect(indexOfClass('dct-discrete__label')).toBeLessThan(indexOfClass('dct-discrete__eye'));
	});

	test('clicking swaps the eye for its crossed-out variant', async () => {
		const section: DiscreteLegendSection = {
			type: 'discrete',
			interactive: { enabled: true },
			items: [{ name: 'a', label: 'Serie A', color: '#4f46e5' }]
		};
		const { container } = await render(DiscreteSectionWidthProbe, { section });

		const item = container.querySelector('[role="button"]') as HTMLElement;
		expect(container.querySelector('.dct-discrete__eye line')).toBeFalsy();

		item.click();
		await vi.waitFor(() => {
			if (!container.querySelector('.dct-discrete__eye line')) throw new Error('not yet dimmed');
		});
		expect(item.getAttribute('aria-pressed')).toBe('true');

		item.click();
		await vi.waitFor(() => {
			if (container.querySelector('.dct-discrete__eye line')) throw new Error('not yet restored');
		});
		expect(item.getAttribute('aria-pressed')).toBe('false');
	});

	test('interactive.legendStyle: "basic" keeps the plain swatch + label, no badge chip', async () => {
		const section: DiscreteLegendSection = {
			type: 'discrete',
			interactive: { enabled: true, legendStyle: 'basic' },
			items: [{ name: 'a', label: 'Serie A', color: '#4f46e5' }]
		};
		const { container } = await render(DiscreteSectionWidthProbe, { section });

		expect(container.querySelector('.dct-discrete__badge')).toBeFalsy();
		expect(container.querySelector('.dct-discrete__swatch')).toBeTruthy();
	});

	test('interactive.disabledStyle overrides the dim opacity applied to a toggled-off item', async () => {
		const section: DiscreteLegendSection = {
			type: 'discrete',
			interactive: { enabled: true, disabledStyle: { opacity: 0.42 } },
			items: [{ name: 'a', label: 'Serie A', color: '#4f46e5' }]
		};
		const { container } = await render(DiscreteSectionWidthProbe, { section });

		const item = container.querySelector('[role="button"]') as HTMLElement;
		item.click();
		await vi.waitFor(() => {
			if (item.style.opacity !== '0.42') throw new Error('not yet dimmed');
		});
	});

	test('interactive.showIcon: false drops the symbol icon from the badge, keeping the label and eye', async () => {
		const section: DiscreteLegendSection = {
			type: 'discrete',
			interactive: { enabled: true, showIcon: false },
			items: [{ name: 'a', label: 'Serie A', color: '#4f46e5' }]
		};
		const { container } = await render(DiscreteSectionWidthProbe, { section });

		expect(container.querySelector('.dct-discrete__badge')).toBeTruthy();
		expect(container.querySelector('.dct-discrete__swatch')).toBeFalsy();
		expect(container.querySelector('.dct-discrete__eye')).toBeTruthy();
	});

	test('a non-interactive section never renders the badge style', async () => {
		const section: DiscreteLegendSection = {
			type: 'discrete',
			items: [{ name: 'a', label: 'Serie A', color: '#4f46e5' }]
		};
		const { container } = await render(DiscreteSectionWidthProbe, { section });

		expect(container.querySelector('.dct-discrete__badge')).toBeFalsy();
		expect(container.querySelector('.dct-discrete__swatch')).toBeTruthy();
	});
});
