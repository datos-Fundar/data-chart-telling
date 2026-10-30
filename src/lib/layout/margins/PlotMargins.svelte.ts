import { getContext, setContext } from 'svelte';
import { Margins } from '$lib/layout/margins/Margins';
import { Box } from '$lib/layout/margins/Box';
import { CellAlignment } from '$lib/layout/grid/GridAlignment.svelte';
import type { MarginConfig, MarginSide } from '$lib/types/plots/props';
import type { BoxAnchors, EdgeBox } from '$lib/types/layout/box';
import type { AxisScale } from '$lib/types/layout/scales';
import type { AxisChannelName } from '$lib/types/layout/mapping';

const PLOT_MARGINS_KEY = Symbol('dct-plot-margins');

/** The side each axis draws its tick labels on. */
const TICK_SIDES = { x: 'bottom', y: 'left' } as const;

/** What a plot's margins are built from, each read reactively. */
export type PlotMarginsInputs = {
	/** The theme's margins. */
	theme: () => MarginConfig;
	/** The author's `margins`: a side set here is theirs, and never grows. */
	author: () => MarginConfig | undefined;
	/** What an `'auto'` side reads as, for the plot's own numbers. */
	estimate: () => Margins;
	/**
	 * Boxes the plot expects around points on its edges - its labels, before
	 * they render: how far each reaches past its edges is where growth starts,
	 * so they fit from the first render.
	 */
	reserve: () => EdgeBox[];
	/** The plot's box: labels never reach out more than half of it. */
	size: () => { width: number; height: number };
	/** Growth resets to what `reserve` keeps whenever this changes (by identity). */
	resetKey: () => unknown;
	/** The plot's scales: an axis whose tick labels rotate (`tickRotate`) takes more or less room on its side. */
	scales: () => Partial<Record<AxisChannelName, Pick<AxisScale, 'tickRotate'>>> | undefined;
	/** The tick labels' font size. */
	tickFontSize: () => number;
	/** How wide the widest tick label of an axis is, where the plot measured it: a rotated axis takes room for that, not for a guessed width. */
	tickWidth?: () => Partial<Record<AxisChannelName, number | undefined>>;
	/** Receives the margins the labels settled on - the plot's bindable `margins`. */
	settle?: (margins: MarginConfig) => void;
};

/**
 * One plot's margins: the theme's, then the author's, then the room its
 * labels reach out into (grown on every side the author left open), then the
 * room rotated tick labels take or give back, and last the margins an aligned grid pinned on
 * it. The plot's markers hand it what they draw to measure ({@link watch});
 * it follows what svelteplot settles on ({@link follow}), for its grid. Its {@link box} and {@link contentBox} are the plot's box and
 * area for any consumer, and {@link place} fits something of a given size
 * next to a point inside the box.
 *
 * The margins the labels settled on go back out through `settle`; read back
 * in as `author`, they hold as a minimum instead of fixing their sides.
 * Create it during component init: it registers itself for the plot's
 * markers ({@link PlotMargins.current}).
 */
export class PlotMargins {
	readonly #inputs: PlotMarginsInputs;
	readonly #cell = CellAlignment.current();
	#measured = $state.raw(Margins.ZERO);
	/** The sides the labels settled on, as last handed to `settle`. */
	#settled: Partial<Record<MarginSide, number>> | undefined;

	constructor(inputs: PlotMarginsInputs) {
		this.#inputs = inputs;
		setContext(PLOT_MARGINS_KEY, this);

		// The first run is not a reset.
		let first = true;
		$effect(() => {
			inputs.resetKey();
			if (first) first = false;
			else this.#measured = Margins.ZERO;
		});

		$effect(() => {
			const grown = this.#grown;
			const settled = this.#settled;
			if (!inputs.settle || Object.keys(grown).length === 0) return;
			if (settled && Margins.SIDES.every((side) => settled[side] === grown[side])) return;
			this.#settled = grown;
			inputs.settle({ ...inputs.author(), ...grown });
		});
	}

	/** The plot's margins, or `null` outside a plot. Call during component init. */
	static current(): PlotMargins | null {
		return getContext<PlotMargins | undefined>(PLOT_MARGINS_KEY) ?? null;
	}

