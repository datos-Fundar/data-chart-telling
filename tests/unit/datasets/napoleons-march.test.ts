import { describe, test, expect } from 'vitest';
import {
	NAPOLEONS_ARMY,
	NAPOLEONS_LABEL_ROWS,
	NAPOLEONS_SIZE_LABELS
} from '../../../examples/datasets/napoleons-march';

describe("Napoleon's march dataset", () => {
	test('every size label is set to an army row', () => {
		expect(NAPOLEONS_LABEL_ROWS).toHaveLength(NAPOLEONS_SIZE_LABELS.length);
		for (const row of NAPOLEONS_LABEL_ROWS) expect(NAPOLEONS_ARMY[row]).toBeDefined();
	});

	test('the labels follow the march', () => {
		for (let index = 1; index < NAPOLEONS_LABEL_ROWS.length; index++) {
			expect(NAPOLEONS_LABEL_ROWS[index]).toBeGreaterThan(NAPOLEONS_LABEL_ROWS[index - 1]);
		}
	});

	test('every advance meets its retreat at the same place', () => {
		for (const division of [1, 2, 3]) {
			const rows = NAPOLEONS_ARMY.filter((row) => row.division === division);
			const lastAdvance = rows.filter((row) => row.direction === 'A').at(-1)!;
			const firstRetreat = rows.find((row) => row.direction === 'R')!;
			expect(
				Math.hypot(lastAdvance.lon - firstRetreat.lon, lastAdvance.lat - firstRetreat.lat)
			).toBeLessThan(0.2);
		}
	});
});
