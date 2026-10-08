import {
  geoAlbersUsa,
  geoAlbers,
  geoAzimuthalEqualArea,
  geoAzimuthalEquidistant,
  geoConicConformal,
  geoConicEqualArea,
  geoConicEquidistant,
  geoEqualEarth,
  geoEquirectangular,
  geoGnomonic,
  geoMercator,
  geoOrthographic,
  geoStereographic,
  geoTransverseMercator,
  type GeoProjection,
} from 'd3-geo';
import type { GeoInsetProjectionConfig, GeoInsetProjectionName } from '$lib/types/markers/geo';

const NAMED_PROJECTIONS: Record<GeoInsetProjectionName, () => GeoProjection> = {
  'albers-usa': geoAlbersUsa,
  albers: geoAlbers,
  'azimuthal-equal-area': geoAzimuthalEqualArea,
  'azimuthal-equidistant': geoAzimuthalEquidistant,
  'conic-conformal': geoConicConformal,
  'conic-equal-area': geoConicEqualArea,
  'conic-equidistant': geoConicEquidistant,
  'equal-earth': geoEqualEarth,
  equirectangular: geoEquirectangular,
  gnomonic: geoGnomonic,
  mercator: geoMercator,
  orthographic: geoOrthographic,
  stereographic: geoStereographic,
  'transverse-mercator': geoTransverseMercator,
};

/**
 * Builds a fresh, configured (but not yet fit) d3-geo projection instance
 * for an `inset` marker - the caller still needs to `.fitExtent()` it to
 * whatever the inset ends up showing.
 */
export function buildInsetProjection(config: GeoInsetProjectionConfig = 'mercator'): GeoProjection {
  const isConfigObject = typeof config === 'object' && config !== null;
  const name: GeoInsetProjectionName = (isConfigObject ? config.type : config) ?? 'mercator';
  const projection = NAMED_PROJECTIONS[name]();
  if (isConfigObject) {
    if (config.rotate) projection.rotate(config.rotate);
    if (config.center) projection.center(config.center);
    if (config.parallels && 'parallels' in projection) {
      (projection as GeoProjection & { parallels(p: [number, number]): void }).parallels(config.parallels);
    }
    if (typeof config.clip === 'number') projection.clipAngle(config.clip);
  }
  return projection;
}
