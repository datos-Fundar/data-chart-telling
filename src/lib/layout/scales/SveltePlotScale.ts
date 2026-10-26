import { SvelteSet } from 'svelte/reactivity';
import type { AxisScale } from '$lib/types/layout/scales';
import type { AxisChannelName, AxisValue } from '$lib/types/layout/mapping';
import { NiceTicks } from '$lib/layout/scales/NiceTicks';

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
	 * and a vertical `label`, which `ScalesLayout` draws, and a `nice` object's `tolerance`,
	 * which the "scales" phase applies (svelteplot is told plain `nice: true`) - with a custom `sort` resolved into a
	 * `domain`, and `nice: true` on an unpinned numeric axis. A linear axis left to
	 * `nice` is niced here instead, for as many ticks as fit the `axis`' `span` px.
	 */
	static build<TData>(
		scale: AxisScale<TData> | undefined,
		rows: TData[],
		getAxisValue: (d: TData) => AxisValue,
		{ axis, span }: { axis: AxisChannelName; span: number }
	): AxisScale<TData> | undefined {
		const sorted = SveltePlotScale.#sorted(scale, rows, getAxisValue);
		const wantsNice =
			scale?.domain == null &&
			scale?.ticks == null &&
			scale?.nice == null &&
			(scale?.type == null || SveltePlotScale.CONTINUOUS_NUMERIC_TYPES.has(scale.type)) &&
			SveltePlotScale.#isNumeric(rows, getAxisValue);
		const removesAxis = scale?.axisDisplay === 'none';
		// svelteplot treats a categorical axis told to be `nice` as linear, and draws nothing.
		const dropsNice = scale?.nice != null && SveltePlotScale.#isCategorical(rows, getAxisValue);
		if (!sorted && !wantsNice && !removesAxis && !dropsNice)
			return SveltePlotScale.#niced(sorted, rows, getAxisValue, axis, span);
		const out: AxisScale<TData> & { axis?: false } = { ...sorted };
		delete out.grid;
		delete out.axisDisplay;
		if (removesAxis) out.axis = false;
		if (scale?.labelOrientation === 'vertical') out.label = false;
		if (dropsNice) delete out.nice;
		else if (wantsNice || typeof scale?.nice === 'object') out.nice = true;
		return SveltePlotScale.#niced(out, rows, getAxisValue, axis, span);
	}

	/**
	 * A linear axis svelteplot would nice itself, with its domain niced here for
	 * as many ticks as fit `span` px. svelteplot counts its ticks off the plot's
	 * settled margins, and a margin that grows to fit the last tick label can drop
	 * that count, move the label in and shrink back - every frame. A `span` that
	 * does not follow the settled margins holds the domain still.
	 */
	static #niced<TData>(
		scale: AxisScale<TData> | undefined,
		rows: TData[],
		getAxisValue: (d: TData) => AxisValue,
		axis: AxisChannelName,
		span: number
	): AxisScale<TData> | undefined {
		if (scale?.nice !== true || scale.domain != null) return scale;
		if (scale.type != null && scale.type !== 'auto' && scale.type !== 'linear') return scale;
		const values = rows.map(getAxisValue).filter((v) => v != null);
		if (!values.every((v) => typeof v === 'number')) return scale;
		const numbers = (values as number[]).filter(Number.isFinite);
		if (scale.zero) numbers.push(0);
		const lo = Math.min(...numbers);
		const hi = Math.max(...numbers);
		if (!(hi > lo)) return scale;
		const count = NiceTicks.count(span, NiceTicks.SPACING[axis], axis === 'x' ? 3 : 2);
		return { ...scale, domain: NiceTicks.domain(lo, hi, count, 0), nice: false };
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

	/** Whether the axis lays out text categories: any of its values is a string. */
	static #isCategorical<TData>(rows: TData[], getAxisValue: (d: TData) => AxisValue): boolean {
		return rows.some((row) => typeof getAxisValue(row) === 'string');
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
