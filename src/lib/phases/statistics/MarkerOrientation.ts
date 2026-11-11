import { MarkerKinds } from '$lib/markers/MarkerKinds';
import { PlotAxes } from '$lib/phases/data/PlotAxes';

type Marker = { type: string; isHorizontal?: boolean; data?: unknown[] } & Record<string, unknown>;
type AxisScales = { x?: { type?: string }; y?: { type?: string } };

/** Which way an oriented marker runs when its plot has no position channels to say it. */
export class MarkerOrientation {
	/** `marker` with `isHorizontal` taken from its own channels, unless it sets one or can't tell. */
	static orient<T extends { type: string }>(marker: T, rows: unknown[], scales?: AxisScales): T {
		const own = marker as T & Marker;
		if (own.isHorizontal !== undefined || !MarkerKinds.of(own.type)?.oriented) return marker;
		const isHorizontal = MarkerOrientation.of(own, rows, scales);
		return isHorizontal === undefined ? marker : { ...own, isHorizontal };
	}

	/**
	 * A band (`x1`/`x2` or `y1`/`y2`) runs across its own axis; two channels run as a plot's
	 * would; a single channel is the measured value.
	 */
	static of(marker: Marker, rows: unknown[], scales?: AxisScales): boolean | undefined {
		const set = (...keys: string[]) => keys.some((key) => marker[key] !== undefined);
		const [xBand, yBand] = [set('x1', 'x2'), set('y1', 'y2')];
		if (xBand !== yBand) return xBand;
		const [x, y] = [set('x'), set('y')];
		if (x && y) {
			const data = marker.data ?? rows;
			return PlotAxes.build({ series: [{ x: marker.x, y: marker.y, data }], scales }).isHorizontal;
		}
		return x !== y ? x : undefined;
	}
}
