import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import { NAPOLEONS_CITIES } from '$datasets';
import MinardPlot from '../../../../../stories/composition/plot/MinardPlot.svelte';

const settle = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const center = (el: Element) => {
	const box = el.getBoundingClientRect();
	return box.left + box.width / 2;
};

describe("Minard's figure", () => {
	test("each temperature reading sits under the map's place for it", async () => {
		const { container } = render(MinardPlot, {} as never);
		await vi.waitFor(() =>
			expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(2)
		);
		await settle(800);
		const [map, rain] = Array.from(container.querySelectorAll('svg')).filter(
			(svg) => svg.getBoundingClientRect().width > 300
		);
		// The first reading is Moscow's: the map's city of that name and the rain's first dot.
		const moscow = Array.from(map.querySelectorAll('g.dot path'))[
			NAPOLEONS_CITIES.findIndex((c) => c.city === 'Moscou')
		];
		const readings = Array.from(rain.querySelectorAll('g.dot path'));
		expect(readings.length).toBeGreaterThan(0);
		const first = readings[0];
		expect(Math.abs(center(first) - center(moscow))).toBeLessThan(4);
	});
});
