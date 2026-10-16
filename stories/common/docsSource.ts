function isPrimitive(v: unknown): boolean {
	return v === null || typeof v !== 'object';
}

// Arrays longer than this are previewed as their first few items + an
// ellipsis marker instead of being fully stringified, applied recursively.
const MAX_ARRAY_PREVIEW = 3;
const ARRAY_PREVIEW_COUNT = 1;

function serialize(v: unknown, depth = 0): string {
	const pad = '  '.repeat(depth);
	const inner = '  '.repeat(depth + 1);

	// Functions: short arrow functions show their source; multi-line functions
	// (e.g. Svelte components) show just the name.
	if (typeof v === 'function') {
		const fn = v as (() => void) & { displayName?: string; __name?: string };
		const src = fn.toString().trim();
		if (src.includes('\n')) return fn.displayName || fn.__name || fn.name || 'Component';
		return src;
	}

	if (typeof v === 'string') return `'${v}'`;
	if (typeof v === 'number' || typeof v === 'boolean') return String(v);

	if (Array.isArray(v)) {
		if (v.length === 0) return '[]';
		const truncated = v.length > MAX_ARRAY_PREVIEW;
		const shown = truncated ? v.slice(0, ARRAY_PREVIEW_COUNT) : v;
		const remaining = v.length - shown.length;
		if (v.every(isPrimitive)) {
			const rendered = shown.map((i) => serialize(i, depth));
			if (truncated) rendered.push(`/* …${remaining} more */`);
			return `[${rendered.join(', ')}]`;
		}
		const items = shown.map((i) => `${inner}${serialize(i, depth + 1)}`);
		if (truncated) items.push(`${inner}/* …${remaining} more */`);
		return `[\n${items.join(',\n')}\n${pad}]`;
	}

	if (v !== null && typeof v === 'object') {
		const entries = Object.entries(v as Record<string, unknown>);
		if (entries.length === 0) return '{}';
		if (entries.every(([, val]) => isPrimitive(val))) {
			return `{ ${entries.map(([k, val]) => `${k}: ${serialize(val)}`).join(', ')} }`;
		}
		const lines = entries
			.map(([k, val]) => `${inner}${k}: ${serialize(val, depth + 1)}`)
			.join(',\n');
		return `{\n${lines}\n${pad}}`;
	}

	return JSON.stringify(v);
}

/**
 * Builds the `<Name\n  prop={...}\n/>` source string `.storybook/preview.ts`'s
 * global `docs.source.transform` derives automatically from a story's
 * `component`/`args`. A story that instead renders through a wrapper
 * component can call this directly to override `parameters.docs.source.code`
 * with the real underlying invocation - see `CameraTransitionDemo`'s
 * `<script module>` export for the pattern.
 */
export function renderSource(name: string, props: Record<string, unknown>): string {
	const lines = Object.entries(props).map(([k, v]) => `  ${k}={${serialize(v, 1)}}`);
	return lines.length ? `<${name}\n${lines.join('\n')}\n/>` : `<${name} />`;
}

/**
 * `parameters` that show a demo component's own source (imported with
 * `?raw`) in its Docs panel - for a story rendered through a demo whose markup
 * `renderSource` can't rebuild from args (snippets, several plots, state).
 * Set it on each story's `parameters`: on the meta it's lost, since Storybook
 * gives every story a `docs.source` of its own.
 */
export function demoSource(raw: string) {
	return { docs: { source: { code: raw.trim().replace(/\t/g, '  '), language: 'html' } } };
}
