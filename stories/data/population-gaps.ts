import { AGE_GROUPS, POPULATION_BY_AGE_AT_2022, type AgeRow } from '$datasets';

export type AgeRowWithGaps = Omit<AgeRow, 'year' | 'share'> & { share: number | null };

/**
 * The 2022 'Female' series with three holes - the first two age groups
 * (start), an internal pair bounded by real data on both sides (middle), and
 * the last two (end) - used to demonstrate PyramidPlot's styles.gaps fill
 * on the same series every other PyramidPlot story already uses.
 */
export const FEMALE_2022_WITH_GAPS: AgeRowWithGaps[] = POPULATION_BY_AGE_AT_2022.filter(
	(d) => d.sex === 'Female'
).map((d, i) => ({
	ageGroup: d.ageGroup,
	sex: d.sex,
	share: i < 2 || (i >= 8 && i < 10) || i >= AGE_GROUPS.length - 2 ? null : d.share
}));
