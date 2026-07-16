import { geoAzimuthalEquidistant } from 'd3-geo';
import type { GeoCustomProjection, GeoCustomProjectionFactory } from '$lib/types/plots/geo/scales';
import { pointsToFitFeature } from './fit';

// Representative extremity points — not real border geometry (which stays
// out of `src/lib`, see stories/plots/geo/data.ts), just enough for
// `fitSize` to frame Argentina's full territorial claim sensibly. These are
// plain real-world coordinates, not derived from any particular dataset, so
// they work the same way regardless of which Argentina GeoJSON actually
// gets drawn through this projection.

const MAINLAND_POINTS: [number, number][] = [
  [-65.3, -21.8], // La Quiaca (north)
  [-68.3, -54.8], // Ushuaia / Tierra del Fuego (south)
  [-53.7, -25.6], // Puerto Iguazú (east)
  [-73.4, -50.3], // Los Glaciares, Santa Cruz (west)
  [-71.8, -41.1], // Bariloche (west, mid-latitude bulge)
];

const ANTARCTIC_POINTS: [number, number][] = [
  [-61.2, -51.0], // Malvinas (north tip)
  [-57.8, -52.3], // Malvinas (east tip)
  [-38.0, -53.9], // Georgias del Sur
  [-26.5, -59.5], // Sandwich del Sur
  [-74, -60], // Antarctic sector, western meridian (60°S treaty boundary)
  [-25, -60], // Antarctic sector, eastern meridian (60°S treaty boundary)
  [-49.5, -89.9], // South Pole, on the sector's central meridian
];

/**
 * Argentina's territory in one unbroken frame: the mainland and the
 * Antarctic/South Atlantic sector both visible, related to each other at
 * true scale (azimuthal-equidistant, rotated so the split falls to the
 * sides rather than through the middle of either half).
 */
export const argentinaBicontinental: GeoCustomProjectionFactory = ({ width, height }): GeoCustomProjection => {
  const projection = geoAzimuthalEquidistant().rotate([60, 70]);
  projection.fitSize([width, height], pointsToFitFeature([...MAINLAND_POINTS, ...ANTARCTIC_POINTS]));
  return projection;
};
