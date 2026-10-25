type LonLat = [number, number];

/** Operations on GeoJSON geometries: their centroids, bounds, disjoint parts and great-circle arcs. */
export class GeoGeometry {
	/** Bounding-box center of a geometry's coordinates: a cheap point for a label, not an area centroid. */
	static centroid(geometry: GeoJSON.Geometry): LonLat {
		const coords = GeoGeometry.#coordinates(geometry);
		if (coords.length === 0) return [0, 0];
		const [minLon, minLat, maxLon, maxLat] = GeoGeometry.#extent(coords);
		return [(minLon + maxLon) / 2, (minLat + maxLat) / 2];
	}

	/** `[minLon, minLat, maxLon, maxLat]` of a geometry, or `null` when it has no coordinates. */
	static lonLatBounds(geometry: GeoJSON.Geometry): [number, number, number, number] | null {
		const coords = GeoGeometry.#coordinates(geometry);
		return coords.length === 0 ? null : GeoGeometry.#extent(coords);
	}

	/** A multi-part geometry as its disjoint parts, one `Polygon` or `LineString` each; any other geometry as itself. */
	static parts(geometry: GeoJSON.Geometry): GeoJSON.Geometry[] {
		switch (geometry.type) {
			case 'MultiPolygon':
				return geometry.coordinates.map((polygon) => ({ type: 'Polygon', coordinates: polygon }));
			case 'MultiLineString':
				return geometry.coordinates.map((line) => ({ type: 'LineString', coordinates: line }));
			case 'GeometryCollection':
				return geometry.geometries.flatMap((part) => GeoGeometry.parts(part));
			default:
				return [geometry];
		}
	}

	/** One centroid per disjoint part, so a feature whose parts lie far apart matches a hover over any of them. */
	static partCentroids(geometry: GeoJSON.Geometry): LonLat[] {
		return GeoGeometry.parts(geometry).map((part) => GeoGeometry.centroid(part));
	}

	/** The geometry without the parts `keep` rejects, or `null` when none stays. The same geometry when all do. */
	static filterParts(
		geometry: GeoJSON.Geometry,
		keep: (part: { centroid: LonLat; geometry: GeoJSON.Geometry }) => boolean
	): GeoJSON.Geometry | null {
		const parts = GeoGeometry.parts(geometry);
		const kept = parts.filter((part) =>
			keep({ centroid: GeoGeometry.centroid(part), geometry: part })
		);
		if (kept.length === parts.length) return geometry;
		if (kept.length === 0) return null;
		if (parts.length === 1) return kept[0];
		switch (geometry.type) {
			case 'MultiPolygon':
				return {
					type: 'MultiPolygon',
					coordinates: kept.map((part) => (part as GeoJSON.Polygon).coordinates)
				};
			case 'MultiLineString':
				return {
					type: 'MultiLineString',
					coordinates: kept.map((part) => (part as GeoJSON.LineString).coordinates)
				};
			case 'GeometryCollection':
				return { type: 'GeometryCollection', geometries: kept };
			default:
				return geometry;
		}
	}

	/** The path between two points that changes longitude and latitude at a steady rate, the short way around: it keeps near its parallels where a great circle bends toward a pole. */
	static parallelPath(from: LonLat, to: LonLat, steps = 64): LonLat[] {
		const shift = ((((to[0] - from[0] + 180) % 360) + 360) % 360) - 180;
		return Array.from({ length: steps + 1 }, (_, index) => {
			const fraction = index / steps;
			const lon = ((((from[0] + shift * fraction + 180) % 360) + 360) % 360) - 180;
			return [lon, from[1] + (to[1] - from[1]) * fraction];
		});
	}

	/**
	 * The great-circle arc between two points, as `steps + 1` points. Drawn
	 * through `Geo` because svelteplot's `Link` cannot read `x1`/`y1`/`x2`/`y2`
	 * under a projection (0.14.2).
	 */
	static greatCircle(from: LonLat, to: LonLat, steps = 64): LonLat[] {
		const [lambda1, phi1] = [GeoGeometry.#radians(from[0]), GeoGeometry.#radians(from[1])];
		const [lambda2, phi2] = [GeoGeometry.#radians(to[0]), GeoGeometry.#radians(to[1])];
		const distance =
			2 *
			Math.asin(
				Math.sqrt(
					Math.sin((phi2 - phi1) / 2) ** 2 +
						Math.cos(phi1) * Math.cos(phi2) * Math.sin((lambda2 - lambda1) / 2) ** 2
				)
			);
		if (!Number.isFinite(distance) || distance === 0) return [from, to];

		return Array.from({ length: steps + 1 }, (_, index) => {
			const fraction = index / steps;
			const a = Math.sin((1 - fraction) * distance) / Math.sin(distance);
			const b = Math.sin(fraction * distance) / Math.sin(distance);
			const x = a * Math.cos(phi1) * Math.cos(lambda1) + b * Math.cos(phi2) * Math.cos(lambda2);
			const y = a * Math.cos(phi1) * Math.sin(lambda1) + b * Math.cos(phi2) * Math.sin(lambda2);
			const z = a * Math.sin(phi1) + b * Math.sin(phi2);
			return [
				GeoGeometry.#degrees(Math.atan2(y, x)),
				GeoGeometry.#degrees(Math.atan2(z, Math.sqrt(x * x + y * y)))
			];
		});
	}

	static #radians(degrees: number): number {
		return (degrees * Math.PI) / 180;
	}

	static #degrees(radians: number): number {
		return (radians * 180) / Math.PI;
	}

	static #extent(coords: LonLat[]): [number, number, number, number] {
		let [minLon, minLat, maxLon, maxLat] = [Infinity, Infinity, -Infinity, -Infinity];
		for (const [lon, lat] of coords) {
			if (lon < minLon) minLon = lon;
			if (lon > maxLon) maxLon = lon;
			if (lat < minLat) minLat = lat;
			if (lat > maxLat) maxLat = lat;
		}
		return [minLon, minLat, maxLon, maxLat];
	}

	static #coordinates(geometry: GeoJSON.Geometry, out: LonLat[] = []): LonLat[] {
		switch (geometry.type) {
			case 'Point':
				out.push(geometry.coordinates as LonLat);
				break;
			case 'MultiPoint':
			case 'LineString':
				out.push(...(geometry.coordinates as LonLat[]));
				break;
			case 'MultiLineString':
			case 'Polygon':
				for (const line of geometry.coordinates as LonLat[][]) out.push(...line);
				break;
			case 'MultiPolygon':
				for (const polygon of geometry.coordinates as LonLat[][][]) {
					for (const ring of polygon) out.push(...ring);
				}
				break;
			case 'GeometryCollection':
				for (const part of geometry.geometries) GeoGeometry.#coordinates(part, out);
				break;
		}
		return out;
	}
}
