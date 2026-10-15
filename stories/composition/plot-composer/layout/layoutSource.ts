import type { ComposerLayout, ComposerTags } from '$lib/types/layout/composer';

const literal = (v: unknown): string =>
	Array.isArray(v)
		? `[${v.map(literal).join(', ')}]`
		: typeof v === 'string'
			? `'${v}'`
			: String(v);

type DemoArgs = {
	layout?: ComposerLayout;
	panels: (string | undefined)[];
	tags?: ComposerTags;
	width?: number;
	height?: number;
};

/** The `PlotComposer` markup a `LayoutDemo` renders, for a story's Docs panel. */
export function layoutSource({ layout, panels, tags, width = 720, height = 320 }: DemoArgs) {
	const entries = Object.entries(layout ?? {}).map(([k, v]) => `${k}: ${literal(v)}`);
	const props = [
		`width={${width}}`,
		`height={${height}}`,
		...(layout ? [`layout={{ ${entries.join(', ')} }}`] : []),
		...(tags ? [`tags=${typeof tags === 'string' ? `"${tags}"` : `{${literal(tags)}}`}`] : [])
	];
	const body = panels
		.map((area) => `  <!-- any plot -->\n` + `  <LinePlot${area ? ` area="${area}"` : ''} … />`)
		.join('\n');
	return {
		docs: {
			source: {
				code: `<PlotComposer ${props.join(' ')}>\n${body}\n</PlotComposer>`,
				language: 'html'
			}
		}
	};
}
