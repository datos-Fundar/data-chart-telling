import { MARK_EVENTS } from '$lib/types/markers/channels/commonMarkerEvents';
import type {
	CommonMarkerEvents,
	MarkEventHandler,
	MarkEventName
} from '$lib/types/markers/channels/commonMarkerEvents';

/** What svelteplot's marks are given for a marker's events. */
export type MarkerEventProps = Partial<Record<MarkEventName, MarkEventHandler>>;

/**
 * The events of a marker, as the props of the svelteplot mark that draws it: the handlers it is given
 * (`onclick`, `onpointerenter`...). Every marker takes them from `CommonMarkerConfig`, so each one only has to
 * spread {@link MarkerEvents.props} on its mark.
 */
export class MarkerEvents {
	readonly #marker: () => CommonMarkerEvents;

	private constructor(marker: () => CommonMarkerEvents) {
		this.#marker = marker;
	}

	/** The events of the marker `marker` reads. */
	static use(marker: () => CommonMarkerEvents): MarkerEvents {
		return new MarkerEvents(marker);
	}

	/** Whether the marker has a handler for any event. */
	get any(): boolean {
		const marker = this.#marker();
		return MARK_EVENTS.some((name) => !!marker[name]);
	}

	/**
	 * The handlers as DOM listeners of the shape drawn for `row` (the `index`-th), for a marker that draws
	 * its shapes itself rather than through a svelteplot mark that wires them up.
	 */
	forRow(row: unknown, index: number): Partial<Record<MarkEventName, (event: Event) => void>> {
		const marker = this.#marker();
		const own: Partial<Record<MarkEventName, (event: Event) => void>> = {};
		for (const name of MARK_EVENTS) {
			const handler = marker[name];
			if (handler) own[name] = (event) => handler(event, row, index);
		}
		return own;
	}

	/** The props to spread on the marker's svelteplot mark. Read in the template, so it follows the marker. */
	get props(): MarkerEventProps {
		const marker = this.#marker();
		const own: MarkerEventProps = {};
		for (const name of MARK_EVENTS) if (marker[name]) own[name] = marker[name];
		return own;
	}
}
