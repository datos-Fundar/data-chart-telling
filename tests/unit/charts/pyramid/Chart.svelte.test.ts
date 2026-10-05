import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import PyramidChart from '$lib/charts/pyramid/Chart.svelte';

// ── Fixtures ──────────────────────────────────────────────────────────────────

type Row = { age: string; pct: number; sex: 'Female' | 'Male' };

const DATA: Row[] = [
	{ age: '0-4', pct: 4, sex: 'Female' },
	{ age: '5-9', pct: 4.5, sex: 'Female' },
	{ age: '10-14', pct: 5, sex: 'Female' },
	{ age: '0-4', pct: 4.2, sex: 'Male' },
	{ age: '5-9', pct: 4.6, sex: 'Male' },
	{ age: '10-14', pct: 4.9, sex: 'Male' }
];

// y = category (age bands, visual Y axis), x = magnitude (visual X axis), color = grouping (sex).
const BASE_PROPS = {
	width: 600,
	height: 420,
	data: DATA,
	y: 'age' as keyof Row,
	x: 'pct' as keyof Row,
	color: 'sex' as keyof Row
} as const;

// Waits until at least one <svg> is present in the container.
async function waitForSvg(container: Element): Promise<SVGElement> {
	let svg: SVGElement | null = null;
	await vi.waitFor(
		() => {
			svg = container.querySelector('svg');
			if (!svg) throw new Error('SVG not yet rendered');
		},
		{ timeout: 3000, interval: 50 }
	);
	return svg!;
}

function barRects(svg: SVGElement): SVGRectElement[] {
	const all = svg.querySelectorAll('g:not(.axis-x):not(.axis-y) rect');
	// Skip the plot's clip-path rect, which is a `<clipPath>` child, not a bar.
	return Array.from(all)
		.filter((r) => !r.closest('clipPath'))
		.slice(1) as SVGRectElement[];
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PyramidChart', () => {
	test('renders an SVG from flat rows grouped by sex', async () => {
		const { container } = await render(PyramidChart, BASE_PROPS);
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('renders one bar per row', async () => {
		const { container } = await render(PyramidChart, BASE_PROPS);
		const svg = await waitForSvg(container);
		expect(barRects(svg).length).toBe(DATA.length);
	});

	test('does not crash with an empty dataset', async () => {
		const { container } = await render(PyramidChart, {
			...BASE_PROPS,
			data: [] as Row[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('renders the title when provided', async () => {
		const { container } = await render(PyramidChart, {
			...BASE_PROPS,
			title: 'Pirámide poblacional'
		});
		await waitForSvg(container);
		expect(container.textContent).toContain('Pirámide poblacional');
	});
});
