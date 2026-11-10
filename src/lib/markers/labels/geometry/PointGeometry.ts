import { BoxGeometry } from '$lib/markers/labels/geometry/BoxGeometry';
import type { BoxShape, BoxedMarker } from '$lib/types/markers/labels/box';
import type { PointGeometryOf, PointShape } from '$lib/types/markers/labels/point';

/** The point each row of a marker is labelled at, as its kind's {@link PointShape} tells it. */
export class PointGeometry {
	static of(
		shape: PointShape,
		marker: BoxedMarker,
		plot: { box?: BoxShape; isHorizontal?: boolean } = {}
	): PointGeometryOf | undefined {
		if (shape === 'box') {
			const geometry = plot.box && BoxGeometry.of(plot.box, marker, plot);
			return geometry && { x: geometry.x, y: geometry.y, size: geometry.size };
		}
		const y = shape === 'top' ? (marker.y2 ?? marker.y) : marker.y;
		return marker.x === undefined || y === undefined ? undefined : { x: marker.x, y };
	}
}