	/**
	 * Measures `el`'s rendered box once its readings settle - again whenever
	 * the content box or `deps` change - and reports how far it reaches past
	 * the content box: to `onOverflow`, and, when `grow` holds, into the room
	 * the margins grow by. Call during component init.
	 */
	watch(
		el: () => SVGGraphicsElement | undefined,
		options: {
			grow?: () => boolean;
			onOverflow?: (overflow: Margins) => void;
			deps?: () => unknown;
		}
	): void {
		$effect(() => {
			const element = el();
			const bounds = this.contentBox;
			options.deps?.();
			if (!element) return;

			let cancelled = false;
			let frame: number | undefined;
			let attempt = 0;
			let last: Margins | undefined;
			const measure = () => {
				if (cancelled) return;
				let box: Box;
				try {
					box = Box.of(element.getBBox());
				} catch {
					return;
				}
				const overflow = box.overflow(bounds);
				attempt += 1;
				const stable = overflow.equals(last);
				last = overflow;
				if (!stable && attempt < PlotMargins.#MAX_READINGS) {
					frame = requestAnimationFrame(measure);
					return;
				}
				options.onOverflow?.(overflow);
				if (options.grow?.()) this.reportOverflow(overflow);
			};
			// Text measures right only once its fonts load.
			(document.fonts?.ready ?? Promise.resolve()).then(() => {
				if (!cancelled) frame = requestAnimationFrame(measure);
			});
			return () => {
				cancelled = true;
				if (frame !== undefined) cancelAnimationFrame(frame);
			};
		});
	}

	/** How many frames {@link watch} waits for a box to settle. */
	static readonly #MAX_READINGS = 30;

