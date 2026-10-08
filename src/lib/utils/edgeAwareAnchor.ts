export type HorizontalAnchor = 'start' | 'middle' | 'end';
export type VerticalAnchor = 'top' | 'middle' | 'bottom';

export type AnchorPlacement = {
	textAnchor: HorizontalAnchor;
	lineAnchor: VerticalAnchor;
	dx: number;
	dy: number;
};

/**
 * Flips (or nudges) a label's anchor/offset when its default placement
 * would push it past a pixel box - e.g. the plot's own inner content box.
 * `extent` should be measured off-DOM (see `measureTextWidth`) rather than
 * via `getBBox()` on the rendered label - feeding a `getBBox()` reading back
 * into anything reactive to the plot's own layout (like svelteplot's shared
 * margin-auto-sizing context) risks a feedback loop between this
 * component's own effect and svelteplot's.
 */
export function resolveEdgeAwareAnchor(args: {
	/** Pixel position of the anchored point. */
	px: number;
	py: number;
	/** Size of the box the label must stay within - typically the plot's own inner content box. */
	width: number;
	height: number;
	textAnchor: HorizontalAnchor;
	lineAnchor: VerticalAnchor;
	/** Desired distance from the point, in pixels - sign is resolved from the (possibly flipped) anchor. */
	gapX: number;
	gapY: number;
	extent: { width: number; height: number };
}): AnchorPlacement {
	const { px, py, width, height, gapX, gapY, extent } = args;
	let { textAnchor, lineAnchor } = args;
	let dx: number;
	let dy: number;

	if (textAnchor === 'start') {
		dx = gapX;
		if (px + dx + extent.width > width) {
			textAnchor = 'end';
			dx = -gapX;
		}
	} else if (textAnchor === 'end') {
		dx = -gapX;
		if (px + dx - extent.width < 0) {
			textAnchor = 'start';
			dx = gapX;
		}
	} else {
		const half = extent.width / 2;
		dx = 0;
		if (px - half < 0) dx = half - px;
		else if (px + half > width) dx = width - (px + half);
	}

	if (lineAnchor === 'top') {
		dy = gapY;
		if (py + dy + extent.height > height) {
			lineAnchor = 'bottom';
			dy = -gapY;
		}
	} else if (lineAnchor === 'bottom') {
		dy = -gapY;
		if (py + dy - extent.height < 0) {
			lineAnchor = 'top';
			dy = gapY;
		}
	} else {
		const half = extent.height / 2;
		dy = 0;
		if (py - half < 0) dy = half - py;
		else if (py + half > height) dy = height - (py + half);
	}

	return { textAnchor, lineAnchor, dx, dy };
}
