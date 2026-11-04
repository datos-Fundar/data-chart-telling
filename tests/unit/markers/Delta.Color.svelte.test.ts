import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { DeltaMarkerConfig } from '$lib/types/markers/axis/delta';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/axis/axisBasedMarkersConfig';
import { FEMALE_LIFE, MALE_LIFE } from '$datasets';

// A delta's dots take the color of the series their end measures, unless the delta's own stroke or dot
// says otherwise.

const SERIES = [
	{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE },
	{ name: 'male', x: 'year', y: 'value', data: MALE_LIFE }
];
const COLORS = { female: '#ff0000', male: '#0000ff' };
const RGB = {
	female: 'rgb(255, 0, 0)',
	male: 'rgb(0, 0, 255)',
	green: 'rgb(0, 255, 0)',
	custom: 'rgb(18, 52, 86)'
};

const delta = (extra: Partial<DeltaMarkerConfig> = {}): DeltaMarkerConfig => ({
	type: 'delta' as const,
	axis: 'x' as const,
	at: 2000,
	from: { type: 'series' as const, series: 'female' },
	to: { type: 'series' as const, series: 'male' },
	...extra
});

async function dotFills(marker: AxisBasedMarkersConfig) {
	const { container } = await render(LinePlot, {
		width: 600,
		height: 300,
		series: SERIES,
		scales: { color: { domain: ['female', 'male'], scheme: COLORS } },
		markers: [marker]
	});
	let fills: string[] = [];
	await vi.waitFor(() => {
		fills = [...container.querySelectorAll<SVGElement>('g.dot path')].map(
			(dot) => getComputedStyle(dot).fill
		);
		if (fills.length === 0) throw new Error('plot not yet rendered');
	});
	return fills;
}

describe('DeltaMarker - dot color', () => {
	test('each end takes the color of its series', async () => {
		const fills = await dotFills(delta());
		expect(fills).toContain(RGB.female);
		expect(fills).toContain(RGB.male);
	});

	test("the line's own stroke wins over the series", async () => {
		const fills = await dotFills(delta({ stroke: { stroke: '#00ff00' } }));
		expect(fills).toContain(RGB.green);
		expect(fills).not.toContain(RGB.female);
	});

	test("the delta's own dot wins over both", async () => {
		const fills = await dotFills(delta({ dot: { dotFill: '#123456' } }));
		expect(fills).toContain(RGB.custom);
		expect(fills).not.toContain(RGB.female);
	});
});
