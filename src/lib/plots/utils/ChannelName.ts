/** The name a channel reads under on a legend, taken from the function that computes it. */
export class ChannelName {
	/**
	 * `channel`'s own name, when it is a function with one worth showing: not
	 * anonymous, and not the name of the property it was assigned to (`color`
	 * for a `color: (d) => ...`), which says nothing a legend doesn't.
	 */
	static of(channel: unknown, property: string): string | undefined {
		if (typeof channel !== 'function') return undefined;
		const name = channel.name;
		return name && name !== property && name !== 'anonymous' ? name : undefined;
	}
}
