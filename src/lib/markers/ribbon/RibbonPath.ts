/** One end of a ribbon, in pixels: where it sits along the flow, and the two edges of its band across it. */
export type RibbonEnd = { at: number; from: number; to: number };

/** The outline of a ribbon: a band that flows from one end to the other along a smooth curve. */
export class RibbonPath {
	/**
	 * The SVG path of a ribbon that flows along x, from `start` to `end`. Each edge is a cubic curve whose control
	 * points sit `curvature` of the way in from either end: `0.5` meets at the middle, `0` is a straight band.
	 */
	static horizontal(start: RibbonEnd, end: RibbonEnd, curvature = 0.5): string {
		const span = end.at - start.at;
		const c0 = start.at + span * curvature;
		const c1 = end.at - span * curvature;
		return (
			`M${start.at},${start.from}` +
			`C${c0},${start.from} ${c1},${end.from} ${end.at},${end.from}` +
			`L${end.at},${end.to}` +
			`C${c1},${end.to} ${c0},${start.to} ${start.at},${start.to}Z`
		);
	}
}
