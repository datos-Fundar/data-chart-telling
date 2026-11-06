import { render } from 'vitest-browser-svelte';
import { describe, test, expect, afterEach } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import { resetConfiguration, setConfiguration } from '$lib/configuration/config.svelte';
import { waitForSvg } from '../plots/_helpers/svg';

const BARS = { width: 300, height: 200, data: [{ c: 'A', v: 1 }], x: 'c', y: 'v' };

/** A plot drawn inside a wrapping element with `vars` set on it. */
async function drawIn(vars: Record<string, string>) {
	const host = document.createElement('div');
	for (const [name, value] of Object.entries(vars)) host.style.setProperty(name, value);
	document.body.appendChild(host);
	const { container } = await render(BarPlot, { target: host, props: BARS } as never);
	await waitForSvg(container);
	return host.querySelector<HTMLElement>('.dct-plot')!;
}

describe('the configuration as CSS variables', () => {
	afterEach(() => resetConfiguration());

	test('the axis color is the configuration`s', async () => {
		setConfiguration({ axis: { color: '#0f766e' } });
		const plot = await drawIn({});
		await expect.poll(() => getComputedStyle(plot).color).toBe('rgb(15, 118, 110)');
	});

	test('a wrapping element`s own variable wins over the configuration', async () => {
		setConfiguration({ axis: { color: '#0f766e' } });
		const plot = await drawIn({ '--dct-axis-color': 'rgb(255, 0, 0)' });
		await expect.poll(() => getComputedStyle(plot).color).toBe('rgb(255, 0, 0)');
		const tick = plot.querySelector<SVGTextElement>('svg text')!;
		expect(getComputedStyle(tick).fill).toBe('rgb(255, 0, 0)');
	});
});
