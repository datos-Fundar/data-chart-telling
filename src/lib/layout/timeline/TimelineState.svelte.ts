import { getContext, setContext, untrack } from 'svelte';
import { getConfiguration } from '$lib/configuration/config.svelte';
import { TimelineSteps } from '$lib/layout/timeline/TimelineSteps';
import { TimelineTime } from '$lib/layout/timeline/TimelineTime';
import type {
	PlayerConfig,
	PlayerControl,
	Orientation,
	TimeInput,
	TimeValue,
	TimelineStep,
	TimelineCallbacks,
	TimelineType
} from '$lib/types/layout/timeline';

const TIMELINE_KEY = Symbol('dct-timeline');

/** The longest a frame counts for while playing, so a hidden tab doesn't jump ahead when it comes back. */
const MAX_FRAME_MS = 250;

/** What a {@link TimelineState} reads from the timeline's owner, each time it needs it. */
export type TimelineSettings = TimelineCallbacks & {
	type?: TimelineType;
	player?: PlayerConfig;
	progress?: number;
	values?: TimeInput[];
	/** How a non-ISO date string in `values` reads. */
	dateFormat?: string;
	show?: boolean;
	orientation?: Orientation;
	thickness?: number;
};

/**
 * One figure's timeline: where it is across its steps, and whether it is
 * playing, looping and how fast. Shared by everything in the figure - the
 * plots that slice their rows by it, the player bar that draws it, and what
 * the user builds with `useFigure().timeline`.
 *
 * The position is the owner's `progress` until the player (or a reader)
 * moves it; from then on it is theirs, until the owner's `progress` changes.
 * Create it during component init and call {@link watch} there.
 */
export class TimelineState {
	readonly #settings: () => TimelineSettings | undefined;
	#steps = $state<TimeValue[]>([]);
	#temporal = $state(false);
	#own = $state<{ base: number; value: number } | null>(null);
	#playing = $state(false);
	#loop = $state(false);
	#speed = $state(1);

	constructor(settings: () => TimelineSettings | undefined) {
		this.#settings = settings;
		untrack(() => {
			this.#loop = settings()?.player?.loop ?? false;
			this.#speed = settings()?.player?.speed ?? 1;
		});
	}

	/** The enclosing figure's timeline, or `null` outside one. Call during component init. */
	static current(): TimelineState | null {
		return getContext<TimelineState | undefined>(TIMELINE_KEY) ?? null;
	}

	/** Makes `state` the timeline of everything below. Call during component init. */
	static provide(state: TimelineState): TimelineState {
		setContext(TIMELINE_KEY, state);
		return state;
	}

	/** Whether its owner set a timeline at all. */
	get enabled(): boolean {
		return this.#settings() !== undefined;
	}

	get type(): TimelineType {
		return this.#settings()?.type ?? 'player';
	}

