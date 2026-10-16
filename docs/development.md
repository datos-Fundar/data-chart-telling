# Development

The repository uses [pnpm](https://pnpm.io).

```bash
pnpm install
```

## Checks

| Command                   | Does                                                             |
| ------------------------- | ---------------------------------------------------------------- |
| `pnpm check`              | `svelte-check` over `src/`, `stories/`, `tests/` and `examples/` |
| `pnpm lint`               | Prettier check and ESLint                                        |
| `pnpm check:unused-types` | Finds exported types nothing uses                                |
| `pnpm build`              | Packages the library into `dist/` with `svelte-package`          |

## Git hooks

[Husky](https://typicode.github.io/husky) installs the hooks on `pnpm install`:

- `pre-commit` runs `pnpm lint` (Prettier check and ESLint over the whole project) and `pnpm check`.
- `pre-push` runs `pnpm test`, the node and browser suites.

`git commit --no-verify` and `git push --no-verify` skip them. `pnpm format` fixes what the Prettier check reports.

## Tests

```bash
pnpm test                              # node unit tests and real-browser component tests
pnpm vitest run --project=unit         # node only: pure logic, no browser
pnpm vitest run --project=browser      # browser only: components in Chromium via Playwright
pnpm test:stories                      # every story as a test (boots Storybook internally)
```

- Component tests must end in `.svelte.test.ts`; that suffix is what routes a file to the browser project.
- Browser tests render with `vitest-browser-svelte`. A dot renders as a `<path>`, not a `<circle>`; styles live in the `style` attribute.
- `tests/unit/docs` and `tests/unit/examples.svelte.test.ts` guard the LLM-facing docs: every example mounts, and the links and exports named in `llms.txt` and `llms-full.txt` exist.

## Storybook

```bash
pnpm storybook         # http://localhost:6006
pnpm build-storybook   # static build
```

Every option has a story under `stories/`, grouped as Plots, Markers, Transforms, Channels, Layout, Composition and Configuration. A story that calls `setConfiguration` runs in its own iframe on docs pages (`docs.story.inline: false`) so it does not leak into its neighbours.

## Examples and LLM docs

- `examples/` holds small runnable components that import from the package name (aliased to `src/lib/index.ts` in `tsconfig.json` and `vite.config.ts`). They are type-checked by `pnpm check` and shipped in the package.
- `llms.txt` is the index and `llms-full.txt` the single-file guide, both shipped. Update them, and add an example, when a public prop is added or changed.

## Documentation figures

Every screenshot in the docs is a real component in `scripts/docs-figures/figures/`, type-checked by `pnpm check` and rendered by Playwright:

```bash
pnpm docs:images               # regenerate docs/images/*.png
pnpm docs:images tooltip scales   # only these figures
```

A figure can set `export const meta = { hover: { x, y } }` in a `<script module>` block to rest the pointer before the shot. The data is synthetic and deterministic (`scripts/docs-figures/data.ts`), and axes are set to English. `docs/images` is left out of the npm package.

## Continuous integration

GitHub Actions runs on every pull request and on pushes to `main`:

- `CI` lints, type-checks and builds, then runs the node and browser suites with coverage. The coverage summary is commented on the pull request, or shown in the workflow summary when it is too long, and the raw reports are uploaded as the `coverage` artifact.
- `CodeQL` scans the code for security issues, and also runs weekly.

`main` is protected: changes land through a pull request with the `CI` checks passing.

## Publishing

Releases are published to npm by the `Release` workflow, with [trusted publishing](https://docs.npmjs.com/trusted-publishers), so no npm token is stored in the repository.

1. In a branch, bump the version and update `CHANGELOG.md`:

   ```bash
   pnpm version <major|minor|patch> --no-git-tag-version
   ```

2. Open a pull request, wait for the checks and merge it.
3. Create a GitHub Release on `main` with the tag `v<version>`.

Publishing the release runs the `Release` workflow: it checks that the tag matches `version` in `package.json`, runs lint, type check and tests, and publishes. `prepack` runs `svelte-package` and `publint`, so a publish always ships a clean build. The package ships `dist/`, `examples/`, `llms.txt` and `llms-full.txt`.

To inspect what would be uploaded without publishing:

```bash
pnpm build
pnpm pack
```
