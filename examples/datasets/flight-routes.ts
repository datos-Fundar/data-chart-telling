// ── Long-haul flight routes ─────────────────────────────────────────────────
// OpenFlights route database (Open Database License): a few of its nonstop
// routes of more than 10,000 km, two out of Buenos Aires, two out of Santiago
// and three from Tokyo to Europe. The snapshot dates from 2014, so it is a
// picture of those years' routes, not of today's.

export type FlightRoute = {
	route: string;
	fromLon: number;
	fromLat: number;
	toLon: number;
	toLat: number;
};

export const FLIGHT_ROUTES: FlightRoute[] = [
	{ route: 'Buenos Aires - Madrid', fromLon: -58.54, fromLat: -34.82, toLon: -3.56, toLat: 40.47 },
	{
		route: 'Buenos Aires - Frankfurt',
		fromLon: -58.54,
		fromLat: -34.82,
		toLon: 8.57,
		toLat: 50.03
	},
	{ route: 'Santiago - Sydney', fromLon: -70.79, fromLat: -33.39, toLon: 151.18, toLat: -33.95 },
	{ route: 'Santiago - Paris', fromLon: -70.79, fromLat: -33.39, toLon: 2.55, toLat: 49.01 },
	{ route: 'Tokyo - London', fromLon: 139.78, fromLat: 35.55, toLon: -0.46, toLat: 51.47 },
	{ route: 'Tokyo - Paris', fromLon: 139.78, fromLat: 35.55, toLon: 2.55, toLat: 49.01 },
	{ route: 'Tokyo - Frankfurt', fromLon: 140.39, fromLat: 35.76, toLon: 8.57, toLat: 50.03 }
];
