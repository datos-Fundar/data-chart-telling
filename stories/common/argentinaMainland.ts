import type { ArgentinaProvinceProps } from '$datasets/argentina-provinces';

const TIERRA_DEL_FUEGO = 'Tierra del Fuego, Antártida e Islas del Atlántico Sur';

/** `excludeParts` for a Mercator map of Argentina: drops the Antarctic sector of Tierra del Fuego, which Mercator cannot draw. */
export const isAntarcticPart = (part: { centroid: [number, number] }, feature: { __id: string }) =>
	feature.__id === TIERRA_DEL_FUEGO && (part.centroid[1] < -60 || part.centroid[0] > -50);

/** `featureId` for the provinces, so `excludeParts` can tell them apart. */
export const provinceName = (feature: { properties?: unknown }) =>
	(feature.properties as ArgentinaProvinceProps).nombre;
