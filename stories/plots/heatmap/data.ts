export type ProvinceSexCell = {
  province: string;
  sex: 'Female' | 'Male';
  value: number;
};

export const PROVINCES = [
  'Buenos Aires',
  'Córdoba',
  'Santa Fe',
  'Formosa',
  'Tucumán',
  'La Rioja',
];

export const SEXES: Array<ProvinceSexCell['sex']> = ['Female', 'Male'];

const FEMALE_VALUES: Record<string, number> = {
  'Buenos Aires': 84.2,
  'Córdoba': 83.5,
  'Santa Fe': 83.1,
  'Formosa': 74.6,
  'Tucumán': 82.4,
  'La Rioja': 73.9,
};

const MALE_VALUES: Record<string, number> = {
  'Buenos Aires': 79.8,
  'Córdoba': 79.1,
  'Santa Fe': 78.7,
  'Formosa': 70.8,
  'Tucumán': 78.0,
  'La Rioja': 70.3,
};

// Life expectancy at birth (years) by province and sex.
export const FEMALE_LIFE_EXPECTANCY_BY_PROVINCE: ProvinceSexCell[] = PROVINCES.map((province) => ({
  province,
  sex: 'Female',
  value: FEMALE_VALUES[province],
}));

export const MALE_LIFE_EXPECTANCY_BY_PROVINCE: ProvinceSexCell[] = PROVINCES.map((province) => ({
  province,
  sex: 'Male',
  value: MALE_VALUES[province],
}));

export const LIFE_EXPECTANCY_BY_PROVINCE_SEX: ProvinceSexCell[] = [
  ...FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
  ...MALE_LIFE_EXPECTANCY_BY_PROVINCE,
];
