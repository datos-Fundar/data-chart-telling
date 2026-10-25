// ── Prevailing wind at Argentine cities, 2025 ────────────────────────
// Open-Meteo historical weather (ERA5 reanalysis, CC BY 4.0): over 2025, the
// mean of each day's strongest 10 m wind (`magnitude`, in km/h) and the
// direction that wind blows toward (`direction`, in degrees clockwise from
// north), as the speed-weighted average of the daily dominant directions.

export type WindVector = {
	city: string;
	lon: number;
	lat: number;
	magnitude: number;
	direction: number;
};

export const WIND_VECTORS: WindVector[] = [
	{ city: 'Buenos Aires', lon: -58.4, lat: -34.6, magnitude: 16.2, direction: 257 },
	{ city: 'Córdoba', lon: -64.2, lat: -31.4, magnitude: 15.1, direction: 245 },
	{ city: 'Rosario', lon: -60.7, lat: -32.9, magnitude: 15.3, direction: 279 },
	{ city: 'Mendoza', lon: -68.8, lat: -32.9, magnitude: 14.1, direction: 9 },
	{ city: 'Tucumán', lon: -65.2, lat: -26.8, magnitude: 11.7, direction: 48 },
	{ city: 'Salta', lon: -65.4, lat: -24.8, magnitude: 11.5, direction: 219 },
	{ city: 'Resistencia', lon: -59.0, lat: -27.5, magnitude: 14.6, direction: 281 },
	{ city: 'Posadas', lon: -55.9, lat: -27.4, magnitude: 15.9, direction: 275 },
	{ city: 'Neuquén', lon: -68.1, lat: -38.9, magnitude: 20.7, direction: 64 },
	{ city: 'Mar del Plata', lon: -57.6, lat: -38.0, magnitude: 22.3, direction: 143 },
	{ city: 'Santa Rosa', lon: -64.3, lat: -36.6, magnitude: 19.4, direction: 214 },
	{ city: 'Comodoro Rivadavia', lon: -67.5, lat: -45.9, magnitude: 29.8, direction: 102 },
	{ city: 'Río Gallegos', lon: -69.2, lat: -51.6, magnitude: 32.6, direction: 97 },
	{ city: 'Ushuaia', lon: -68.3, lat: -54.8, magnitude: 19.2, direction: 127 }
];
