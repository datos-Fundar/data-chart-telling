/** The events a mark can be given a handler for, as svelteplot's own marks name them. */
export const MARK_EVENTS = [
	'onclick',
	'ondblclick',
	'oncontextmenu',
	'onpointerdown',
	'onpointerup',
	'onpointerenter',
	'onpointerleave',
	'onpointermove',
	'onmouseenter',
	'onmouseleave'
] as const;

/** The name of an event a mark takes a handler for. */
export type MarkEventName = (typeof MARK_EVENTS)[number];

/**
 * A handler of an event on one of a mark's shapes: the event, the row the shape draws and
 * that row's index - as svelteplot's marks call it.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MarkEventHandler = (event: Event, row: any, index: number) => void;

/**
 * Handlers a marker passes on to the shapes svelteplot draws for it. svelteplot documents these props on every
 * mark (`BaseMarkProps`), and every marker hands them on; svelteplot's code wires them up on some marks only
 * today (`Rect`, `Bar`, `Cell`, `Area`, `Arrow`, `Dot`, `Trail`, `Vector`, `Geo`, `Line`, `Link`,
 * `DelaunayLink` and `Voronoi`), so on the others they do nothing yet - they will, whenever svelteplot's code
 * catches up.
 */
export type CommonMarkerEvents = Partial<Record<MarkEventName, MarkEventHandler>>;
