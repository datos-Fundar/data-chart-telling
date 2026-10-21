import { SvelteSet } from 'svelte/reactivity';
import type { AxisScale } from '$lib/types/layout/scales';
import type { AxisValue } from '$lib/types/layout/mapping';

/** An {@link AxisScale} turned into the options svelteplot's `<Plot x>`/`<Plot y>` accepts. */
export class SveltePlotScale {
	/** Scale types the default `nice` applies to - every other type has its own tick semantics (or isn't numeric at all). */
	static readonly CONTINUOUS_NUMERIC_TYPES: ReadonlySet<string> = new Set([
		'auto',
		'linear',
		'pow',
		'sqrt',
		'log',
		'symlog'
	]);

	/**
	 * The scale without what the package handles itself - `grid`, `axisDisplay`
	 * and a vertical `label`, which `ScalesLayout` draws, and `niceTolerance`,
	 * which the "scales" phase applies - with a custom `sort` resolved into a
	 * `domain`, and `nice: true` on an unpinned numeric axis.
	 */
	static build<TData>(
		scale: AxisScale<TData> | undefined,
		rows: TData[],
		getAxisValue: (d: TData) => AxisValue
	): AxisScale<TData> | undefined {
		const sorted = SveltePlotScale.#sorted(scale, rows, getAxisValue);
		const wantsNice =
			scale?.domain == null &&
			scale?.ticks == null &&
			scale?.nice == null &&
			(scale?.type == null || SveltePlotScale.CONTINUOUS_NUMERIC_TYPES.has(scale.type)) &&
			SveltePlotScale.#isNumeric(rows, getAxisValue);
		const removesAxis = scale?.axisDisplay === 'none';
		if (!sorted && !wantsNice && !removesAxis) return sorted;
		const out: AxisScale<TData> & { axis?: false } = { ...sorted };
		delete out.grid;
		delete out.axisDisplay;
		delete out.niceTolerance;
		if (removesAxis) out.axis = false;
		if (scale?.labelOrientation === 'vertical') out.label = false;
		if (wantsNice) out.nice = true;
		return out;
	}

	/** svelteplot's `sort` option only does a fixed ascending sort; a custom `scale.sort` comparator is resolved into an explicit `domain` instead, which svelteplot honors as-is. */
	static #sorted<TData>(
		scale: AxisScale<TData> | undefined,
		rows: TData[],
		getAxisValue: (d: TData) => AxisValue
	): AxisScale<TData> | undefined {
		const sort = scale?.sort;
		if (typeof sort !== 'function' || scale?.domain) return scale;
		const reps = SveltePlotScale.#uniqueRows(rows, getAxisValue);
		if (reps.length === 0 || !reps.every((r) => typeof getAxisValue(r) === 'string')) return scale;
		const domain = [...reps].sort(sort).map(getAxisValue);
		return { ...scale, domain };
	}

	/** One representative row per unique axis value (first occurrence in `rows`). */
	static #uniqueRows<TData>(rows: TData[], getAxisValue: (d: TData) => AxisValue): TData[] {
		const seen = new SvelteSet<AxisValue>();
		const out: TData[] = [];
		for (const row of rows) {
			const v = getAxisValue(row);
			if (seen.has(v)) continue;
			seen.add(v);
			out.push(row);
		}
		return out;
	}

	/** Whether the axis' values are numeric; `nice` on a categorical axis would make svelteplot treat it as linear. */
	static #isNumeric<TData>(rows: TData[], getAxisValue: (d: TData) => AxisValue): boolean {
		let numericSeen = 0;
		for (const row of rows) {
			const v = getAxisValue(row);
			if (v == null) continue;
			if (typeof v !== 'number') return false;
			if (++numericSeen >= 2) return true;
		}
		return numericSeen > 0;
	}
}
