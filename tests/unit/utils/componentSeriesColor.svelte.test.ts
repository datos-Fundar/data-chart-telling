import { describe, test, expect } from 'vitest';
import PeakMarker from '$lib/markers/PeakMarker.svelte';
import { withComponentSeriesColor } from '$lib/utils/componentSeriesColor';

describe('withComponentSeriesColor', () => {
	test('a PeakMarker takes its series color in its dot and text props', () => {
		const marker = { type: 'component', component: PeakMarker, props: { mode: 'max' } };
		const out = withComponentSeriesColor(marker, '#f97316') as unknown as {
			props: { mode: string; dot: { dotFill: string; dotStroke: string }; text: { fill: string } };
		};
		expect(out.props.mode).toBe('max');
		expect(out.props.dot.dotFill).toBe('#f97316');
		expect(out.props.dot.dotStroke).toBe('#f97316');
		expect(out.props.text.fill).toBe('#f97316');
	});

	test('an explicit color in the props wins over the series color', () => {
		const marker = {
			type: 'component',
			component: PeakMarker,
			props: { dot: { dotFill: '#000' } }
		};
		const out = withComponentSeriesColor(marker, '#f97316') as unknown as {
			props: { dot: { dotFill: string; dotStroke: string } };
		};
		expect(out.props.dot.dotFill).toBe('#000');
		expect(out.props.dot.dotStroke).toBe('#f97316');
	});

	test('a component without a color mapping is returned unchanged', () => {
		const marker = { type: 'component', component: () => null, props: {} };
		expect(withComponentSeriesColor(marker, '#f97316')).toBe(marker);
	});
});
