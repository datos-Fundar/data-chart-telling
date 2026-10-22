import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import QuietProbe from './QuietProbe.svelte';

describe('PlotComposer - a plot with `legend: false`', () => {
	test('adds nothing to the composer legend', async () => {
		const { container } = render(QuietProbe);
		await expect
			.poll(() => container.querySelector('.dct-legend')?.textContent ?? '')
			.toContain('GDP');
		const text = container.querySelector('.dct-legend')!.textContent!;
		expect(text).toContain('Employment');
		expect(text).not.toContain('Hidden');
	});
});