	/** Grows the labels' room to fit what reached `overflow` px past the content box. */
	reportOverflow(overflow: Margins): void {
		const next = this.#measured.max(overflow);
		if (!next.equals(this.#measured)) this.#measured = next;
	}

	/**
	 * Follows the margins svelteplot settles on - `plot` is its `usePlot()`,
	 * only readable inside its `<Plot>` - and reports them to the enclosing
	 * aligned grid cell, if any. Call during the init of a component inside it.
	 */
	follow(plot: { options: Record<string, unknown> }): void {
		const cell = this.#cell;
		if (!cell) return;
		$effect(() => {
			const { marginTop, marginRight, marginBottom, marginLeft } = plot.options;
			cell.report(
				new Margins(
					Number(marginTop) || 0,
					Number(marginRight) || 0,
					Number(marginBottom) || 0,
					Number(marginLeft) || 0
				)
			);
		});
	}

	/** The room the `reserve` boxes take past the edges their points can sit on. */
	readonly #reserved = $derived.by(() =>
		this.#inputs.reserve().reduce((room, { box, edges }) => {
			const reach = box.reach;
			return room.max(Margins.of(Object.fromEntries(edges.map((side) => [side, reach[side]]))));
		}, Margins.ZERO)
	);

	/** The room labels need, on every side the author left open. */
	readonly #grown = $derived.by(() => {
		const author = this.#inputs.author();
		const settled = this.#settled;
		const { width, height } = this.#inputs.size();
		const growth = this.#measured.max(this.#reserved).min(Margins.half(width, height));
		const estimate = this.#inputs.estimate();
		const out: Partial<Record<MarginSide, number>> = {};
		for (const side of Margins.SIDES) {
			const own = author?.[side];
			// A side read back from `settle` is a minimum; any other the author set is fixed.
			const held = typeof own === 'number' && settled?.[side] === own ? own : undefined;
			if (own !== undefined && held === undefined) continue;
			const grown = growth[side] > 0 ? estimate[side] + growth[side] : undefined;
			if (held !== undefined || grown !== undefined) out[side] = Math.max(held ?? 0, grown ?? 0);
		}
		for (const [a, b, extent] of [
			['left', 'right', width],
			['top', 'bottom', height]
		] as const) {
			PlotMargins.#keepContent(out, [a, b], extent, author, estimate);
		}
		return out;
	});

	/** The share of a box's extent its margins always leave to the plot's own area. */
	static readonly #MIN_CONTENT = 0.25;

	/**
	 * Cuts the growth of two opposite sides of `out`, in proportion, until they
	 * leave the plot's area its minimum share of `extent` - a negative area makes
	 * svelteplot draw marks with negative sizes. A side never goes below the
	 * estimate, and a side the author fixed is left alone.
	 */
	static #keepContent(
		out: Partial<Record<MarginSide, number>>,
		sides: [MarginSide, MarginSide],
		extent: number,
		author: MarginConfig | undefined,
		estimate: Margins
	): void {
		const fixed = (side: MarginSide) => {
			const own = author?.[side];
			return typeof own === 'number' ? own : estimate[side];
		};
		const used = (side: MarginSide) => out[side] ?? fixed(side);
		const over = used(sides[0]) + used(sides[1]) - extent * (1 - PlotMargins.#MIN_CONTENT);
		const room = sides.map((side) =>
			out[side] === undefined ? 0 : Math.max(0, out[side] - estimate[side])
		);
		const total = room[0] + room[1];
		if (over <= 0 || total <= 0) return;
		const cut = Math.min(over, total);
		sides.forEach((side, i) => {
			if (out[side] !== undefined) out[side] -= (cut * room[i]) / total;
		});
	}

	/** The author's margins, with the room labels need. */
	readonly #labels = $derived.by((): MarginConfig | undefined => {
		const author = this.#inputs.author();
		const grown = this.#grown;
		return author === undefined && Object.keys(grown).length === 0
			? undefined
			: { ...author, ...grown };
	});

	/**
	 * How much more room (or less) each axis' rotated tick labels take across
	 * it, on its side. An x label stands as tall as its text, a y label as wide;
	 * rotated, it reaches across by its turned box.
	 */
	readonly #tickRoom = $derived.by(() => {
		const scales = this.#inputs.scales();
		const height = this.#inputs.tickFontSize();
		const measured = this.#inputs.tickWidth?.();
		const room: Partial<Record<MarginSide, number>> = {};
		for (const axis of ['x', 'y'] as const) {
			const degrees = scales?.[axis]?.tickRotate;
			if (!degrees) continue;
			// A label is taken as twice as wide as its font size, unless the plot measured it.
			const width = measured?.[axis] || 2 * height;
			const rad = (degrees * Math.PI) / 180;
			const [across, along] = axis === 'x' ? [height, width] : [width, height];
			const turned = Math.abs(Math.cos(rad)) * across + Math.abs(Math.sin(rad)) * along;
			room[TICK_SIDES[axis]] = Math.ceil(turned - across);
		}
		return room;
	});

	/** What svelteplot's `<Plot margin>` takes. */
	readonly config = $derived.by((): MarginConfig => {
		const base = { ...this.#inputs.theme(), ...this.#labels };
		const pinned = this.#cell?.pinned;
		if (pinned) return { ...base, ...pinned.toJSON() };
		// A fixed side makes room for its rotated tick labels; an `'auto'` one fits them itself.
		const out = { ...base };
		for (const [side, room] of Object.entries(this.#tickRoom) as [MarginSide, number][]) {
			const own = out[side];
			if (typeof own === 'number') out[side] = Math.max(0, own + room);
		}
		return out;
	});

	/** {@link config} as numbers, an `'auto'` side read as the plot's estimate. */
	readonly numeric = $derived.by(() => Margins.resolve(this.config, this.#inputs.estimate()));

	/** The plot's whole box, in pixels. */
	readonly box = $derived.by(() => {
		const { width, height } = this.#inputs.size();
		return Box.size(width, height);
	});

	/** The plot's own area, in pixels: what its margins leave inside its box. */
	readonly contentBox = $derived.by(() => this.numeric.contentBox(this.box.width, this.box.height));

	/**
	 * Where something of `size` sits next to `point`, on its preferred side
	 * per axis, without leaving the plot's box - see {@link Box.placeNear}.
	 */
	place(size: Box, point: { x: number; y: number }, anchor: BoxAnchors): Box {
		return size.placeNear(point, anchor, this.box);
	}
}
