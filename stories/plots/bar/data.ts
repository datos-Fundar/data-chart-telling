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
