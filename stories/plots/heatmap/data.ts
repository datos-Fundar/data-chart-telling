export type AgeProvinceCell = {
  ageGroup: string;
  province: string;
  pct: number;
};

export const AGE_GROUPS = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

export const PROVINCES = [
  'Buenos Aires',
  'Córdoba',
  'Santa Fe',
  'Mendoza',
  'Tucumán',
];

// Employment rate (0-1) by age group and province
export const EMPLOYMENT_BY_AGE_PROVINCE: AgeProvinceCell[] = AGE_GROUPS.flatMap(
  (ageGroup, ageIdx) =>
    PROVINCES.map((province, provIdx) => ({
      ageGroup,
      province,
      pct: Math.max(0.2, 0.85 - (ageIdx * 0.08 + provIdx * 0.03) + Math.random() * 0.05),
    }))
);

export type RoomsPeopleCell = {
  rooms: number;
  people: number;
  pct: number;
};

// Density matrix: percentage of households by rooms and occupants
export const ROOMS_PEOPLE_DENSITY: RoomsPeopleCell[] = [1, 2, 3, 4].flatMap(
  (rooms) =>
    [1, 2, 3, 4].map((people) => ({
      rooms,
      people,
      pct: Math.max(0, (4 - Math.abs(rooms - people)) / 10),
    }))
);