	/** Which way a `'rule'` runs; a `'player'` is always horizontal. */
	get orientation(): Orientation {
		return this.type === 'player' ? 'horizontal' : (this.#settings()?.orientation ?? 'vertical');
	}

	/** How much room a `'rule'` takes across, in px. */
	get thickness(): number {
		return this.#settings()?.thickness ?? getConfiguration().timeline.thickness;
	}

	/** Whether the owner wants it drawn. */
	get shown(): boolean {
		return this.#settings()?.show !== false;
	}

	/** The steps it moves across, ascending: the owner's `values`, else those its plots report. */
	get steps(): TimeValue[] {
		const values = this.#ownerValues;
		return values ? new TimelineSteps(values).values : this.#steps;
	}

	/** Whether the steps are dates. */
	get temporal(): boolean {
		const settings = this.#settings();
		if (!settings?.values?.length) return this.#temporal;
		return new TimelineTime(settings.dateFormat).isTemporal(settings.values);
	}

	/** Reports the steps the plots found in their rows, and whether they are dates. */
	setSteps(values: TimeValue[], temporal = false): void {
		const same =
			values.length === this.#steps.length && values.every((v, i) => v === this.#steps[i]);
		if (!same) this.#steps = values;
		if (temporal !== this.#temporal) this.#temporal = temporal;
	}

	/** The owner's `values` as steps, or `undefined` without any. */
	get #ownerValues(): TimeValue[] | undefined {
		const settings = this.#settings();
		if (!settings?.values?.length) return undefined;
		const time = new TimelineTime(settings.dateFormat);
		return settings.values
			.map((value) => time.toTime(value))
			.filter((value): value is TimeValue => value !== undefined);
	}

	/** The position across the steps, `0`-`1`. */
	get progress(): number {
		const external = this.#settings()?.progress ?? 0;
		return this.#own && this.#own.base === external ? this.#own.value : external;
	}

	/** The step the position lands on, as an index; `-1` without steps. */
	get index(): number {
		const count = this.steps.length;
		return count === 0 ? -1 : Math.min(count - 1, Math.round(this.progress * (count - 1)));
	}

	/** The step the position lands on, or `undefined` without steps. */
	get value(): TimeValue | undefined {
		return this.steps[this.index];
	}

	get playing(): boolean {
		return this.#playing;
	}

	get loop(): boolean {
		return this.#loop;
	}

	/** The playing speed, as a multiple of {@link stepDuration}. */
	get speed(): number {
		return this.#speed;
	}

	/** The controls the player bar draws, in order. */
	get controls(): PlayerControl[] {
		return this.#settings()?.player?.controls ?? getConfiguration().timeline.player.controls;
	}

	/** The speeds the speed control cycles through. */
	get speeds(): number[] {
		return this.#settings()?.player?.speeds ?? getConfiguration().timeline.player.speeds;
	}

	/** Milliseconds each step lasts at speed `1`. */
	get stepDuration(): number {
		return (
			this.#settings()?.player?.stepDuration ?? getConfiguration().timeline.player.stepDuration
		);
	}

	/** How a step reads: the player's `format`, else a date label or the number. */
	get format(): (value: TimeValue) => string {
		const own = this.#settings()?.player?.format;
		if (own) return (value) => own(this.step(value));
		if (this.temporal) return TimelineTime.dateLabel(this.steps, getConfiguration().axis.locale);
		return (value) => String(value);
	}

	/** A step as authors see it. */
	step(value: TimeValue): TimelineStep {
		return TimelineTime.toStep(value, this.temporal);
	}

	/** An author's step as the timeline's own, or `undefined` when it reads as none. */
	timeOf(value: TimeInput): TimeValue | undefined {
		return new TimelineTime(this.#settings()?.dateFormat).toTime(value);
	}

	/** Moves to `progress` (`0`-`1`), and tells the owner. */
	seek(progress: number): void {
		const next = Math.min(1, Math.max(0, progress));
		if (next === this.progress) return;
		this.#own = { base: this.#settings()?.progress ?? 0, value: next };
		this.#settings()?.onprogress?.(next);
	}

	/** Moves to the step at `index`. */
	seekIndex(index: number): void {
		const count = this.steps.length;
		this.seek(count > 1 ? Math.min(count - 1, Math.max(0, index)) / (count - 1) : 0);
	}

	/** Moves to the step closest to `value`. */
	seekValue(value: TimeValue): void {
		const nearest = new TimelineSteps(this.steps).nearest(value);
		if (nearest !== undefined) this.seekIndex(this.steps.indexOf(nearest));
	}

	next(): void {
		this.seekIndex(this.index + 1);
	}

	previous(): void {
		this.seekIndex(this.index - 1);
	}

	play(): void {
		if (this.#playing || this.steps.length < 2) return;
		if (this.progress >= 1) this.seek(0);
		this.#playing = true;
		this.#settings()?.player?.onplay?.(true);
	}

	pause(): void {
		if (!this.#playing) return;
		this.#playing = false;
		this.#settings()?.player?.onplay?.(false);
	}

	toggle(): void {
		if (this.#playing) this.pause();
		else this.play();
	}

	setLoop(loop: boolean): void {
		if (loop === this.#loop) return;
		this.#loop = loop;
		this.#settings()?.player?.onloop?.(loop);
	}

	setSpeed(speed: number): void {
		if (!(speed > 0) || speed === this.#speed) return;
		this.#speed = speed;
		this.#settings()?.player?.onspeed?.(speed);
	}

	/** Takes the next of `speeds` after the current one, from the first again after the last. */
	cycleSpeed(): void {
		const { speeds } = this;
		if (speeds.length === 0) return;
		const at = speeds.indexOf(this.#speed);
		this.setSpeed(speeds[(at + 1) % speeds.length]);
	}

	/**
	 * Moves the position on by `elapsed` milliseconds of playing. At the end it
	 * starts again from the first step when looping, and stops otherwise.
	 */
	advance(elapsed: number): void {
		const count = this.steps.length;
		if (!this.#playing || count < 2) return;
		const span = (this.stepDuration / this.#speed) * (count - 1);
		const next = this.progress + Math.min(elapsed, MAX_FRAME_MS) / span;
		if (next < 1) return this.seek(next);
		if (this.#loop) return this.seek(next - 1);
		this.seek(1);
		this.pause();
	}

	/** Starts what the timeline does by itself: playing, the owner's `onvalue` and `autoplay`. Call during component init. */
	watch(): void {
		let last: TimeValue | undefined;
		$effect(() => {
			const value = this.value;
			untrack(() => {
				if (last !== undefined && value !== undefined && value !== last) {
					this.#settings()?.onvalue?.(this.step(value));
				}
				last = value;
			});
		});

		let autoplayed = false;
		$effect(() => {
			if (autoplayed || this.steps.length < 2) return;
			autoplayed = true;
			if (untrack(() => this.#settings()?.player?.autoplay)) untrack(() => this.play());
		});

		$effect(() => {
			if (!this.#playing) return;
			let frame = 0;
			let previous = performance.now();
			const tick = (now: number) => {
				untrack(() => this.advance(now - previous));
				previous = now;
				frame = requestAnimationFrame(tick);
			};
			frame = requestAnimationFrame(tick);
			return () => cancelAnimationFrame(frame);
		});
	}
}
