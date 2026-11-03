# Third-Party Licenses & Source Information

This document inventories third-party software distributed with, or bundled
into, the ChessBharat Chess Game plugin. It is maintained as components are
added across build phases.

> Status: **Phase 1.** The Stockfish engine files are integrated in **Phase 3**;
> this document already records the verified plan for them so the licensing
> approach is reviewable now. Nothing in `assets/engine/` is shipped yet.

---

## 1. Bundled into the compiled frontend (`assets/dist/chessbharat.js`)

These libraries are compiled into the JavaScript bundle shipped to browsers.

| Library | Version | License | Role |
|---|---|---|---|
| React | 19.3.1 | MIT | UI runtime |
| React DOM | 19.3.1 | MIT | UI runtime |
| chess.js | 1.4.0 | BSD-2-Clause | Chess rules/validation (runtime use begins Phase 2) |

MIT and BSD-2-Clause are permissive licenses; their notices are retained in the
project's `frontend/node_modules` during development and will be reproduced in
full in this file's appendix as each becomes part of the shipped bundle.

## 2. Build-time only (NOT shipped to production)

Vite, TypeScript, `@vitejs/plugin-react`, Vitest and type packages are used to
compile the frontend and are **not** distributed in the plugin ZIP or loaded on
the production server.

## 3. Chess engine — Stockfish (planned, Phase 3)

- **Component:** Stockfish 19 Lite, single-threaded WebAssembly build.
- **Distribution source:** npm package [`stockfish`](https://www.npmjs.com/package/stockfish)
  **19.0.1** (the `nmrugg/stockfish.js` project,
  <https://github.com/nmrugg/stockfish.js/>).
- **Files to be shipped** in `assets/engine/`:
  - `stockfish-19-lite-single.js` (Emscripten glue)
  - `stockfish-19-lite-single.wasm` (~1.8 MB)
- **License:** **GNU General Public License v3.0 (GPL-3.0)**.
- **Verified:** package downloaded and inspected during Phase 0; the Lite-single
  build requires no cross-origin isolation (COOP/COEP) headers. The full build
  (`stockfish-19.wasm`, ~94.6 MB) is **not** shipped or loaded.

### GPL-3.0 obligations (to be satisfied before the engine is shipped)

1. Include the full text of the GPL-3.0 license in this repository.
2. Reproduce Stockfish's copyright and attribution notices.
3. Provide the **corresponding source** for the exact distributed engine build
   (the upstream Stockfish source plus the `nmrugg/stockfish.js` wrapper), or a
   written offer/link to it, alongside the binary.
4. Record the exact version, file names, sizes and (where practical) checksums.

> ⚠️ **Open legal question flagged for review.** Placing the GPL-3.0 engine in a
> separate folder does not by itself determine the license obligations of the
> surrounding plugin code. The distribution approach is documented here and
> flagged for the maintainer / legal review before release. The plugin's own
> code is licensed GPL-3.0-or-later, which is compatible.

---

## Appendix: full license texts

To be appended as each shipped component is finalized (MIT ×2, BSD-2-Clause,
and the complete GPL-3.0 text for the engine in Phase 3).
