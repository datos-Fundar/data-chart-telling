// ── Weather stations, 2010-2025 ─────────────────────────────────────────────
// Open-Meteo historical weather (ERA5 reanalysis, CC BY 4.0): the mean
// temperature (°C) over 2010, 2015, 2020 and 2025 at South American capitals,
// with their longitude and latitude. The 2025 readings are `WEATHER_STATIONS`.

export type StationReading = {
	city: string;
	lon: number;
	lat: number;
	year: number;
	tempC: number;
};

const READING_YEARS = [2010, 2015, 2020, 2025];

/** Per station, one mean temperature for each of `READING_YEARS`. */
const STATION_TEMPERATURES = [
	{ city: 'Buenos Aires', lon: -58.4, lat: -34.6, tempC: [17.1, 17.8, 17.4, 18.4] },
	{ city: 'Santiago', lon: -70.6, lat: -33.4, tempC: [14.0, 15.2, 16.5, 16.3] },
	{ city: 'Brasília', lon: -47.9, lat: -15.8, tempC: [21.8, 22.3, 21.7, 22.3] },
	{ city: 'Montevideo', lon: -56.2, lat: -34.9, tempC: [16.9, 17.3, 17.1, 17.1] },
	{ city: 'Asunción', lon: -57.6, lat: -25.3, tempC: [22.0, 23.3, 23.8, 23.3] },
	{ city: 'La Paz', lon: -68.1, lat: -16.5, tempC: [8.7, 8.2, 9.5, 8.2] },
	{ city: 'Bogotá', lon: -74.1, lat: 4.7, tempC: [14.3, 14.7, 13.3, 13.8] },
	{ city: 'Lima', lon: -77, lat: -12, tempC: [19.1, 20.3, 19.8, 20.5] }
];

export const WEATHER_STATIONS_OVER_TIME: StationReading[] = STATION_TEMPERATURES.flatMap(
	({ city, lon, lat, tempC }) =>
		READING_YEARS.map((year, index) => ({ city, lon, lat, year, tempC: tempC[index] }))
);
