function isPrimitive(v: unknown): boolean {
	return v === null || typeof v !== 'object' || v instanceof RegExp || v instanceof Date;
}

// Arrays longer than this are previewed as their first few items + an
// ellipsis marker instead of being fully stringified, applied recursively.
const MAX_ARRAY_PREVIEW = 3;
const ARRAY_PREVIEW_COUNT = 1;

/** A key as an object literal writes it: bare when it is an identifier, else quoted (`'Quintile 1'`, `'a-b'`). */
function key(name: string): string {
	return /^[A-Za-z_$][\w$]*$/.test(name)
		? name
		: `'${name.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function serialize(v: unknown, depth = 0): string {
	const pad = '  '.repeat(depth);
	const inner = '  '.repeat(depth + 1);

	// Functions: arrow functions show their source, re-indented to where they sit; other multi-line functions
	// (e.g. Svelte components) show just the name.
	if (typeof v === 'function') {
		const fn = v as (() => void) & { displayName?: string; __name?: string };
		const src = fn.toString().trim().replace(/\t/g, '  ');
		if (!src.includes('\n')) return src;
		if (src.startsWith('function') || src.startsWith('class') || !src.includes('=>')) {
			return fn.displayName || fn.__name || fn.name || 'Component';
		}
		const [first, ...rest] = src.split('\n');
		const indent = Math.min(
			...rest.filter((line) => line.trim()).map((line) => line.length - line.trimStart().length)
		);
		return [first, ...rest.map((line) => (line.trim() ? pad + line.slice(indent) : ''))].join('\n');
	}

	if (v instanceof RegExp) return String(v);

	// A date as the code that makes it, in local time: its time only when it has one.
	if (v instanceof Date) {
		const parts = [v.getFullYear(), v.getMonth(), v.getDate()];
		const time = [v.getHours(), v.getMinutes(), v.getSeconds()];
		const shown = time.some(Boolean) ? [...parts, ...time] : parts;
		return `new Date(${shown.join(', ')})`;
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
			return `{ ${entries.map(([k, val]) => `${key(k)}: ${serialize(val)}`).join(', ')} }`;
		}
		const lines = entries
			.map(([k, val]) => `${inner}${key(k)}: ${serialize(val, depth + 1)}`)
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
