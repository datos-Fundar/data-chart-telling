import { describe, test, expect } from 'vitest';
import { Box } from '$lib/layout/margins/Box';

const TEXT_SIDES = { start: 'after', middle: 'middle', end: 'before' } as const;
const TEXT_ANCHORS = { after: 'start', middle: 'middle', before: 'end' } as const;
const LINE_SIDES = { top: 'after', middle: 'middle', bottom: 'before' } as const;
const LINE_ANCHORS = { after: 'top', middle: 'middle', before: 'bottom' } as const;

/** A label's `Box.flipNear`, read back as text anchors - the way `TextMarker` reads it. */
function resolveEdgeAwareAnchor(args: {
	px: number;
	py: number;
	width: number;
	height: number;
	textAnchor: keyof typeof TEXT_SIDES;
	lineAnchor: keyof typeof LINE_SIDES;
	gapX: number;
	gapY: number;
	extent: { width: number; height: number };
}) {
	const flip = Box.size(args.extent.width, args.extent.height).flipNear(
		{ x: args.px, y: args.py },
		{ x: TEXT_SIDES[args.textAnchor], y: LINE_SIDES[args.lineAnchor] },
		Box.size(args.width, args.height),
		{ x: args.gapX, y: args.gapY }
	);
	return {
		textAnchor: TEXT_ANCHORS[flip.anchor.x],
		lineAnchor: LINE_ANCHORS[flip.anchor.y],
		dx: flip.dx,
		dy: flip.dy
	};
}

const BOX = { width: 400, height: 300 };

describe('Box.flipNear (edge-aware labels)', () => {
	test('a point well inside the box keeps the preferred anchor and gap', () => {
		const placement = resolveEdgeAwareAnchor({
			px: 200,
			py: 150,
			...BOX,
			textAnchor: 'start',
			lineAnchor: 'middle',
			gapX: 8,
			gapY: 0,
			extent: { width: 30, height: 12 }
		});
		expect(placement).toEqual({ textAnchor: 'start', lineAnchor: 'middle', dx: 8, dy: 0 });
	});

	test('a "start"-anchored label near the right edge flips to "end"', () => {
		const placement = resolveEdgeAwareAnchor({
			px: 390,
			py: 150,
			...BOX,
			textAnchor: 'start',
			lineAnchor: 'middle',
			gapX: 8,
			gapY: 0,
			extent: { width: 30, height: 12 }
		});
		expect(placement.textAnchor).toBe('end');
		expect(placement.dx).toBe(-8);
	});

	test('an "end"-anchored label near the left edge flips to "start"', () => {
		const placement = resolveEdgeAwareAnchor({
			px: 10,
			py: 150,
			...BOX,
			textAnchor: 'end',
			lineAnchor: 'middle',
			gapX: 8,
			gapY: 0,
			extent: { width: 30, height: 12 }
		});
		expect(placement.textAnchor).toBe('start');
		expect(placement.dx).toBe(8);
	});

	test('a "top"-anchored label near the bottom edge flips to "bottom"', () => {
		const placement = resolveEdgeAwareAnchor({
			px: 200,
			py: 295,
			...BOX,
			textAnchor: 'middle',
			lineAnchor: 'top',
			gapX: 0,
			gapY: 6,
			extent: { width: 30, height: 12 }
		});
		expect(placement.lineAnchor).toBe('bottom');
		expect(placement.dy).toBe(-6);
	});

	test('a "bottom"-anchored label near the top edge flips to "top"', () => {
		const placement = resolveEdgeAwareAnchor({
			px: 200,
			py: 5,
			...BOX,
			textAnchor: 'middle',
			lineAnchor: 'bottom',
			gapX: 0,
			gapY: 6,
			extent: { width: 30, height: 12 }
		});
		expect(placement.lineAnchor).toBe('top');
		expect(placement.dy).toBe(6);
	});

	test('a "middle"-anchored label near the right edge nudges inward instead of flipping', () => {
		const placement = resolveEdgeAwareAnchor({
			px: 395,
			py: 150,
			...BOX,
			textAnchor: 'middle',
			lineAnchor: 'middle',
			gapX: 8,
			gapY: 0,
			extent: { width: 30, height: 12 }
		});
		expect(placement.textAnchor).toBe('middle');
		expect(placement.dx).toBeLessThan(0);
		// The nudge should be exactly enough to bring the right half-extent to the box edge.
		expect(395 + placement.dx + 15).toBeCloseTo(400);
	});

	test('a "middle"-anchored label near the left edge nudges inward instead of flipping', () => {
		const placement = resolveEdgeAwareAnchor({
			px: 5,
			py: 150,
			...BOX,
			textAnchor: 'middle',
			lineAnchor: 'middle',
			gapX: 8,
			gapY: 0,
			extent: { width: 30, height: 12 }
		});
		expect(placement.dx).toBeGreaterThan(0);
		expect(5 + placement.dx - 15).toBeCloseTo(0);
	});
});
