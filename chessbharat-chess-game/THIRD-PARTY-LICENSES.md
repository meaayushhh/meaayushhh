# Third-Party Licenses & Source Information

This document inventories third-party software distributed with, or bundled
into, the ChessBharat Chess Game plugin. It is maintained as components are
added across build phases.

> Status: **Phase 3.** The Stockfish 19 Lite engine is now bundled in
> `assets/engine/` and runs in a Web Worker. Its full GPL-3.0 license text and
> upstream README are shipped alongside the binaries (see §3).

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

## 1b. Bundled fonts (shipped as woff2 in the compiled bundle)

| Font | Weights | License |
|---|---|---|
| League Spartan | 600, 700 | SIL Open Font License 1.1 |
| Barlow | 400, 500, 600, 700 | SIL Open Font License 1.1 |

Both are open-source fonts bundled locally (no runtime font-CDN dependency).
The SIL OFL permits bundling and redistribution; font files retain their
original license.

## 2. Build-time only (NOT shipped to production)

Vite, TypeScript, `@vitejs/plugin-react`, Vitest and type packages are used to
compile the frontend and are **not** distributed in the plugin ZIP or loaded on
the production server.

## 3. Chess engine — Stockfish (shipped)

- **Component:** Stockfish 19 Lite, single-threaded WebAssembly build.
- **Distribution source:** npm package [`stockfish`](https://www.npmjs.com/package/stockfish)
  **19.0.1** (the `nmrugg/stockfish.js` project,
  <https://github.com/nmrugg/stockfish.js/>), built from upstream Stockfish
  (<https://github.com/official-stockfish/Stockfish>).
- **Files shipped** in `assets/engine/`:

  | File | Size | SHA-256 |
  |---|---|---|
  | `stockfish-19-lite-single.js` | 28,230 B | `ccb130d7ff29408531c47d859a49f91d59d4f482d05a53eb1a3231a4f624c91a` |
  | `stockfish-19-lite-single.wasm` | 1,845,971 B | `ee4f115bdb2d32cadf96cada104a05b5ec257d7ad6f57582190b49bc71f096de` |
  | `STOCKFISH-COPYING.txt` | GPL-3.0 full text | — |
  | `STOCKFISH-README.md` | upstream usage/notes | — |

- **License:** **GNU General Public License v3.0 (GPL-3.0)**. The full text is
  shipped at `assets/engine/STOCKFISH-COPYING.txt`.
- **Runtime:** runs in a classic Web Worker, driven over UCI. The Lite-single
  build requires **no cross-origin isolation (COOP/COEP) headers**. The full
  build (`stockfish-19.wasm`, ~94.6 MB) is **not** shipped or loaded.

### GPL-3.0 obligations — status

1. ✅ Full GPL-3.0 license text included (`assets/engine/STOCKFISH-COPYING.txt`).
2. ✅ Stockfish attribution + upstream notes included (`STOCKFISH-README.md`).
3. **Corresponding source:** the exact distributed build comes from `stockfish`
   **19.0.1** on npm / the `nmrugg/stockfish.js` v19.0.1 release
   (<https://github.com/nmrugg/stockfish.js/releases/tag/v19.0.1>), which builds
   from upstream Stockfish source. This written offer + links constitute the
   corresponding-source information; a source mirror can be bundled on request.
4. ✅ Exact version, file names, sizes and SHA-256 checksums recorded above.

> ⚠️ **Open legal question flagged for review.** Placing the GPL-3.0 engine in a
> separate folder does not by itself determine the license obligations of the
> surrounding plugin code. The plugin's own code is licensed GPL-3.0-or-later
> (compatible). The distribution approach is documented here and flagged for
> maintainer / legal review before public release.

### Deployment note (for Cowork)

The server must serve `.wasm` with the `application/wasm` MIME type and allow
the Web Worker script to load. Modern WordPress hosts do this by default; some
hardened hosts or security plugins block `.wasm`/worker files and may need a
MIME/allow rule. This is covered in the deployment checklist.

---

## Appendix: full license texts

To be appended as each shipped component is finalized (MIT ×2, BSD-2-Clause,
and the complete GPL-3.0 text for the engine in Phase 3).
