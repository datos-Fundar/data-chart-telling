import type { LegendSection } from '$lib/types/layout/legend';
import {
	NAPOLEONS_ARMY,
	NAPOLEONS_TEMPERATURES,
	type NapoleonsArmyRow,
	type NapoleonsTemperature
} from '$datasets';

/** The march as the timeline's clock: Minard's chart has none, so a row's `step` is its position in the data. */
export type MinardStep = NapoleonsArmyRow & { step: number };

export const MINARD_STEPS: MinardStep[] = NAPOLEONS_ARMY.map((row, step) => ({ ...row, step }));

/** Every step, for a timeline that scrubs the march. */
export const MINARD_STEP_VALUES: number[] = MINARD_STEPS.map((row) => row.step);

const lons = NAPOLEONS_ARMY.map((row) => row.lon);
const lats = NAPOLEONS_ARMY.map((row) => row.lat);

/** The march's longitudes, west to east. */
export const MINARD_LON_EXTENT: [number, number] = [Math.min(...lons), Math.max(...lons)];

// The map's frame is the march's bounding box, not the rows the timeline shows,
// so it stays put while scrubbing.
const DOMAIN: GeoJSON.Polygon = {
	type: 'Polygon',
	coordinates: [
		[
			[MINARD_LON_EXTENT[0], Math.max(...lats)],
			[MINARD_LON_EXTENT[0], Math.min(...lats)],
			[MINARD_LON_EXTENT[1], Math.min(...lats)],
			[MINARD_LON_EXTENT[1], Math.max(...lats)],
			[MINARD_LON_EXTENT[0], Math.max(...lats)]
		].reverse()
	]
};

/** The map's projection, fitted to the march. */
export const MINARD_PROJECTION = { type: 'conic-equal-area', inset: 20, domain: DOMAIN } as const;

/** A temperature reading on the retreat, with where on the march it was taken and the step the army got there. */
export type MinardTemperature = NapoleonsTemperature & { lat: number; step: number };

/**
 * The retreat as a path of `[lon, lat, step]` points, west-bound: division 1's
 * retreat to where it joins the others, then the joined army's to the end.
 */
const RETREAT: [number, number, number][] = MINARD_STEPS.filter(
	(row) => row.direction === 'R' && (row.division === 1 || (row.division === 2 && row.step >= 37))
).map((row) => [row.lon, row.lat, row.step]);

/** Where the retreat is at a longitude: its latitude, and the step the army reaches it. */
function retreatAt(lon: number): { lat: number; step: number } {
	for (let index = 1; index < RETREAT.length; index++) {
		const [fromLon, fromLat, fromStep] = RETREAT[index - 1];
		const [toLon, toLat, toStep] = RETREAT[index];
		if (lon <= fromLon && lon >= toLon && fromLon !== toLon) {
			const t = (fromLon - lon) / (fromLon - toLon);
			return {
				lat: fromLat + (toLat - fromLat) * t,
				step: Math.ceil(fromStep + (toStep - fromStep) * t)
			};
		}
	}
	const [, lastLat, lastStep] = RETREAT[lon > RETREAT[0][0] ? 0 : RETREAT.length - 1];
	return { lat: lastLat, step: lastStep };
}

/** Each temperature reading placed on the retreat. */
export const MINARD_TEMPERATURES: MinardTemperature[] = NAPOLEONS_TEMPERATURES.map((reading) => ({
	...reading,
	...retreatAt(reading.lon)
}));

/** What the map's two trails mean. */
export const MINARD_LEGEND: LegendSection[] = [
	{
		type: 'discrete',
		title: 'Direction',
		items: [
			{ name: 'Advance to Moscow', symbol: 'line', color: 'currentColor' },
			{ name: 'Retreat', symbol: 'line', color: '#b91c1c' }
		]
	}
];
