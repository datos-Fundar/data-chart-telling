import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { FEMALE_LIFE } from '$datasets';
import { waitForSvg } from '../../_helpers/svg';

const FEMALE = { name: 'female', x: 'year' as const, y: 'value' as const, data: FEMALE_LIFE };

describe('LinePlot - styles.values.format', () => {
	test('gets the number writer of the values display fields', async () => {
		const last = FEMALE_LIFE[FEMALE_LIFE.length - 1].value;
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			styles: {
				values: {
					show: true,
					decimals: 2,
					suffix: ' años',
					format: (value: number, number: (value: number) => string) =>
						value === last ? `~${number(value)}` : ''
				}
			}
		});
		const svg = await waitForSvg(container);
		const expected = `~${last.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} años`;
		expect(svg.textContent).toContain(expected);
	});
});
