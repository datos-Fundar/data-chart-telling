<script lang="ts" generics="TRow extends Record<string, unknown>">
	import { untrack } from 'svelte';
	import { resolveAccessor } from '$lib/plots/utils/accessors';
	import TimelineFrame from '$lib/layout/timeline/TimelineFrame.svelte';
	import { TimelineSteps } from '$lib/layout/timeline/TimelineSteps';
	import { TimelineTime } from '$lib/layout/timeline/TimelineTime';
	import { Interpolation } from '$lib/utils/Interpolation';
	import type {
		Orientation,
		TimeInput,
		TimeValue,
		TimelineChildSnippet,
		TimelineInterpolation
	} from '$lib/types/layout/timeline';
	import type { Accessor } from '$lib/types/plots/data/common';
	import type { PlotBoxContext } from '$lib/types/layout/figure';

	/**
	 * Couples a scrubber `progress` to a discrete sequence of time steps. It picks
	 * the selected step, filters the data down to it, and renders the plot beside
	 * the timeline in a `TimelineFrame`. The plot itself is supplied as the
	 * `child` snippet, so this layout is plot-agnostic.
	 */
	let {
		data,
		accessor,
		dateFormat,
		progress,
		values,
		orientation = 'vertical',
		show = true,
		thickness = 60,
		filterMode = 'exact',
		interpolate,
		onsteps,
		width,
		height,
		child
	}: {
		data: TRow[];
		accessor: Accessor<TRow, TimeInput>;
		/** How a non-ISO date string reads. */
		dateFormat?: string;
		progress: number;
		values?: TimeInput[];
		orientation?: Orientation;
		show?: boolean;
		thickness?: number;
		filterMode?: 'exact' | 'upTo';
		interpolate?: TimelineInterpolation<TRow>;
		/** Told the steps, and whether they are dates, when they change. */
		onsteps?: (values: TimeValue[], temporal: boolean) => void;
		width: number;
		height: number;
		child: TimelineChildSnippet<TRow>;
	} = $props();

	const time = $derived(new TimelineTime(dateFormat));
	const getRaw = $derived(resolveAccessor<TRow>(accessor) as (row: TRow) => unknown);
	/** A row's step, or `undefined` when its value reads as none. */
	const getTime = $derived((row: TRow) => time.toTime(getRaw(row)));
	/** The rows with a step; one without shows at every step. */
	const timed = $derived(data.filter((row) => getTime(row) !== undefined));
	const untimed = $derived(data.filter((row) => getTime(row) === undefined));

	const steps = $derived(
		TimelineSteps.of(
			values?.map((value) => time.toTime(value)).filter((v): v is TimeValue => v !== undefined),
			timed,
			getTime as (row: TRow) => TimeValue
		)
	);
	const temporal = $derived(time.isTemporal(values?.length ? values : timed.map(getRaw)));

	$effect(() => {
		const found = steps.values;
		const dates = temporal;
		untrack(() => onsteps?.(found, dates));
	});

	const progressEasingFn = $derived(Interpolation.buildEasing(interpolate?.progressEasing));
	const segmentEasingFn = $derived(Interpolation.buildEasing(interpolate?.segmentEasing));

	/** Continuous scrub position across the full step domain - only meaningful when `interpolate` is set. */
	const currentTime = $derived(steps.timeAt(progress, progressEasingFn));

	const selectedValue = $derived(
		(interpolate ? steps.nearest(currentTime) : steps.at(progress)) ?? 0
	);

	function defaultCreate(_lower: TRow, upper: TRow, x: TimeValue, value: number): TRow {
		const valueField = interpolate?.value;
		if (typeof accessor !== 'string' || typeof valueField !== 'string') {
			console.warn(
				'TimelineLayout: cannot auto-build an interpolated row when `accessor` or `interpolate.value` is a function - pass `interpolate.create` explicitly.'
			);
			return upper;
		}
		return {
			...upper,
			[accessor]: time.toValueLike(x, upper[accessor]),
			[valueField]: value
		} as TRow;
	}

	const filtered = $derived.by(() => {
		const discrete = () =>
			data.filter((d) => {
				const at = getTime(d);
				return at === undefined || TimelineSteps.matches(at, selectedValue, filterMode);
			});

		if (!interpolate) return discrete();
		if (!interpolate.value) {
			console.warn(
				'TimelineLayout: `interpolate.value` is required to tween - falling back to discrete filtering.'
			);
			return discrete();
		}

		const getKey = resolveAccessor<TRow>(interpolate.key ?? (() => '__all__'));
		const getValue = resolveAccessor<TRow>(interpolate.value) as (d: TRow) => number;
		const create = interpolate.create ?? defaultCreate;

		const groups = Map.groupBy(timed, (row) => String(getKey(row)));

		const result: TRow[] = [...untimed];
		for (const rows of groups.values()) {
			const tweened = Interpolation.tweenSeries({
				rows,
				x: currentTime,
				getTime: getTime as (row: TRow) => TimeValue,
				getValue,
				create,
				segmentEasing: segmentEasingFn
			});
			if (filterMode === 'upTo') result.push(...tweened);
			else if (tweened.length) result.push(tweened[tweened.length - 1]);
		}
		return result;
	});
</script>

{#snippet plot({ width: w, height: h }: PlotBoxContext)}
	{@render child({ selectedValue, data: filtered, width: w, height: h })}
{/snippet}

<TimelineFrame
	steps={steps.values}
	{selectedValue}
	{orientation}
	{show}
	{thickness}
	{width}
	{height}
	child={plot}
/>
