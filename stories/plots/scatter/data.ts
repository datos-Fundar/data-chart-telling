export type CountryPoint = {
  country: string;
  region: 'Americas' | 'Europe' | 'Asia' | 'Africa';
  gdpPerCapita: number;
  lifeExpectancy: number;
  population: number;
};

/** Synthetic 2022-ish snapshot - GDP per capita (USD thousands) vs. life expectancy (years), sized by population (millions). */
export const COUNTRIES: CountryPoint[] = [
  { country: 'Argentina', region: 'Americas', gdpPerCapita: 13.7, lifeExpectancy: 75.4, population: 46 },
  { country: 'Brazil', region: 'Americas', gdpPerCapita: 8.9, lifeExpectancy: 72.8, population: 215 },
  { country: 'Canada', region: 'Americas', gdpPerCapita: 55.5, lifeExpectancy: 81.9, population: 39 },
  { country: 'United States', region: 'Americas', gdpPerCapita: 76.3, lifeExpectancy: 77.4, population: 333 },
  { country: 'Mexico', region: 'Americas', gdpPerCapita: 11.5, lifeExpectancy: 70.2, population: 127 },
  { country: 'Chile', region: 'Americas', gdpPerCapita: 16.3, lifeExpectancy: 79.1, population: 19 },
  { country: 'Germany', region: 'Europe', gdpPerCapita: 51.2, lifeExpectancy: 80.9, population: 84 },
  { country: 'France', region: 'Europe', gdpPerCapita: 44.4, lifeExpectancy: 82.5, population: 68 },
  { country: 'Spain', region: 'Europe', gdpPerCapita: 30.1, lifeExpectancy: 83.2, population: 47 },
  { country: 'Norway', region: 'Europe', gdpPerCapita: 106.1, lifeExpectancy: 83.2, population: 5 },
  { country: 'Poland', region: 'Europe', gdpPerCapita: 18.7, lifeExpectancy: 76.6, population: 38 },
  { country: 'Portugal', region: 'Europe', gdpPerCapita: 25.4, lifeExpectancy: 81.1, population: 10 },
  { country: 'China', region: 'Asia', gdpPerCapita: 12.7, lifeExpectancy: 78.1, population: 1412 },
  { country: 'India', region: 'Asia', gdpPerCapita: 2.4, lifeExpectancy: 67.2, population: 1417 },
  { country: 'Japan', region: 'Asia', gdpPerCapita: 33.8, lifeExpectancy: 84.5, population: 124 },
  { country: 'South Korea', region: 'Asia', gdpPerCapita: 32.4, lifeExpectancy: 83.6, population: 52 },
  { country: 'Indonesia', region: 'Asia', gdpPerCapita: 4.8, lifeExpectancy: 67.6, population: 275 },
  { country: 'Vietnam', region: 'Asia', gdpPerCapita: 4.2, lifeExpectancy: 73.6, population: 98 },
  { country: 'Nigeria', region: 'Africa', gdpPerCapita: 2.2, lifeExpectancy: 53.9, population: 219 },
  { country: 'South Africa', region: 'Africa', gdpPerCapita: 6.8, lifeExpectancy: 62.3, population: 60 },
  { country: 'Egypt', region: 'Africa', gdpPerCapita: 3.9, lifeExpectancy: 70.5, population: 110 },
  { country: 'Kenya', region: 'Africa', gdpPerCapita: 2.1, lifeExpectancy: 61.4, population: 54 },
  { country: 'Ethiopia', region: 'Africa', gdpPerCapita: 0.9, lifeExpectancy: 65.1, population: 123 },
  { country: 'Morocco', region: 'Africa', gdpPerCapita: 3.7, lifeExpectancy: 74.0, population: 37 },
];

export const AMERICAS = COUNTRIES.filter((d) => d.region === 'Americas');
export const EUROPE = COUNTRIES.filter((d) => d.region === 'Europe');
