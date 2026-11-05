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

	/** The props to spread on the marker's svelteplot mark. Read in the template, so it follows the marker. */
	get props(): MarkerEventProps {
		const marker = this.#marker();
		const own: MarkerEventProps = {};
		for (const name of MARK_EVENTS) if (marker[name]) own[name] = marker[name];
		return own;
	}
}
