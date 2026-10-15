import { render } from 'vitest-browser-svelte';
import { describe, test, expect, afterEach } from 'vitest';
import Timeline from '$lib/layout/timeline/Timeline.svelte';
import { resetConfiguration, setConfiguration } from '$lib/configuration/config.svelte';

afterEach(resetConfiguration);

describe('Timeline (rule)', () => {
	const props = { currentValue: 2020, values: [2018, 2019, 2020, 2021], width: 60, height: 300 };

	test("the current step is in the configuration's `activeColor`, with no figure around it", async () => {
		setConfiguration({ timeline: { activeColor: '#e6580d' } });
		const { container } = render(Timeline, { ...props, orientation: 'vertical' });
		const current = [...container.querySelectorAll('text')].find((t) => t.textContent === '2020')!;
		await expect.poll(() => current.style.fill).toBe('rgb(230, 88, 13)');
		setConfiguration({ timeline: { activeColor: '#0f766e' } });
		await expect.poll(() => current.style.fill).toBe('rgb(15, 118, 110)');
	});

	test("reads its sizes and opacities from the configuration's `timeline.rule`", async () => {
		setConfiguration({
			timeline: { rule: { fontSize: 9, activeFontSize: 30, labelOpacity: 0.8, axisWidth: 4 } }
		});
		const { container } = render(Timeline, { ...props, orientation: 'vertical' });
		await expect.poll(() => container.querySelectorAll('text').length).toBeGreaterThan(0);
		const texts = [...container.querySelectorAll('text')];
		expect(texts.find((t) => t.textContent === '2020')!.style.fontSize).toBe('30px');
		expect(texts.find((t) => t.textContent === '2019')!.style.fontSize).toBe('9px');
		expect(container.querySelector('line')!.style.strokeWidth).toBe('4px');
	});
});

describe('Timeline (rule) font', () => {
	test("is the configuration's, even with no figure around it", async () => {
		setConfiguration({ font: 'Georgia, serif' });
		const { container } = render(Timeline, {
			currentValue: 2020,
			values: [2018, 2020],
			orientation: 'vertical',
			width: 60,
			height: 300
		});
		await expect.poll(() => container.querySelectorAll('text').length).toBeGreaterThan(0);
		expect(getComputedStyle(container.querySelector('text')!).fontFamily).toContain('Georgia');
	});
});
