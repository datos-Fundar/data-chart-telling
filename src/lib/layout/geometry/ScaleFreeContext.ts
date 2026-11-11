/**
 * svelteplot's plot context as the marks drawn under a `ScaleFreeMarks` see it: the plot's own state and scales,
 * but marks that never join the plot's list of marks.
 *
 * svelteplot works out a plot's scales from every mark it holds - their data and options - so a mark whose data
 * changes at every move of the pointer (a hover's dot, its rule, its value) lays the whole plot out again each time:
 * every scale built anew from every row, every mark scaled again, the margins measured again. A mark that is only
 * drawn on the plot's scales, never shaping them, can be left out of them.
 *
 * Left out, a mark is in none of the scales' `skip` lists either - the marks whose channel values are already
 * output (a color, a symbol, an opacity) and go through no scale. What these marks draw has no scale of its own to
 * go through, so every such channel of theirs is taken as it is: a hover's colors are its points' own, resolved.
 */

/** The parts of svelteplot's plot context a mark reads. */
export type SvelteplotContext = {
	addMark: (mark: { id: symbol }) => void;
	removeMark: (mark: { id: symbol }) => void;
	updateMark?: (mark: { id: symbol }) => void;
	getPlotState: () => object;
	[key: string]: unknown;
};

/** The scales whose channel values a scale-free mark takes as they are, never through the scale. */
const OUTPUT_SCALES = new Set<PropertyKey>(['color', 'opacity', 'symbol']);

/** A `skip` list holding every mark: each of the channel's values is output already. */
const EVERY_MARK = { has: () => true };
const SKIP_ALL = { get: () => EVERY_MARK };

/** A Proxy's `get` reading `target`'s own property (a class getter runs on the target, its private fields there). */
const read = (target: object, key: PropertyKey) => {
	const value = Reflect.get(target, key);
	return typeof value === 'function' ? value.bind(target) : value;
};

const scaleViews = new WeakMap<object, object>();
const scalesViews = new WeakMap<object, object>();
const stateViews = new WeakMap<object, object>();

/** One cached view of `target` per object, so a mark that derives from it sees the same one until it changes. */
function viewOf<T extends object>(
	cache: WeakMap<object, object>,
	target: T,
	make: (t: T) => object
): T {
	let view = cache.get(target);
	if (!view) {
		view = make(target);
		cache.set(target, view);
	}
	return view as T;
}

/** A scale whose `skip` holds every mark. */
const outputScale = (scale: object) =>
	viewOf(
		scaleViews,
		scale,
		(s) => new Proxy(s, { get: (t, k) => (k === 'skip' ? SKIP_ALL : read(t, k)) })
	);

/** The plot's scales, its output scales skipping every mark. */
const scalesView = (scales: object) =>
	viewOf(
		scalesViews,
		scales,
		(s) =>
			new Proxy(s, {
				get: (t, k) => {
					const scale = read(t, k);
					return OUTPUT_SCALES.has(k) && scale && typeof scale === 'object'
						? outputScale(scale)
						: scale;
				}
			})
	);

/** The plot's state, read live, with its scales as `scalesView` shows them. */
const stateView = (state: object) =>
	viewOf(
		stateViews,
		state,
		(s) =>
			new Proxy(s, {
				get: (t, k) => {
					const value = read(t, k);
					return k === 'scales' && value && typeof value === 'object' ? scalesView(value) : value;
				}
			})
	);

export const ScaleFreeContext = {
	/** `parent`, the plot's own context, for marks drawn on its scales that never take part in them. */
	of(parent: SvelteplotContext): SvelteplotContext {
		return {
			...parent,
			addMark: () => {},
			removeMark: () => {},
			updateMark: () => {},
			getPlotState: () => stateView(parent.getPlotState())
		};
	}
};
