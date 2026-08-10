export type ProvincePoint = { province: string; value: number };
export type ProvinceLifeExpectancy = {
  province: string;
  value: number;
  sex: 'male' | 'female';
};

const PROVINCES = [
  'Buenos Aires',
  'Córdoba',
  'Santa Fe',
  'Formosa',
  'Tucumán',
  'La Rioja',
];

export const FEMALE_LIFE_EXPECTANCY_BY_PROVINCE: ProvincePoint[] = [
  { province: 'Buenos Aires', value: 84.2 },
  { province: 'Córdoba', value: 83.5 },
  { province: 'Santa Fe', value: 83.1 },
  { province: 'Formosa', value: 74.6 },
  { province: 'Tucumán', value: 82.4 },
  { province: 'La Rioja', value: 73.9 },
];

export const MALE_LIFE_EXPECTANCY_BY_PROVINCE: ProvincePoint[] = [
  { province: 'Buenos Aires', value: 79.8 },
  { province: 'Córdoba', value: 79.1 },
  { province: 'Santa Fe', value: 78.7 },
  { province: 'Formosa', value: 70.8 },
  { province: 'Tucumán', value: 78.0 },
  { province: 'La Rioja', value: 70.3 },
];

export const LIFE_EXPECTANCY_BY_PROVINCE: ProvinceLifeExpectancy[] = PROVINCES.flatMap((province) => {
  const female = FEMALE_LIFE_EXPECTANCY_BY_PROVINCE.find((d) => d.province === province);
  const male = MALE_LIFE_EXPECTANCY_BY_PROVINCE.find((d) => d.province === province);
  return [
    { province, value: female?.value || 0, sex: 'female' },
    { province, value: male?.value || 0, sex: 'male' },
  ];
});

export type AgeBracketPoint = { province: string; bracket: string; value: number; year: number };

// All 24 provinces (unlike the curated 6 above) — deliberately large so the
// stories using it exercise many thin, stacked, horizontal bands at once.
const ALL_PROVINCES = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
  'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
  'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
];
export const AGE_BRACKETS = ['0 a 14 años', '15 a 64 años', '65 y más'];

const ageBracketValues: Record<string, [number, number, number]> = {};
let seed = 7;
function rnd() {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
}
for (const p of ALL_PROVINCES) {
  const young = 12 + rnd() * 6;
  const old = 12 + rnd() * 10;
  ageBracketValues[p] = [Number(young.toFixed(2)), Number((100 - young - old).toFixed(2)), Number(old.toFixed(2))];
}

export const AGE_BRACKET_BY_PROVINCE: AgeBracketPoint[] = ALL_PROVINCES.flatMap((province) =>
  AGE_BRACKETS.map((bracket, i) => ({ province, bracket, value: ageBracketValues[province][i], year: 2040 })),
);

export function provinceSort(a: Record<string, unknown>, b: Record<string, unknown>): number {
  return String(a.province).localeCompare(String(b.province), 'es');
}
