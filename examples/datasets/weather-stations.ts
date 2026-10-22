// ── Weather stations, 2025 ──────────────────────────────────────────────────
// Open-Meteo historical weather (ERA5 reanalysis, CC BY 4.0): the mean
// temperature (°C) over 2025 at South American capitals, with their longitude
// and latitude.

export type WeatherStation = {
	city: string;
	lon: number;
	lat: number;
	tempC: number;
};

export const WEATHER_STATIONS: WeatherStation[] = [
	{ city: 'Buenos Aires', lon: -58.4, lat: -34.6, tempC: 18.4 },
	{ city: 'Santiago', lon: -70.6, lat: -33.4, tempC: 16.3 },
	{ city: 'Brasília', lon: -47.9, lat: -15.8, tempC: 22.3 },
	{ city: 'Montevideo', lon: -56.2, lat: -34.9, tempC: 17.1 },
	{ city: 'Asunción', lon: -57.6, lat: -25.3, tempC: 23.3 },
	{ city: 'La Paz', lon: -68.1, lat: -16.5, tempC: 8.2 },
	{ city: 'Bogotá', lon: -74.1, lat: 4.7, tempC: 13.8 },
	{ city: 'Lima', lon: -77, lat: -12, tempC: 20.5 }
];
