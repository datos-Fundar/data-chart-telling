import { Transforms } from '$lib/phases/transforms/Transforms';
import { resolveAccessor } from '$lib/utils/accessors';
import { isGapValue } from '$lib/plots/utils/gaps';
import type { ProcessedRow } from '$lib/types/phases';
import type { DensityKernel } from '$lib/types/transforms/density';

/** One violin: a category's density curve. */
export type ViolinProfile = {
	category: unknown;
	/** The density estimate, in order along the value axis. */
	curve: { value: number; density: number }[];
};

/** How the density of each category is estimated. */
export type ViolinEstimate = {
	kernel?: DensityKernel;
	bandwidth?: number;
	/** Keeps each curve within its values' own extent. Defaults to `true`. */
	trim?: boolean;
};

/** The violins of a set of rows, one per category. */
export class ViolinProfiles {
	/** One profile per category of `rows` with at least two values, in the order the rows first reach it. */
	static of(
		rows: ProcessedRow[],
		read: { category: (row: ProcessedRow) => unknown; value: (row: ProcessedRow) => unknown },
		estimate: ViolinEstimate = {}
	): ViolinProfile[] {
		const groups = new Map<string, { category: unknown; rows: ProcessedRow[]; values: number[] }>();
		for (const row of rows) {
			const raw = read.value(row);
			if (isGapValue(raw)) continue;
			const value = Number(raw);
			if (!Number.isFinite(value)) continue;
			const category = read.category(row);
			const key = String(category);
			const group = groups.get(key);
			if (group) {
				group.rows.push(row);
				group.values.push(value);
			} else groups.set(key, { category, rows: [row], values: [value] });
		}

		return [...groups.values()].flatMap(({ category, rows: own, values }) => {
			if (values.length < 2) return [];
			const extent: [number, number] = [Math.min(...values), Math.max(...values)];
			const curve = ViolinProfiles.#curve(own, read.value, estimate, extent);
			return curve.length < 2 ? [] : [{ category, curve }];
		});
	}

	/** The densest point of any of `profiles`, for violins that share one density scale. */
	static peak(profiles: ViolinProfile[]): number {
		return Math.max(0, ...profiles.flatMap((p) => p.curve.map((point) => point.density)));
	}

	static #curve(
		rows: ProcessedRow[],
		value: (row: ProcessedRow) => unknown,
		estimate: ViolinEstimate,
		extent: [number, number]
	): ViolinProfile['curve'] {
		const trim = estimate.trim ?? true;
		const result = Transforms.run({
			type: 'densityY',
			data: rows,
			y: value as never,
			kernel: estimate.kernel,
			bandwidth: estimate.bandwidth,
			trim
		});
		const along = resolveAccessor(result.y as never) as (row: unknown) => unknown;
		const density = resolveAccessor(result.x as never) as (row: unknown) => unknown;
		return (result.data as unknown[])
			.map((row) => ({ value: Number(along(row)), density: Number(density(row)) }))
			.map((p) => (trim ? { ...p, value: Math.min(Math.max(p.value, extent[0]), extent[1]) } : p))
			.filter((p) => Number.isFinite(p.value) && Number.isFinite(p.density));
	}
}
