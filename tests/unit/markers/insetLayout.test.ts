import { describe, test, expect } from 'vitest';
import { parseInsetLocation, insetBox } from '$lib/markers/inset/insetLayout';

describe('parseInsetLocation', () => {
	test('side-anchor and anchor-side orders parse to the same position', () => {
		expect(parseInsetLocation('bottom-right')).toEqual({ h: 'right', v: 'bottom' });
		expect(parseInsetLocation('right-bottom')).toEqual({ h: 'right', v: 'bottom' });
	});

	test('a side paired with "middle" centers the other axis', () => {
		expect(parseInsetLocation('right-middle')).toEqual({ h: 'right', v: 'middle' });
		expect(parseInsetLocation('middle-right')).toEqual({ h: 'right', v: 'middle' });
		expect(parseInsetLocation('top-middle')).toEqual({ h: 'middle', v: 'top' });
		expect(parseInsetLocation('middle-top')).toEqual({ h: 'middle', v: 'top' });
	});

	test('"middle-middle" centers both axes', () => {
		expect(parseInsetLocation('middle-middle')).toEqual({ h: 'middle', v: 'middle' });
	});

	test('covers every corner', () => {
		expect(parseInsetLocation('top-left')).toEqual({ h: 'left', v: 'top' });
		expect(parseInsetLocation('left-top')).toEqual({ h: 'left', v: 'top' });
		expect(parseInsetLocation('top-right')).toEqual({ h: 'right', v: 'top' });
		expect(parseInsetLocation('bottom-left')).toEqual({ h: 'left', v: 'bottom' });
	});
});

describe('insetBox', () => {
	const frameWidth = 1000;
	const frameHeight = 500;

	test('bottom-right sits margin pixels from the bottom and right edges', () => {
		const box = insetBox('bottom-right', 0.2, 0.3, 10, frameWidth, frameHeight);
		expect(box.width).toBe(200);
		expect(box.height).toBe(150);
		expect(box.left).toBe(frameWidth - 10 - 200);
		expect(box.top).toBe(frameHeight - 10 - 150);
	});

	test('top-left sits margin pixels from the top and left edges', () => {
		const box = insetBox('top-left', 0.2, 0.3, 10, frameWidth, frameHeight);
		expect(box.left).toBe(10);
		expect(box.top).toBe(10);
	});

	test('right-middle is flush with the right edge and vertically centered', () => {
		const box = insetBox('right-middle', 0.2, 0.3, 10, frameWidth, frameHeight);
		expect(box.left).toBe(frameWidth - 10 - box.width);
		expect(box.top).toBe((frameHeight - box.height) / 2);
	});

	test('middle-middle is centered on both axes, ignoring margin', () => {
		const box = insetBox('middle-middle', 0.2, 0.3, 10, frameWidth, frameHeight);
		expect(box.left).toBe((frameWidth - box.width) / 2);
		expect(box.top).toBe((frameHeight - box.height) / 2);
	});

	test('equivalent location strings produce the same box', () => {
		const a = insetBox('bottom-right', 0.25, 0.2, 8, frameWidth, frameHeight);
		const b = insetBox('right-bottom', 0.25, 0.2, 8, frameWidth, frameHeight);
		expect(a).toEqual(b);
	});
});
