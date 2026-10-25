// ── Stock prices, August 2026 ───────────────────────────────────────────────
// Yahoo Finance: the daily open, high, low and close prices of Alphabet
// (GOOGL) and Amazon (AMZN) over the 21 trading days of August 2026.

export type StockDay = { date: Date; open: number; high: number; low: number; close: number };

type RawDay = Omit<StockDay, 'date'> & { date: string };

/** The `YYYY-MM-DD` days as local midnights, which a time axis puts on the day itself. */
function toDays(days: RawDay[]): StockDay[] {
	return days.map((day) => {
		const [year, month, date] = day.date.split('-').map(Number);
		return { ...day, date: new Date(year, month - 1, date) };
	});
}

export const GOOGL_AUGUST_2026: StockDay[] = toDays([
	{ date: '2026-08-03', open: 365.45, high: 376.69, low: 363.35, close: 373.51 },
	{ date: '2026-08-04', open: 368.22, high: 380.52, low: 367.5, close: 377.65 },
	{ date: '2026-08-05', open: 383.34, high: 384.48, low: 356.77, close: 362.43 },
	{ date: '2026-08-06', open: 360.77, high: 364.13, low: 356.88, close: 357.75 },
	{ date: '2026-08-07', open: 356.72, high: 358.9, low: 353.78, close: 354.3 },
	{ date: '2026-08-10', open: 355.18, high: 357.61, low: 352.71, close: 357.52 },
	{ date: '2026-08-11', open: 355.89, high: 356.81, low: 343.39, close: 343.8 },
	{ date: '2026-08-12', open: 346.31, high: 346.48, low: 340.88, close: 343.54 },
	{ date: '2026-08-13', open: 345.77, high: 347.93, low: 343.76, close: 346.36 },
	{ date: '2026-08-14', open: 346.8, high: 350.45, low: 344.5, close: 345.9 },
	{ date: '2026-08-17', open: 346.27, high: 347.25, low: 341.93, close: 344.0 },
	{ date: '2026-08-18', open: 342.41, high: 344.87, low: 340.19, close: 344.2 },
	{ date: '2026-08-19', open: 342.46, high: 346.73, low: 340.66, close: 344.72 },
	{ date: '2026-08-20', open: 343.06, high: 343.9, low: 338.57, close: 340.67 },
	{ date: '2026-08-21', open: 342.58, high: 346.2, low: 340.4, close: 344.82 },
	{ date: '2026-08-24', open: 343.62, high: 351.6, low: 342.49, close: 348.06 },
	{ date: '2026-08-25', open: 349.64, high: 350.16, low: 345.6, close: 346.96 },
	{ date: '2026-08-26', open: 346.62, high: 346.88, low: 340.18, close: 342.0 },
	{ date: '2026-08-27', open: 339.67, high: 341.69, low: 338.52, close: 340.65 },
	{ date: '2026-08-28', open: 340.71, high: 349.14, low: 340.27, close: 346.59 },
	{ date: '2026-08-31', open: 343.83, high: 344.59, low: 337.16, close: 339.35 }
]);

export const AMZN_AUGUST_2026: StockDay[] = toDays([
	{ date: '2026-08-03', open: 278.29, high: 287.2, low: 278.0, close: 284.02 },
	{ date: '2026-08-04', open: 276.06, high: 281.07, low: 275.82, close: 277.42 },
	{ date: '2026-08-05', open: 281.59, high: 282.79, low: 270.73, close: 272.65 },
	{ date: '2026-08-06', open: 272.77, high: 275.48, low: 271.06, close: 272.26 },
	{ date: '2026-08-07', open: 272.87, high: 278.31, low: 272.75, close: 274.48 },
	{ date: '2026-08-10', open: 274.01, high: 280.14, low: 273.6, close: 278.09 },
	{ date: '2026-08-11', open: 278.69, high: 278.84, low: 271.36, close: 272.27 },
	{ date: '2026-08-12', open: 273.18, high: 273.46, low: 267.1, close: 267.28 },
	{ date: '2026-08-13', open: 267.24, high: 269.58, low: 264.71, close: 265.13 },
	{ date: '2026-08-14', open: 264.88, high: 265.81, low: 262.42, close: 262.65 },
	{ date: '2026-08-17', open: 265.44, high: 265.75, low: 258.34, close: 261.31 },
	{ date: '2026-08-18', open: 260.63, high: 262.18, low: 257.73, close: 259.45 },
	{ date: '2026-08-19', open: 260.85, high: 266.4, low: 258.58, close: 265.84 },
	{ date: '2026-08-20', open: 263.16, high: 263.84, low: 259.52, close: 260.11 },
	{ date: '2026-08-21', open: 260.74, high: 261.09, low: 257.04, close: 258.63 },
	{ date: '2026-08-24', open: 259.6, high: 263.32, low: 259.05, close: 262.07 },
	{ date: '2026-08-25', open: 262.51, high: 263.89, low: 259.83, close: 261.06 },
	{ date: '2026-08-26', open: 261.28, high: 262.05, low: 258.24, close: 260.28 },
	{ date: '2026-08-27', open: 259.23, high: 259.66, low: 255.02, close: 256.26 },
	{ date: '2026-08-28', open: 258.32, high: 267.56, low: 257.78, close: 266.43 },
	{ date: '2026-08-31', open: 263.83, high: 264.36, low: 257.12, close: 259.77 }
]);
