let measureCtx: CanvasRenderingContext2D | null | undefined;

function getMeasureContext(): CanvasRenderingContext2D | null {
	if (measureCtx !== undefined) return measureCtx;
	measureCtx = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');
	return measureCtx;
}

/** Pixel width of `text` set in `font` (a canvas font shorthand, e.g. `"14px sans-serif"`). 0 during SSR. */
export function measureTextWidth(text: string, font: string): number {
	const ctx = getMeasureContext();
	if (!ctx) return 0;
	ctx.font = font;
	return ctx.measureText(text).width;
}

/** Widest of `labels` set in `font`. 0 for an empty list. */
export function measureMaxLabelWidth(labels: string[], font: string): number {
	return labels.reduce((max, label) => Math.max(max, measureTextWidth(label, font)), 0);
}
