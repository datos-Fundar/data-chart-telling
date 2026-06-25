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
  'Mendoza',
  'Tucumán',
  'Santiago del Estero',
  'Misiones',
  'Corrientes',
  'La Pampa',
  'Catamarca',
];

export const FEMALE_LIFE_EXPECTANCY_BY_PROVINCE: ProvincePoint[] = [
  { province: 'Buenos Aires', value: 84.2 },
  { province: 'Córdoba', value: 83.5 },
  { province: 'Santa Fe', value: 83.1 },
  { province: 'Mendoza', value: 82.8 },
  { province: 'Tucumán', value: 82.4 },
  { province: 'Santiago del Estero', value: 81.9 },
  { province: 'Misiones', value: 82.7 },
  { province: 'Corrientes', value: 82.3 },
  { province: 'La Pampa', value: 83.6 },
  { province: 'Catamarca', value: 82.1 },
];

export const MALE_LIFE_EXPECTANCY_BY_PROVINCE: ProvincePoint[] = [
  { province: 'Buenos Aires', value: 79.8 },
  { province: 'Córdoba', value: 79.1 },
  { province: 'Santa Fe', value: 78.7 },
  { province: 'Mendoza', value: 78.4 },
  { province: 'Tucumán', value: 78.0 },
  { province: 'Santiago del Estero', value: 77.5 },
  { province: 'Misiones', value: 78.3 },
  { province: 'Corrientes', value: 77.9 },
  { province: 'La Pampa', value: 79.2 },
  { province: 'Catamarca', value: 77.7 },
];

export const LIFE_EXPECTANCY_BY_PROVINCE: ProvinceLifeExpectancy[] = PROVINCES.flatMap((province) => {
  const female = FEMALE_LIFE_EXPECTANCY_BY_PROVINCE.find((d) => d.province === province);
  const male = MALE_LIFE_EXPECTANCY_BY_PROVINCE.find((d) => d.province === province);
  return [
    { province, value: female?.value || 0, sex: 'female' },
    { province, value: male?.value || 0, sex: 'male' },
  ];
});
