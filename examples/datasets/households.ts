// ── Households of Buenos Aires City by rooms and people, 2022 ───────────────
// 2022 national census. Share of all households, in percent.

export type HouseholdRow = { rooms: string; people: string; share: number };

export const ROOMS = ['1', '2', '3', '4', '5+'];

const HOUSEHOLD_SHARES = [
	{ people: '1', byRooms: [8.8, 14.8, 9.6, 3.7, 2.1] },
	{ people: '2', byRooms: [3, 8.4, 9.3, 4.5, 2.9] },
	{ people: '3', byRooms: [1.2, 3.4, 5.9, 3.2, 2] },
	{ people: '4', byRooms: [0.6, 1.8, 3.8, 3, 2] },
	{ people: '5+', byRooms: [0.3, 1, 1.7, 1.5, 1.6] }
];

export const HOUSEHOLDS: HouseholdRow[] = HOUSEHOLD_SHARES.flatMap(({ people, byRooms }) =>
	ROOMS.map((rooms, roomsIndex) => ({ rooms, people, share: byRooms[roomsIndex] }))
);
